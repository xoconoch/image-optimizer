export { BuildCtx, CSSResource, ChangeEvent, JSResource, PageGenerator, PageMatcher, ProcessedContent, QuartzEmitterPlugin, QuartzEmitterPluginInstance, QuartzFilterPlugin, QuartzFilterPluginInstance, QuartzPageTypePlugin, QuartzPageTypePluginInstance, QuartzPluginData, QuartzTransformerPlugin, QuartzTransformerPluginInstance, StaticResources, VirtualPage } from '@quartz-community/types';

interface ImageOptimizerOptions {
    /** Compression quality (1-100), defaults to 80 */
    quality: number;
    /** Compression effort (0-6), defaults to 4 */
    effort: number;
    /** Output format (e.g. 'webp', 'avif'), defaults to 'webp' */
    format: "webp" | "avif" | "png" | "jpeg";
    /** File extensions to optimize (without dot), defaults to ['png', 'jpg', 'jpeg', 'webp', 'tiff'] */
    extensions: string[];
}

export type { ImageOptimizerOptions };
