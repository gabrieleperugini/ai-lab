import type { LabModule } from "./types";
import type { ClassroomMode } from "./classMode";

/** Props every interactive module component receives from the module shell. */
export type ModuleComponentProps = {
  module: LabModule;
  mode: ClassroomMode;
  /** Report a short human-readable result ("chose 'time'") — it is included
   * in the copied reflection card. */
  onResult: (result: string) => void;
  /** Increments every time the user presses the module Reset button. */
  resetSignal: number;
};
