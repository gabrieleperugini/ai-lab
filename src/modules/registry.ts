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
  WhatComputerSees: lazy(() => import("./learning/WhatComputerSees")),
  FitTheLine: lazy(() => import("./learning/FitTheLine")),
  LossLandscape: lazy(() => import("./learning/LossLandscape")),
  GradientDescentRace: lazy(() => import("./learning/GradientDescentRace")),
  Generalization: lazy(() => import("./learning/Generalization")),
  GradientExplorer: lazy(() => import("./learning/GradientExplorer")),
  OneDNeuralNets: lazy(() => import("./learning/OneDNeuralNets")),
  NNPlayground: lazy(() => import("./learning/NNPlayground")),
  DataDetective: lazy(() => import("./learning/DataDetective")),
  FeatureDetectorLab: lazy(() => import("./learning/FeatureDetectorLab")),
  FoolTheNetwork: lazy(() => import("./learning/FoolTheNetwork")),
  SimilarityLenses: lazy(() => import("./hidden/SimilarityLenses")),
  KMeansGame: lazy(() => import("./hidden/KMeansGame")),
  BlobsBreak: lazy(() => import("./hidden/BlobsBreak")),
  SpectralSprings: lazy(() => import("./hidden/SpectralSprings")),
  Recommender: lazy(() => import("./hidden/Recommender")),
  MazeLearner: lazy(() => import("./rl/MazeLearner")),
  RewardHackingLab: lazy(() => import("./rl/RewardHackingLab")),
  RocketLanding: lazy(() => import("./rl/RocketLanding")),
  Placeholder: lazy(() => import("./PlaceholderModule"))
};
