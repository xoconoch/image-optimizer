import type { PluggableList, Plugin } from "unified";
import type { Root as MdastRoot, Image } from "mdast";
import type { Root as HastRoot, Element } from "hast";
import { visit } from "unist-util-visit";
import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";
import type {
  QuartzTransformerPluginInstance,
  QuartzEmitterPluginInstance,
  FilePath,
} from "@quartz-community/types";
import type { ImageOptimizerOptions } from "./types";

const defaultOptions: ImageOptimizerOptions = {
  quality: 80,
  effort: 4,
  format: "webp",
  extensions: ["png", "jpg", "jpeg", "webp", "tiff"],
};

const isRemote = (url: string): boolean => {
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("//")
  );
};

const rewriteUrl = (url: string, options: ImageOptimizerOptions): string => {
  if (isRemote(url)) return url;

  // Split into path and query/hash to preserve them (e.g. ?width=300)
  const hashIdx = url.indexOf("#");
  const queryIdx = url.indexOf("?");
  let splitIdx = -1;
  if (hashIdx !== -1 && queryIdx !== -1) {
    splitIdx = Math.min(hashIdx, queryIdx);
  } else if (hashIdx !== -1) {
    splitIdx = hashIdx;
  } else if (queryIdx !== -1) {
    splitIdx = queryIdx;
  }

  const basePath = splitIdx !== -1 ? url.substring(0, splitIdx) : url;
  const rest = splitIdx !== -1 ? url.substring(splitIdx) : "";

  const ext = path.extname(basePath).toLowerCase();
  const rawExt = ext.replace(".", "");
  if (options.extensions.includes(rawExt)) {
    const newExt = `.${options.format}`;
    const newBasePath = basePath.substring(0, basePath.length - ext.length) + newExt;
    return newBasePath + rest;
  }
  return url;
};

const remarkImageOptimizer = (options: ImageOptimizerOptions): Plugin<[], MdastRoot> => {
  return () => (tree: MdastRoot) => {
    visit(tree, "image", (node: Image) => {
      node.url = rewriteUrl(node.url, options);
    });
  };
};

const rehypeImageOptimizer = (options: ImageOptimizerOptions): Plugin<[], HastRoot> => {
  return () => (tree: HastRoot) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "img" && node.properties && typeof node.properties.src === "string") {
        node.properties.src = rewriteUrl(node.properties.src, options);
      }
    });
  };
};

async function getFilesRecursively(dir: string, baseDir = dir): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(async (entry) => {
        const res = path.resolve(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name.startsWith(".")) return [];
          return getFilesRecursively(res, baseDir);
        } else {
          return path.relative(baseDir, res);
        }
      }),
    );
    return files.flat();
  } catch {
    return [];
  }
}

const shouldOptimize = async (srcPath: string, destPath: string): Promise<boolean> => {
  try {
    const [srcStat, destStat] = await Promise.all([fs.stat(srcPath), fs.stat(destPath)]);
    return srcStat.mtimeMs > destStat.mtimeMs;
  } catch {
    return true;
  }
};

const optimizeImage = async (
  srcPath: string,
  destPath: string,
  options: ImageOptimizerOptions,
): Promise<void> => {
  await fs.mkdir(path.dirname(destPath), { recursive: true });

  let pipeline = sharp(srcPath);

  switch (options.format) {
    case "webp":
      pipeline = pipeline.webp({ quality: options.quality, effort: options.effort });
      break;
    case "avif":
      pipeline = pipeline.avif({ quality: options.quality, effort: options.effort });
      break;
    case "png":
      pipeline = pipeline.png({ quality: options.quality, effort: options.effort });
      break;
    case "jpeg":
      pipeline = pipeline.jpeg({ quality: options.quality });
      break;
  }

  await pipeline.toFile(destPath);
};

export const ImageOptimizer: (
  userOptions?: Partial<ImageOptimizerOptions>,
) => QuartzTransformerPluginInstance & QuartzEmitterPluginInstance = (
  userOptions?: Partial<ImageOptimizerOptions>,
) => {
  const options = {
    ...defaultOptions,
    ...userOptions,
    extensions: (userOptions?.extensions ?? defaultOptions.extensions).map((ext) =>
      ext.toLowerCase(),
    ),
  };

  return {
    name: "ImageOptimizer",
    markdownPlugins(): PluggableList {
      return [remarkImageOptimizer(options)];
    },
    htmlPlugins(): PluggableList {
      return [rehypeImageOptimizer(options)];
    },
    async emit(ctx, _content, _resources): Promise<FilePath[]> {
      const srcDir = ctx.argv.directory;
      const destDir = ctx.argv.output;

      const allFiles = await getFilesRecursively(srcDir);
      const targetExtensions = options.extensions.map((ext) => `.${ext}`);

      const imageFiles = allFiles.filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return targetExtensions.includes(ext);
      });

      const emittedPaths: FilePath[] = [];

      for (const file of imageFiles) {
        const srcPath = path.join(srcDir, file);
        const ext = path.extname(file);
        const baseNameWithoutExt = file.substring(0, file.length - ext.length);
        const destRelativePath = `${baseNameWithoutExt}.${options.format}`;
        const destPath = path.join(destDir, destRelativePath);

        const needOptimization = await shouldOptimize(srcPath, destPath);
        if (needOptimization) {
          if (ctx.argv.verbose) {
            console.log(`[Image Optimizer] Optimizing: ${file} -> ${destRelativePath}`);
          }
          await optimizeImage(srcPath, destPath, options);
        } else {
          if (ctx.argv.verbose) {
            console.log(`[Image Optimizer] Skipped (cached): ${file}`);
          }
        }
        emittedPaths.push(destPath as FilePath);
      }

      return emittedPaths;
    },
    async *partialEmit(ctx, _content, _resources, changeEvents) {
      const srcDir = ctx.argv.directory;
      const destDir = ctx.argv.output;
      const targetExtensions = options.extensions.map((ext) => `.${ext}`);

      for (const event of changeEvents) {
        const ext = path.extname(event.path).toLowerCase();
        if (!targetExtensions.includes(ext)) {
          continue;
        }

        const isAbsolute = path.isAbsolute(event.path);
        const relativeSrcPath = isAbsolute ? path.relative(srcDir, event.path) : event.path;
        const baseNameWithoutExt = relativeSrcPath.substring(
          0,
          relativeSrcPath.length - ext.length,
        );
        const destRelativePath = `${baseNameWithoutExt}.${options.format}`;
        const destPath = path.join(destDir, destRelativePath);

        if (event.type === "delete") {
          try {
            await fs.unlink(destPath);
            if (ctx.argv.verbose) {
              console.log(`[Image Optimizer] Deleted: ${destRelativePath}`);
            }
          } catch {
            // Ignore error if file doesn't exist
          }
        } else if (event.type === "add" || event.type === "change") {
          const srcPath = isAbsolute ? event.path : path.join(srcDir, event.path);
          const needOptimization = await shouldOptimize(srcPath, destPath);
          if (needOptimization) {
            if (ctx.argv.verbose) {
              console.log(
                `[Image Optimizer] Optimizing (incremental): ${relativeSrcPath} -> ${destRelativePath}`,
              );
            }
            await optimizeImage(srcPath, destPath, options);
          }
          yield destPath as FilePath;
        }
      }
    },
  };
};
