export type ModuleLevel = "intro" | "core" | "challenge";

export type PollConfig = {
  question: string;
  classAUrl?: string;
  classBUrl?: string;
};

export type LabModule = {
  id: string;
  dayId: string;
  title: string;
  subtitle: string;
  durationMin: number;
  level: ModuleLevel;
  mission: string;
  studentInstructions: string[];
  /** Key into the component registry (src/modules/registry.ts). */
  component: string;
  dataKey?: string;
  reflectionQuestions: string[];
  noticePoints: string[];
  takeaway: string;
  teacherNotes?: string[];
  poll?: PollConfig;
  /** True for Day 2/3 scaffolded modules that are not yet implemented. */
  placeholder?: boolean;
  /** Temporarily hidden from the section cards and prev/next navigation.
   * The module code and its direct route keep working; teacher mode still
   * lists it with a "hidden" tag. Restore by removing the flag. */
  hidden?: boolean;
  /** Wide modules render the interactive panel at full width, with the
   * instructions/reflection panels below (used by visual modules). */
  wide?: boolean;
};

export type LabDay = {
  id: string;
  index: number;
  title: string;
  tagline: string;
  narrative: string;
  available: boolean;
  modules: LabModule[];
};

export type TimelineSession = {
  title: string;
  items: string[];
};
