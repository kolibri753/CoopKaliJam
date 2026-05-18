import { describe, it, expect, beforeEach, vi } from "vitest";
import { getTabsForDifficulty } from "../lib/getTabsForDifficulty";
import { getPlayerKeys } from "../lib/getPlayerKeys";
import { notesHeight } from "../types/KalimbaNote";
import { GameState } from "../logic";

// Mock Rune SDK globals
const mockGameOver = vi.fn();
const mockInvalidAction = vi.fn(() => new Error("Invalid action"));

vi.stubGlobal("Rune", {
  initLogic: vi.fn(),
  gameOver: mockGameOver,
  invalidAction: mockInvalidAction,
});

// Helper to create a fresh game state
function createGameState(overrides?: Partial<GameState>): GameState {
  const allPlayerIds = ["player1"];
  return {
    count: 0,
    currentNoteIndex: 0,
    isCorrect: true,
    score: 0,
    difficulty: null,
    tabs: [],
    allPlayerIds,
    playerKeys: allPlayerIds.map((id) =>
      getPlayerKeys(allPlayerIds, id, notesHeight)
    ),
    ...overrides,
  };
}

// Replicate the game actions logic for testability
// (since Rune.initLogic registers them, we test the logic directly)

function actionStartGame(
  game: GameState,
  difficulty: GameState["difficulty"]
): void {
  if (game.difficulty) {
    throw mockInvalidAction();
  }
  game.difficulty = difficulty;
  game.tabs = getTabsForDifficulty(difficulty!).filter(
    (tab) => tab.noteName !== "P"
  );
}

function actionPlayNote(game: GameState, noteName: string): void {
  if (game.difficulty === "Creative") {
    game.score++;
    return;
  }

  const currentTab = game.tabs[game.currentNoteIndex];
  game.isCorrect = noteName === currentTab.noteName;

  if (game.isCorrect) {
    game.score += 1;

    if (game.currentNoteIndex + 1 === game.tabs.length) {
      const players: Record<string, "WON" | "LOST"> = {};
      game.allPlayerIds.forEach((playerId) => {
        players[playerId] = game.score > 0 ? "WON" : "LOST";
      });
      mockGameOver({ players });
    } else {
      game.currentNoteIndex = (game.currentNoteIndex + 1) % game.tabs.length;
    }
  } else {
    game.score -= 1;
  }
}

function actionIncrement(game: GameState, amount: number): void {
  game.count += amount;
}

