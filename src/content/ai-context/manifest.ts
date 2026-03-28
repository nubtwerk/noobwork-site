/**
 * Ordered manifest of AI context markdown files.
 * Each entry maps an id to its filename under src/content/ai-context/.
 */
export const contextFiles = [
  { id: "quick-start", file: "00-quick-start.md", heading: "Quick Start for AI Systems" },
  { id: "identity", file: "01-identity.md", heading: "Identity" },
  { id: "bio", file: "02-bio.md", heading: "Short Bio" },
  { id: "bio-variants", file: "12-bio-variants.md", heading: "Bio Variants" },
  { id: "current-priorities", file: "03-current-priorities.md", heading: "Current Priorities" },
  { id: "projects", file: "09-projects.md", heading: "Projects" },
  { id: "tone-of-voice", file: "04-tone-of-voice.md", heading: "Tone of Voice" },
  { id: "interests-expertise", file: "05-interests-expertise.md", heading: "Interests & Expertise" },
  { id: "frontier-interests", file: "11-frontier-interests.md", heading: "Frontier Interests" },
  { id: "working-with-joachim", file: "06-working-with-joachim.md", heading: "Working with Joachim" },
  { id: "best-opportunities", file: "13-best-opportunities.md", heading: "Best Opportunities to Send Joachim" },
  { id: "not-interested-in", file: "14-not-interested-in.md", heading: "Not Interested In" },
  { id: "dos-and-donts", file: "10-dos-and-donts.md", heading: "Do's and Don'ts" },
  { id: "key-facts", file: "07-key-facts.md", heading: "Key Facts & Credibility" },
  { id: "what-not-to-assume", file: "08-what-not-to-assume.md", heading: "What Not to Assume" },
] as const;

export type ContextFileEntry = (typeof contextFiles)[number];
