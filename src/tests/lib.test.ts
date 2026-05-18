import { describe, it, expect } from "vitest";
import { getKalimbaNotes } from "../lib/getKalimbaNotes";
import { getPlayerKeys } from "../lib/getPlayerKeys";
import { getTabsForDifficulty } from "../lib/getTabsForDifficulty";
import { notesDistribution, notesHeight } from "../types/KalimbaNote";
import { createNote, createPause } from "../types/Tab";

describe("getKalimbaNotes", () => {
  it("should return all 17 kalimba notes", () => {
    const notes = getKalimbaNotes(notesHeight);
    expect(notes).toHaveLength(17);
  });

  it("should pair each note name with its corresponding height", () => {
    const notes = getKalimbaNotes(notesHeight);

    expect(notes[0].name).toBe("D6");
    expect(notes[0].height).toBe(notesHeight[0]);
    expect(notes[8].name).toBe("C4");
    expect(notes[8].height).toBe(notesHeight[8]);
  });

  it("should include all notes from notesDistribution", () => {
    const notes = getKalimbaNotes(notesHeight);
    const names = notes.map((n) => n.name);
    expect(names).toEqual(notesDistribution);
  });

  it("should handle custom height values", () => {
    const customHeights = Array(17).fill("2em");
    const notes = getKalimbaNotes(customHeights);

    notes.forEach((note) => {
      expect(note.height).toBe("2em");
    });
  });
});

describe("getPlayerKeys", () => {
  it("should assign all keys to single player", () => {
    const keys = getPlayerKeys(["player1"], "player1", notesHeight);

    expect(keys["player1"]).toBeDefined();
    expect(keys["player1"].length).toBe(9); // ceil(17/2) = 9
  });

  it("should assign first half of keys to player 1 in two-player game", () => {
    const allPlayers = ["player1", "player2"];
    const keys = getPlayerKeys(allPlayers, "player1", notesHeight);

    expect(keys["player1"]).toBeDefined();
    expect(keys["player1"].length).toBe(9);
    // First 9 notes from distribution
    expect(keys["player1"][0]).toBe("D6");
    expect(keys["player1"][8]).toBe("C4");
  });

  it("should assign second half of keys to player 2 in two-player game", () => {
    const allPlayers = ["player1", "player2"];
    const keys = getPlayerKeys(allPlayers, "player2", notesHeight);

    expect(keys["player2"]).toBeDefined();
    expect(keys["player2"].length).toBe(8); // remaining notes
    expect(keys["player2"][0]).toBe("E4");
  });

  it("should not overlap keys between players", () => {
    const allPlayers = ["player1", "player2"];
    const keys1 = getPlayerKeys(allPlayers, "player1", notesHeight);
    const keys2 = getPlayerKeys(allPlayers, "player2", notesHeight);

    const allKeys = [...keys1["player1"], ...keys2["player2"]];
    const uniqueKeys = new Set(allKeys);

    // All 17 notes should be distributed
    expect(allKeys.length).toBe(17);
    expect(uniqueKeys.size).toBe(17);
  });

  it("should return keys only for the current player", () => {
    const allPlayers = ["player1", "player2"];
    const keys = getPlayerKeys(allPlayers, "player1", notesHeight);

    expect(Object.keys(keys)).toEqual(["player1"]);
    expect(keys["player2"]).toBeUndefined();
  });
});

describe("getTabsForDifficulty", () => {
  it("should return tabs for Easy difficulty", () => {
    const tabs = getTabsForDifficulty("Easy");
    expect(tabs.length).toBeGreaterThan(0);
    expect(tabs[0]).toHaveProperty("noteName");
    expect(tabs[0]).toHaveProperty("duration");
  });

  it("should return tabs for Medium difficulty", () => {
    const tabs = getTabsForDifficulty("Medium");
    expect(tabs.length).toBeGreaterThan(0);
  });

  it("should return tabs for Hard difficulty", () => {
    const tabs = getTabsForDifficulty("Hard");
    expect(tabs.length).toBeGreaterThan(0);
  });

  it("should return tabs for Expert difficulty", () => {
    const tabs = getTabsForDifficulty("Expert");
    expect(tabs.length).toBeGreaterThan(0);
  });

  it("should return empty array for Creative mode", () => {
    const tabs = getTabsForDifficulty("Creative");
    expect(tabs).toEqual([]);
  });

  it("should throw error for unknown difficulty", () => {
    // @ts-expect-error testing invalid input
    expect(() => getTabsForDifficulty("Unknown")).toThrow("Unknown difficulty");
  });

  it("should return a copy (not a reference) of tabs", () => {
    const tabs1 = getTabsForDifficulty("Easy");
    const tabs2 = getTabsForDifficulty("Easy");

    expect(tabs1).toEqual(tabs2);
    expect(tabs1).not.toBe(tabs2); // different references
  });

  it("should include pause notes in raw tabs", () => {
    const tabs = getTabsForDifficulty("Easy");
    const hasPauses = tabs.some((tab) => tab.noteName === "P");
    expect(hasPauses).toBe(true);
  });
});

describe("Tab helpers", () => {
  it("createNote should create a tab with name and duration", () => {
    const note = createNote("C4", 3000);
    expect(note).toEqual({ noteName: "C4", duration: 3000 });
  });

  it("createPause should create a tab with 'P' as noteName", () => {
    const pause = createPause(2000);
    expect(pause).toEqual({ noteName: "P", duration: 2000 });
  });
});
