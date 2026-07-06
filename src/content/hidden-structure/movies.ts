/**
 * U5 Recommendation Engine catalog: 20 fictional movies/shows with feature
 * values in [0, 1] and a popularity score. No real titles, no images.
 */

export type Movie = {
  id: string;
  title: string;
  emoji: string;
  blurb: string;
  popularity: number;
  features: Record<string, number>;
};

export const FEATURE_LABELS: Record<string, string> = {
  action: "action",
  comedy: "comedy",
  romance: "romance",
  sci_fi: "sci-fi",
  fantasy: "fantasy",
  mystery: "mystery",
  drama: "drama",
  horror: "horror",
  documentary: "documentary",
  animation: "animation",
  fast_paced: "fast-paced",
  feel_good: "feel-good",
  serious: "serious",
  family_friendly: "family-friendly"
};

function m(
  id: string, title: string, emoji: string, blurb: string, popularity: number,
  f: Partial<Record<keyof typeof FEATURE_LABELS, number>>
): Movie {
  const features: Record<string, number> = {};
  for (const k of Object.keys(FEATURE_LABELS)) features[k] = (f as Record<string, number>)[k] ?? 0;
  return { id, title, emoji, blurb, popularity, features };
}

export const movies: Movie[] = [
  m("moonbase", "Moonbase Café", "☕", "A cozy sci-fi comedy about baristas on the Moon.", 0.7,
    { sci_fi: 0.9, comedy: 0.8, feel_good: 0.9, family_friendly: 0.7, fast_paced: 0.2 }),
  m("dragon-metro", "Dragon Metro", "🐉", "Fantasy adventure in a city where dragons run public transport.", 0.8,
    { fantasy: 0.95, action: 0.5, comedy: 0.4, family_friendly: 0.7, fast_paced: 0.5 }),
  m("last-algorithm", "The Last Algorithm", "🕵️", "Serious sci-fi mystery about a vanished researcher.", 0.6,
    { sci_fi: 0.9, mystery: 0.9, serious: 0.9, drama: 0.6, fast_paced: 0.4 }),
  m("pizza-detectives", "Pizza Detectives", "🍕", "Feel-good comedy mystery in a small Italian town.", 0.75,
    { comedy: 0.8, mystery: 0.7, feel_good: 0.9, family_friendly: 0.8 }),
  m("neon-heist", "Neon Heist", "💎", "Fast-paced action thriller in a futuristic city.", 0.9,
    { action: 0.95, sci_fi: 0.6, fast_paced: 0.95, serious: 0.5, mystery: 0.3 }),
  m("letters-saturn", "Letters from Saturn", "💌", "Romantic drama across a space colony network.", 0.5,
    { romance: 0.9, drama: 0.8, sci_fi: 0.6, serious: 0.6, feel_good: 0.3 }),
  m("ghosts-library", "Ghosts of the Library", "👻", "Light horror mystery in an ancient university.", 0.65,
    { horror: 0.6, mystery: 0.8, fantasy: 0.3, serious: 0.3, comedy: 0.2 }),
  m("tiny-robots", "Tiny Robots, Big Feelings", "🤖", "Animated family story about helpful robots.", 0.85,
    { animation: 0.95, family_friendly: 0.95, feel_good: 0.9, sci_fi: 0.5, comedy: 0.5 }),
  m("silent-mountain", "The Silent Mountain", "🏔️", "Slow documentary-style drama about climate and isolation.", 0.35,
    { documentary: 0.8, drama: 0.8, serious: 0.95, feel_good: 0.1 }),
  m("battle-bands", "Battle of the Bands", "🎸", "Teen comedy about rival school musicians.", 0.7,
    { comedy: 0.85, feel_good: 0.8, family_friendly: 0.7, fast_paced: 0.5, romance: 0.3 }),
  m("ocean-secrets", "Ocean of Secrets", "🌊", "Mystery adventure set on a research submarine.", 0.6,
    { mystery: 0.85, action: 0.5, sci_fi: 0.4, serious: 0.6, fast_paced: 0.5 }),
  m("quantum-bakery", "The Quantum Bakery", "🥐", "Whimsical sci-fi comedy about impossible pastries.", 0.55,
    { sci_fi: 0.8, comedy: 0.85, fantasy: 0.4, feel_good: 0.85, family_friendly: 0.7 }),
  m("shadow-tournament", "Shadow Tournament", "♟️", "Action drama around a secret chess competition.", 0.5,
    { action: 0.6, drama: 0.7, mystery: 0.5, serious: 0.7, fast_paced: 0.6 }),
  m("garden-planet", "Garden Planet", "🌱", "Calm documentary-like sci-fi about terraforming.", 0.4,
    { sci_fi: 0.7, documentary: 0.7, serious: 0.6, feel_good: 0.5 }),
  m("platform-nine", "Midnight at Platform 9", "🚂", "Mystery with fantasy elements in a railway station.", 0.6,
    { mystery: 0.85, fantasy: 0.6, drama: 0.4, serious: 0.4, horror: 0.2 }),
  m("grandma-aliens", "Grandma vs Aliens", "👵", "Family-friendly comedy action.", 0.8,
    { comedy: 0.9, action: 0.7, family_friendly: 0.9, feel_good: 0.8, sci_fi: 0.5, fast_paced: 0.7 }),
  m("blue-notebook", "The Blue Notebook", "📘", "Quiet romantic drama.", 0.45,
    { romance: 0.9, drama: 0.85, serious: 0.6, feel_good: 0.35 }),
  m("mars-rescue", "Mars Rescue Squad", "🚀", "Fast-paced sci-fi action.", 0.85,
    { sci_fi: 0.9, action: 0.9, fast_paced: 0.9, serious: 0.4, family_friendly: 0.5 }),
  m("invisible-guesthouse", "The Invisible Guesthouse", "🏚️", "Soft horror comedy.", 0.5,
    { horror: 0.65, comedy: 0.7, mystery: 0.5, fantasy: 0.3, feel_good: 0.3 }),
  m("city-clues", "City of Clues", "🔍", "Detective mystery with a feel-good tone.", 0.7,
    { mystery: 0.9, feel_good: 0.7, comedy: 0.4, drama: 0.4, family_friendly: 0.6 })
];
