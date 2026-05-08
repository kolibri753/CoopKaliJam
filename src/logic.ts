import type { RuneClient } from "rune-sdk";
import { getTabsForDifficulty } from "./lib/getTabsForDifficulty";
import { Difficulty } from "./types/DifficultyTypes";
import { Tab } from "./types/Tab";
import { PlayerKeys } from "./types/PlayerKeys";
import { getPlayerKeys } from "./lib/getPlayerKeys";
import { notesHeight } from "./types/KalimbaNote";

// Define the game state interface
export interface GameState {
  count: number;
  currentNoteIndex: number;
  isCorrect: boolean | true;
  score: number | 0;
  difficulty: Difficulty | null;
  tabs: Tab[];
  allPlayerIds: string[];
  playerKeys: PlayerKeys[];
}

// Define the game actions
export type GameActions = {
  increment: (params: { amount: number }) => void;
  playNote: (params: { noteName: string }) => void;
  startGame: (params: { difficulty: Difficulty }) => void;
};

// Declare the Rune client and global objects
declare global {
  const Rune: RuneClient<GameState, GameActions>;
}

// Initialize the Rune logic
Rune.initLogic({
  minPlayers: 1,
  maxPlayers: 2,
  setup: (allPlayerIds) => {
    const currentNoteIndex = 0;
    const playerKeys = allPlayerIds.map((playerId) =>
      getPlayerKeys(allPlayerIds, playerId, notesHeight)
    );

    return {
      count: 0,
      currentNoteIndex,
      isCorrect: true,
      score: 0,
      difficulty: null,
      tabs: [],
      allPlayerIds: allPlayerIds,
      playerKeys,
    };
  },
  actions: {
    increment: ({ amount }, { game }) => {
      game.count += amount;
    },
    startGame: ({ difficulty }, { game }) => {
      if (game.difficulty) {
        throw Rune.invalidAction();
      }

      game.difficulty = difficulty;
      game.tabs = getTabsForDifficulty(difficulty).filter(
        (tab) => tab.noteName !== "P"
      );
    },
    playNote: ({ noteName }, { game }) => {
      if (game.difficulty === "Creative") {
        game.score++;
        return;
      }

      const currentTab = game.tabs[game.currentNoteIndex];

      // Check if the played note matches the current tab note
      game.isCorrect = noteName === currentTab.noteName;

      // Update score based on correctness
      if (game.isCorrect) {
        game.score += 1;

        if (game.currentNoteIndex + 1 === game.tabs.length) {
          // Determine winners and losers based on the score
          const winners: Record<string, "WON" | "LOST" | number> = {};
          const losers: Record<string, "WON" | "LOST" | number> = {};

          game.allPlayerIds.forEach((playerId) => {
            if (game.score > 0) {
              winners[playerId] = "WON";
            } else {
              losers[playerId] = "LOST";
            }
          });

          // Call Rune.gameOver with the results
          Rune.gameOver({
            players: { ...winners, ...losers },
          });
        } else {
          game.currentNoteIndex =
            (game.currentNoteIndex + 1) % game.tabs.length;
        }
      } else {
        game.score -= 1;
      }
    },
  },
  events: {
    playerJoined: (playerId, { game }) => {
      // Add the new player to the game
      game.allPlayerIds.push(playerId);

      // Assign playerKeys to the new player
      const playerKeys = getPlayerKeys(
        game.allPlayerIds,
        playerId,
        notesHeight
      );
      game.playerKeys.push(playerKeys);
    },
    playerLeft: (playerId, { game }) => {
      // Remove the player from the game
      const playerIndex = game.allPlayerIds.indexOf(playerId);
      if (playerIndex !== -1) {
        game.allPlayerIds.splice(playerIndex, 1);
        game.playerKeys.splice(playerIndex, 1);

        // If there's at least one player remaining, update the notes for the next player
        if (game.allPlayerIds.length > 0) {
          const nextPlayerId = game.allPlayerIds[0];
          const nextPlayerKeys = getPlayerKeys(
            game.allPlayerIds,
            nextPlayerId,
            notesHeight
          );
          game.playerKeys[0] = nextPlayerKeys;
        }
      }
    },
  },
});
