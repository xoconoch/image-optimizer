import { createRequire } from 'module';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { jsx } from 'preact/jsx-runtime';

createRequire(import.meta.url);

// node_modules/unist-util-is/lib/index.js
var convert = (
  // Note: overloads in JSDoc can’t yet use different `@template`s.
  /**
   * @type {(
   *   (<Condition extends string>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & {type: Condition}) &
   *   (<Condition extends Props>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Condition) &
   *   (<Condition extends TestFunction>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Predicate<Condition, Node>) &
   *   ((test?: null | undefined) => (node?: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node) &
   *   ((test?: Test) => Check)
   * )}
   */
  /**
   * @param {Test} [test]
   * @returns {Check}
   */
  (function(test) {
    if (test === null || test === void 0) {
      return ok;
    }
    if (typeof test === "function") {
      return castFactory(test);
    }
    if (typeof test === "object") {
      return Array.isArray(test) ? anyFactory(test) : (
        // Cast because `ReadonlyArray` goes into the above but `isArray`
        // narrows to `Array`.
        propertiesFactory(
          /** @type {Props} */
          test
        )
      );
    }
    if (typeof test === "string") {
      return typeFactory(test);
    }
    throw new Error("Expected function, string, or object as test");
  })
);
function anyFactory(tests) {
  const checks = [];
  let index = -1;
  while (++index < tests.length) {
    checks[index] = convert(tests[index]);
  }
  return castFactory(any);
  function any(...parameters) {
    let index2 = -1;
    while (++index2 < checks.length) {
      if (checks[index2].apply(this, parameters)) return true;
    }
    return false;
  }
}
function propertiesFactory(check) {
  const checkAsRecord = (
    /** @type {Record<string, unknown>} */
    check
  );
  return castFactory(all);
  function all(node) {
    const nodeAsRecord = (
      /** @type {Record<string, unknown>} */
      /** @type {unknown} */
      node
    );
    let key;
    for (key in check) {
      if (nodeAsRecord[key] !== checkAsRecord[key]) return false;
    }
    return true;
  }
}
function typeFactory(check) {
  return castFactory(type);
  function type(node) {
    return node && node.type === check;
  }
}
function castFactory(testFunction) {
  return check;
  function check(value, index, parent) {
    return Boolean(
      looksLikeANode(value) && testFunction.call(
        this,
        value,
        typeof index === "number" ? index : void 0,
        parent || void 0
      )
    );
  }
}
function ok() {
  return true;
}
function looksLikeANode(value) {
  return value !== null && typeof value === "object" && "type" in value;
}

// node_modules/unist-util-visit-parents/lib/color.node.js
function color(d) {
  return "\x1B[33m" + d + "\x1B[39m";
}

// node_modules/unist-util-visit-parents/lib/index.js
var empty = [];
var CONTINUE = true;
var EXIT = false;
var SKIP = "skip";
function visitParents(tree, test, visitor, reverse) {
  let check;
  if (typeof test === "function" && typeof visitor !== "function") {
    reverse = visitor;
    visitor = test;
  } else {
    check = test;
  }
  const is2 = convert(check);
  const step = reverse ? -1 : 1;
  factory(tree, void 0, [])();
  function factory(node, index, parents) {
    const value = (
      /** @type {Record<string, unknown>} */
      node && typeof node === "object" ? node : {}
    );
    if (typeof value.type === "string") {
      const name = (
        // `hast`
        typeof value.tagName === "string" ? value.tagName : (
          // `xast`
          typeof value.name === "string" ? value.name : void 0
        )
      );
      Object.defineProperty(visit2, "name", {
        value: "node (" + color(node.type + (name ? "<" + name + ">" : "")) + ")"
      });
    }
    return visit2;
    function visit2() {
      let result = empty;
      let subresult;
      let offset;
      let grandparents;
      if (!test || is2(node, index, parents[parents.length - 1] || void 0)) {
        result = toResult(visitor(node, parents));
        if (result[0] === EXIT) {
          return result;
        }
      }
      if ("children" in node && node.children) {
        const nodeAsParent = (
          /** @type {UnistParent} */
          node
        );
        if (nodeAsParent.children && result[0] !== SKIP) {
          offset = (reverse ? nodeAsParent.children.length : -1) + step;
          grandparents = parents.concat(nodeAsParent);
          while (offset > -1 && offset < nodeAsParent.children.length) {
            const child = nodeAsParent.children[offset];
            subresult = factory(child, offset, grandparents)();
            if (subresult[0] === EXIT) {
              return subresult;
            }
            offset = typeof subresult[1] === "number" ? subresult[1] : offset + step;
          }
        }
      }
      return result;
    }
  }
}
function toResult(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "number") {
    return [CONTINUE, value];
  }
  return value === null || value === void 0 ? empty : [value];
}

