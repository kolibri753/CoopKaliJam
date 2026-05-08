import { notesDistribution } from "../types/KalimbaNote";

export default function playSounds(
  action: { name: string; params: Record<string, unknown> } | undefined,
) {
  if (action?.name === "playNote") {
    const noteName = action.params.noteName as string;

    if (!notesDistribution.includes(noteName)) {
      console.error("Note could not be determined");
      return;
    }

    const audio = new Audio(`kalimbaKeySounds/${noteName}.m4a`);

    audio.play();
  }
}
