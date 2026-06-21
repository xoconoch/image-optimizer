export type {
  BuildCtx,
  ChangeEvent,
  CSSResource,
  JSResource,
  ProcessedContent,
  QuartzEmitterPlugin,
  QuartzEmitterPluginInstance,
  QuartzFilterPlugin,
  QuartzFilterPluginInstance,
  QuartzPluginData,
  QuartzTransformerPlugin,
  QuartzTransformerPluginInstance,
  StaticResources,
  PageMatcher,
  PageGenerator,
  VirtualPage,
  QuartzPageTypePlugin,
  QuartzPageTypePluginInstance,
} from "@quartz-community/types";

export interface ImageOptimizerOptions {
  /** Compression quality (1-100), defaults to 80 */
  quality: number;
  /** Compression effort (0-6), defaults to 4 */
  effort: number;
  /** Output format (e.g. 'webp', 'avif'), defaults to 'webp' */
  format: "webp" | "avif" | "png" | "jpeg";
  /** File extensions to optimize (without dot), defaults to ['png', 'jpg', 'jpeg', 'webp', 'tiff'] */
  extensions: string[];
}
