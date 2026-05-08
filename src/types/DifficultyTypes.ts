export const DifficultyTypes = {
  Easy: "Easy",
  Medium: "Medium",
  Hard: "Hard",
  Expert: "Expert",
  Creative: "Creative",
} as const;

export type Difficulty = (typeof DifficultyTypes)[keyof typeof DifficultyTypes];

export const TuneNames: Record<Difficulty, string> = {
  Easy: "Happy Birthday",
  Medium: "Jingle Bells",
  Hard: "My Sails Are Set",
  Expert: "Bella Ciao",
  Creative: "Free Play",
};

export const DifficultyDescriptions: Record<Difficulty, string> = {
  Easy: "🎉 A classic celebration tune! 🎂",
  Medium: "🔔 A festive holiday favorite! ❄️",
  Hard: "⛵ A haunting melody of the sea... 🌊",
  Expert: "👊 A powerful resistance anthem! 🎵",
  Creative: "🎨 Compose your own masterpiece! 🎼",
};
