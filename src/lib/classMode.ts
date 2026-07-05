/**
 * Classroom modes, controlled by ordinary URL query parameters (before the #):
 *   ?class=A          students in class A
 *   ?class=B          students in class B
 *   ?teacher=1        show teacher notes, reveal controls, discussion prompts
 * Example: https://site/ai-lab/?class=A&teacher=1#/day1/next-token-arena
 */

export type ClassId = "A" | "B" | null;

export type ClassroomMode = {
  classId: ClassId;
  isTeacher: boolean;
};

export function readClassroomMode(): ClassroomMode {
  const params = new URLSearchParams(window.location.search);
  const rawClass = (params.get("class") ?? "").toUpperCase();
  const classId: ClassId = rawClass === "A" ? "A" : rawClass === "B" ? "B" : null;
  const isTeacher = params.get("teacher") === "1";
  return { classId, isTeacher };
}
