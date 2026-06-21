import { describe, expect, it } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import { ImageOptimizer } from "../src/image-optimizer";
import { createCtx } from "./helpers";

describe("ImageOptimizer Transformer (Remark)", () => {
  it("rewrites local image extensions in markdown", async () => {
    const ctx = createCtx();
    const plugin = ImageOptimizer({ format: "webp", extensions: ["jpg", "png"] });
    const markdownPlugins = plugin.markdownPlugins?.(ctx) ?? [];

    const file = await unified()
      .use(remarkParse)
      .use(markdownPlugins)
      .use(remarkStringify)
      .process("![hike](/photos/hiking/tree.png)");

    expect(String(file)).toContain("/photos/hiking/tree.webp");
  });

  it("does not rewrite remote image urls in markdown", async () => {
    const ctx = createCtx();
    const plugin = ImageOptimizer({ format: "webp", extensions: ["jpg", "png"] });
    const markdownPlugins = plugin.markdownPlugins?.(ctx) ?? [];

    const file = await unified()
      .use(remarkParse)
      .use(markdownPlugins)
      .use(remarkStringify)
      .process("![hike](https://example.com/tree.png)");

    expect(String(file)).toContain("https://example.com/tree.png");
  });

  it("handles queries and hashes in image paths", async () => {
    const ctx = createCtx();
    const plugin = ImageOptimizer({ format: "webp", extensions: ["jpg", "png"] });
    const markdownPlugins = plugin.markdownPlugins?.(ctx) ?? [];

    const file = await unified()
      .use(remarkParse)
      .use(markdownPlugins)
      .use(remarkStringify)
      .process("![hike](/photos/hiking/tree.png?w=500#main)");

    expect(String(file)).toContain("/photos/hiking/tree.webp?w=500#main");
  });

  it("does not rewrite unconfigured image extensions", async () => {
    const ctx = createCtx();
    const plugin = ImageOptimizer({ format: "webp", extensions: ["jpg"] });
    const markdownPlugins = plugin.markdownPlugins?.(ctx) ?? [];

    const file = await unified()
      .use(remarkParse)
      .use(markdownPlugins)
      .use(remarkStringify)
      .process("![hike](/photos/hiking/tree.png)");

    expect(String(file)).toContain("/photos/hiking/tree.png");
  });

  it("rewrites local image extensions and lowercases the path in markdown", async () => {
    const ctx = createCtx();
    const plugin = ImageOptimizer({ format: "webp", extensions: ["jpg", "png"] });
    const markdownPlugins = plugin.markdownPlugins?.(ctx) ?? [];

    const file = await unified()
      .use(remarkParse)
      .use(markdownPlugins)
      .use(remarkStringify)
      .process("![hike](/Photos/Hiking/IMG_6033.PNG)");

    expect(String(file)).toContain("/photos/hiking/img_6033.webp");
  });
});

describe("ImageOptimizer Transformer (Rehype)", () => {
  it("rewrites local image srcs in HTML", async () => {
    const ctx = createCtx();
    const plugin = ImageOptimizer({ format: "webp", extensions: ["jpg", "png"] });
    const htmlPlugins = plugin.htmlPlugins?.(ctx) ?? [];

    const file = await unified()
      .use(rehypeParse, { fragment: true })
      .use(htmlPlugins)
      .use(rehypeStringify)
      .process('<img src="/photos/hiking/tree.png" alt="hike">');

    expect(String(file)).toContain('src="/photos/hiking/tree.webp"');
  });

  it("does not rewrite remote image srcs in HTML", async () => {
    const ctx = createCtx();
    const plugin = ImageOptimizer({ format: "webp", extensions: ["jpg", "png"] });
    const htmlPlugins = plugin.htmlPlugins?.(ctx) ?? [];

    const file = await unified()
      .use(rehypeParse, { fragment: true })
      .use(htmlPlugins)
      .use(rehypeStringify)
      .process('<img src="https://example.com/tree.png" alt="hike">');

    expect(String(file)).toContain('src="https://example.com/tree.png"');
  });

  it("rewrites local image srcs and lowercases the path in HTML", async () => {
    const ctx = createCtx();
    const plugin = ImageOptimizer({ format: "webp", extensions: ["jpg", "png"] });
    const htmlPlugins = plugin.htmlPlugins?.(ctx) ?? [];

    const file = await unified()
      .use(rehypeParse, { fragment: true })
      .use(htmlPlugins)
      .use(rehypeStringify)
      .process('<img src="/Photos/Hiking/IMG_6033.PNG" alt="hike">');

    expect(String(file)).toContain('src="/photos/hiking/img_6033.webp"');
  });
});
