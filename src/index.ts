export { ImageOptimizer } from "./image-optimizer";
export { default as ExampleComponent } from "./components/ExampleComponent";

export type { ImageOptimizerOptions } from "./types";

export type { ExampleComponentOptions } from "./components/ExampleComponent";

// Re-export shared types from @quartz-community/types
export type {
  QuartzComponent,
  QuartzComponentProps,
  QuartzComponentConstructor,
  StringResource,
  QuartzTransformerPlugin,
  QuartzFilterPlugin,
  QuartzEmitterPlugin,
  QuartzPageTypePlugin,
  QuartzPageTypePluginInstance,
  PageMatcher,
  PageGenerator,
  VirtualPage,
} from "@quartz-community/types";
