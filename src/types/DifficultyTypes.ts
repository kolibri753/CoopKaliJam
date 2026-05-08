export const DifficultyTypes = {
  Easy: "Easy",
  Medium: "Medium",
  Hard: "Hard",
  Expert: "Expert",
  Creative: "Creative",
} as const;

export type Difficulty = (typeof DifficultyTypes)[keyof typeof DifficultyTypes];

export const TuneNames: Record<Difficulty, string> = {
  Easy: '🎂 "Happy Birthday" a birthday classic',
  Medium: '🔔 "Jingle Bells" a holiday favorite',
  Hard: '🌲 "Forest Lullaby" a mysterious melody',
  Expert: '✊ "Bella Ciao" an Italian anthem',
  Creative: '🎨 "Free Play" just vibes!',
};