// node_modules/unist-util-visit/lib/index.js
function visit(tree, testOrVisitor, visitorOrReverse, maybeReverse) {
  let reverse;
  let test;
  let visitor;
  if (typeof testOrVisitor === "function" && typeof visitorOrReverse !== "function") {
    test = void 0;
    visitor = testOrVisitor;
    reverse = visitorOrReverse;
  } else {
    test = testOrVisitor;
    visitor = visitorOrReverse;
    reverse = maybeReverse;
  }
  visitParents(tree, test, overload, reverse);
  function overload(node, parents) {
    const parent = parents[parents.length - 1];
    const index = parent ? parent.children.indexOf(node) : void 0;
    return visitor(node, index, parent);
  }
}
var defaultOptions = {
  quality: 80,
  effort: 4,
  format: "webp",
  extensions: ["png", "jpg", "jpeg", "webp", "tiff"]
};
var isRemote = (url) => {
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("//");
};
var rewriteUrl = (url, options) => {
  if (isRemote(url)) return url;
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
var remarkImageOptimizer = (options) => {
  return () => (tree) => {
    visit(tree, "image", (node) => {
      node.url = rewriteUrl(node.url, options);
    });
  };
};
var rehypeImageOptimizer = (options) => {
  return () => (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName === "img" && node.properties && typeof node.properties.src === "string") {
        node.properties.src = rewriteUrl(node.properties.src, options);
      }
    });
  };
};
async function getFilesRecursively(dir, baseDir = dir) {
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
      })
    );
    return files.flat();
  } catch {
    return [];
  }
}
var shouldOptimize = async (srcPath, destPath) => {
  try {
    const [srcStat, destStat] = await Promise.all([fs.stat(srcPath), fs.stat(destPath)]);
    return srcStat.mtimeMs > destStat.mtimeMs;
  } catch {
    return true;
  }
};
var optimizeImage = async (srcPath, destPath, options) => {
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
var ImageOptimizer = (userOptions) => {
  const options = {
    ...defaultOptions,
    ...userOptions,
    extensions: (userOptions?.extensions ?? defaultOptions.extensions).map(
      (ext) => ext.toLowerCase()
    )
  };
  return {
    name: "ImageOptimizer",
    markdownPlugins() {
      return [remarkImageOptimizer(options)];
    },
    htmlPlugins() {
      return [rehypeImageOptimizer(options)];
    },
    async emit(ctx, _content, _resources) {
      const srcDir = ctx.argv.directory;
      const destDir = ctx.argv.output;
      const allFiles = await getFilesRecursively(srcDir);
      const targetExtensions = options.extensions.map((ext) => `.${ext}`);
      const imageFiles = allFiles.filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return targetExtensions.includes(ext);
      });
      const emittedPaths = [];
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
        emittedPaths.push(destPath);
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
          relativeSrcPath.length - ext.length
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
          }
        } else if (event.type === "add" || event.type === "change") {
          const srcPath = isAbsolute ? event.path : path.join(srcDir, event.path);
          const needOptimization = await shouldOptimize(srcPath, destPath);
          if (needOptimization) {
            if (ctx.argv.verbose) {
              console.log(
                `[Image Optimizer] Optimizing (incremental): ${relativeSrcPath} -> ${destRelativePath}`
              );
            }
            await optimizeImage(srcPath, destPath, options);
          }
          yield destPath;
        }
      }
    }
  };
};

// node_modules/@quartz-community/utils/dist/lang.js
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// src/components/styles/example.scss
var example_default = ".example-component {\n  padding: 8px 16px;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  color: white;\n  border-radius: 4px;\n  font-weight: 600;\n  display: inline-block;\n}";

// src/components/scripts/example.inline.ts
var example_inline_default = 'function l(){let e=window.location.pathname;return e.startsWith("/")&&(e=e.slice(1)),e.endsWith("/")&&(e=e.slice(0,-1)),e||"index"}function r(){let e=document.querySelectorAll(".example-component");if(e.length===0)return;let t=[];function o(n){(n.ctrlKey||n.metaKey)&&n.shiftKey&&n.key.toLowerCase()==="e"&&(n.preventDefault(),console.log("[ExampleComponent] Keyboard shortcut triggered!"))}document.addEventListener("keydown",o),t.push(()=>document.removeEventListener("keydown",o));for(let n of e){let i=()=>{console.log("[ExampleComponent] Clicked!")};n.addEventListener("click",i),t.push(()=>n.removeEventListener("click",i))}typeof window<"u"&&window.addCleanup&&window.addCleanup(()=>{t.forEach(n=>n())}),console.log("[ExampleComponent] Initialized with",e.length,"component(s)")}document.addEventListener("nav",e=>{let t=e.detail?.url||l();console.log("[ExampleComponent] Navigation to:",t),r()});document.addEventListener("render",()=>{console.log("[ExampleComponent] Render event - re-initializing"),r()});document.addEventListener("prenav",()=>{let e=document.querySelector(".example-component");e&&sessionStorage.setItem("exampleScrollTop",e.scrollTop?.toString()||"0")});\n';
var ExampleComponent_default = ((opts) => {
  const { prefix = "", suffix = "", className = "example-component" } = opts ?? {};
  const Component = (props) => {
    const frontmatter = props.fileData?.frontmatter;
    const title = frontmatter?.title ?? "Untitled";
    const fullText = `${prefix}${title}${suffix}`;
    return /* @__PURE__ */ jsx("div", { class: classNames(className), children: fullText });
  };
  Component.css = example_default;
  Component.afterDOMLoaded = example_inline_default;
  return Component;
});

export { ExampleComponent_default as ExampleComponent, ImageOptimizer };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map