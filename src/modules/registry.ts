import { lazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";
import type { ModuleComponentProps } from "../lib/moduleProps";

/**
 * Component registry: maps the `component` string in module metadata to the
 * React component implementing the activity. Modules are lazy-loaded so
 * heavy pieces (like the real tokenizer in M5) only load when opened.
 */
export const moduleRegistry: Record<
  string,
  LazyExoticComponent<ComponentType<ModuleComponentProps>>
> = {
  NextTokenArena: lazy(() => import("./day1/NextTokenArena")),
  ContextLens: lazy(() => import("./day1/ContextLens")),
  BranchingStories: lazy(() => import("./day1/BranchingStories")),
  ReasoningDemo: lazy(() => import("./day1/ReasoningDemo")),
  SamplingMachine: lazy(() => import("./day1/SamplingMachine")),
  TokenizerMicroscope: lazy(() => import("./day1/TokenizerMicroscope")),
  MeaningMap: lazy(() => import("./day1/MeaningMap")),
  DeembeddingLens: lazy(() => import("./day1/DeembeddingLens")),
  ChatbotBridge: lazy(() => import("./day1/ChatbotBridge")),
  Placeholder: lazy(() => import("./PlaceholderModule"))
};
