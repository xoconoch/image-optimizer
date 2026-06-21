import { QuartzTransformerPluginInstance, QuartzEmitterPluginInstance } from '@quartz-community/types';
export { PageGenerator, PageMatcher, QuartzComponent, QuartzComponentConstructor, QuartzComponentProps, QuartzEmitterPlugin, QuartzFilterPlugin, QuartzPageTypePlugin, QuartzPageTypePluginInstance, QuartzTransformerPlugin, StringResource, VirtualPage } from '@quartz-community/types';
import { ImageOptimizerOptions } from './types.js';
export { ExampleComponent, ExampleComponentOptions } from './components/index.js';

declare const ImageOptimizer: (userOptions?: Partial<ImageOptimizerOptions>) => QuartzTransformerPluginInstance & QuartzEmitterPluginInstance;

export { ImageOptimizer, ImageOptimizerOptions };
