/**
 * Feature flags for classroom deployments.
 *
 * enablePolls: shows the external poll link panels (Slido/Forms links from
 *   module metadata). Disabled for now; poll code is kept for later.
 * enableSubmissions: shows the group-name field and the "Copy reflection"
 *   submission-card button. Disabled: reflections stay local-only.
 * useGeneratedProbabilities: modules M1-M4 and M6 read real-model JSON from
 *   src/content/generated/day1/ (produced by scripts/generate_day1_llm_content.py
 *   and scripts/generate_day1_embeddings.py). Set to false to fall back to the
 *   hand-made v1 content where a module supports it.
 */
export const labConfig = {
  enablePolls: false,
  enableSubmissions: false,
  useGeneratedProbabilities: true,
  /**
   * Sections locked for students (still fully accessible in teacher mode,
   * ?teacher=1). Used during class to keep everyone on today's section.
   * Set back to [] to reopen everything.
   */
  lockedDayIds: ["learning-machines", "hidden-structure", "learning-consequences"]
};