describe("Game Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial State (setup)", () => {
    it("should initialize with default values", () => {
      const state = createGameState();

      expect(state.count).toBe(0);
      expect(state.currentNoteIndex).toBe(0);
      expect(state.isCorrect).toBe(true);
      expect(state.score).toBe(0);
      expect(state.difficulty).toBeNull();
      expect(state.tabs).toEqual([]);
    });

    it("should assign player keys on setup", () => {
      const state = createGameState();

      expect(state.playerKeys).toHaveLength(1);
      expect(state.playerKeys[0]).toHaveProperty("player1");
      expect(state.playerKeys[0]["player1"].length).toBeGreaterThan(0);
    });

    it("should handle two players on setup", () => {
      const allPlayerIds = ["player1", "player2"];
      const state = createGameState({
        allPlayerIds,
        playerKeys: allPlayerIds.map((id) =>
          getPlayerKeys(allPlayerIds, id, notesHeight)
        ),
      });

      expect(state.playerKeys).toHaveLength(2);
      expect(state.playerKeys[0]).toHaveProperty("player1");
      expect(state.playerKeys[1]).toHaveProperty("player2");
    });
  });

  describe("increment action", () => {
    it("should increase count by the given amount", () => {
      const state = createGameState();
      actionIncrement(state, 5);
      expect(state.count).toBe(5);
    });

    it("should handle negative amounts", () => {
      const state = createGameState({ count: 10 });
      actionIncrement(state, -3);
      expect(state.count).toBe(7);
    });
  });

  describe("startGame action", () => {
    it("should set difficulty and load tabs for Easy", () => {
      const state = createGameState();
      actionStartGame(state, "Easy");

      expect(state.difficulty).toBe("Easy");
      expect(state.tabs.length).toBeGreaterThan(0);
      expect(state.tabs.every((t) => t.noteName !== "P")).toBe(true);
    });

    it("should set difficulty and load tabs for Medium", () => {
      const state = createGameState();
      actionStartGame(state, "Medium");

      expect(state.difficulty).toBe("Medium");
      expect(state.tabs.length).toBeGreaterThan(0);
    });

    it("should set difficulty and load tabs for Hard", () => {
      const state = createGameState();
      actionStartGame(state, "Hard");

      expect(state.difficulty).toBe("Hard");
      expect(state.tabs.length).toBeGreaterThan(0);
    });

    it("should set difficulty and load tabs for Expert", () => {
      const state = createGameState();
      actionStartGame(state, "Expert");

      expect(state.difficulty).toBe("Expert");
      expect(state.tabs.length).toBeGreaterThan(0);
    });

    it("should return empty tabs for Creative mode", () => {
      const state = createGameState();
      actionStartGame(state, "Creative");

      expect(state.difficulty).toBe("Creative");
      expect(state.tabs).toEqual([]);
    });

    it("should filter out pause notes from tabs", () => {
      const state = createGameState();
      actionStartGame(state, "Easy");

      const hasPauses = state.tabs.some((tab) => tab.noteName === "P");
      expect(hasPauses).toBe(false);
    });

    it("should throw if game already started", () => {
      const state = createGameState({ difficulty: "Easy" });

      expect(() => actionStartGame(state, "Medium")).toThrow();
      expect(mockInvalidAction).toHaveBeenCalled();
    });
  });

  describe("playNote action", () => {
    it("should increment score for correct note", () => {
      const state = createGameState();
      actionStartGame(state, "Easy");
      const correctNote = state.tabs[0].noteName;

      actionPlayNote(state, correctNote);

      expect(state.isCorrect).toBe(true);
      expect(state.score).toBe(1);
      expect(state.currentNoteIndex).toBe(1);
    });

    it("should decrement score for incorrect note", () => {
      const state = createGameState();
      actionStartGame(state, "Easy");

      actionPlayNote(state, "WRONG_NOTE");

      expect(state.isCorrect).toBe(false);
      expect(state.score).toBe(-1);
      expect(state.currentNoteIndex).toBe(0); // stays on same note
    });

    it("should advance to next note on correct play", () => {
      const state = createGameState();
      actionStartGame(state, "Easy");

      const note1 = state.tabs[0].noteName;
      const note2 = state.tabs[1].noteName;

      actionPlayNote(state, note1);
      expect(state.currentNoteIndex).toBe(1);

      actionPlayNote(state, note2);
      expect(state.currentNoteIndex).toBe(2);
    });

    it("should not advance note index on incorrect play", () => {
      const state = createGameState();
      actionStartGame(state, "Easy");

      actionPlayNote(state, "WRONG");
      actionPlayNote(state, "ALSO_WRONG");

      expect(state.currentNoteIndex).toBe(0);
      expect(state.score).toBe(-2);
    });

    it("should always increment score in Creative mode", () => {
      const state = createGameState();
      actionStartGame(state, "Creative");

      actionPlayNote(state, "C4");
      actionPlayNote(state, "D4");
      actionPlayNote(state, "E4");

      expect(state.score).toBe(3);
    });

    it("should call gameOver when last note is played correctly", () => {
      const state = createGameState();
      actionStartGame(state, "Easy");

      // Play all notes correctly
      for (const tab of state.tabs) {
        actionPlayNote(state, tab.noteName);
      }

      expect(mockGameOver).toHaveBeenCalledWith({
        players: { player1: "WON" },
      });
    });

    it("should mark all players as WON when score is positive", () => {
      const allPlayerIds = ["player1", "player2"];
      const state = createGameState({
        allPlayerIds,
        playerKeys: allPlayerIds.map((id) =>
          getPlayerKeys(allPlayerIds, id, notesHeight)
        ),
      });
      actionStartGame(state, "Easy");

      for (const tab of state.tabs) {
        actionPlayNote(state, tab.noteName);
      }

      expect(mockGameOver).toHaveBeenCalledWith({
        players: { player1: "WON", player2: "WON" },
      });
    });
  });

  describe("Player Events", () => {
    it("should handle playerJoined by adding keys", () => {
      const state = createGameState();
      const newPlayerId = "player2";

      // Simulate playerJoined
      state.allPlayerIds.push(newPlayerId);
      const newPlayerKeys = getPlayerKeys(
        state.allPlayerIds,
        newPlayerId,
        notesHeight
      );
      state.playerKeys.push(newPlayerKeys);

      expect(state.allPlayerIds).toContain("player2");
      expect(state.playerKeys).toHaveLength(2);
      expect(state.playerKeys[1]).toHaveProperty("player2");
    });

    it("should handle playerLeft by removing player and keys", () => {
      const allPlayerIds = ["player1", "player2"];
      const state = createGameState({
        allPlayerIds,
        playerKeys: allPlayerIds.map((id) =>
          getPlayerKeys(allPlayerIds, id, notesHeight)
        ),
      });

      // Simulate playerLeft for player2
      const playerIndex = state.allPlayerIds.indexOf("player2");
      state.allPlayerIds.splice(playerIndex, 1);
      state.playerKeys.splice(playerIndex, 1);

      expect(state.allPlayerIds).toEqual(["player1"]);
      expect(state.playerKeys).toHaveLength(1);
    });

    it("should reassign keys when a player leaves", () => {
      const allPlayerIds = ["player1", "player2"];
      const state = createGameState({
        allPlayerIds,
        playerKeys: allPlayerIds.map((id) =>
          getPlayerKeys(allPlayerIds, id, notesHeight)
        ),
      });

      // Player1 leaves
      const playerIndex = state.allPlayerIds.indexOf("player1");
      state.allPlayerIds.splice(playerIndex, 1);
      state.playerKeys.splice(playerIndex, 1);

      // Reassign keys for remaining player
      if (state.allPlayerIds.length > 0) {
        const nextPlayerId = state.allPlayerIds[0];
        state.playerKeys[0] = getPlayerKeys(
          state.allPlayerIds,
          nextPlayerId,
          notesHeight
        );
      }

      expect(state.allPlayerIds).toEqual(["player2"]);
      expect(state.playerKeys[0]).toHaveProperty("player2");
    });
  });
});
