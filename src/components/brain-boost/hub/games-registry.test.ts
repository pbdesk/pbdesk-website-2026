import { describe, expect, it } from "bun:test";
import {
  BRAIN_BOOST_GAMES,
  type GameStatus,
  STATUS_LABEL,
} from "./games-registry";

describe("BRAIN_BOOST_GAMES", () => {
  it("includes a single live game and it is KenKen", () => {
    const live = BRAIN_BOOST_GAMES.filter((g) => g.status === "live");
    expect(live).toHaveLength(1);
    expect(live[0].slug).toBe("kenken");
    expect(live[0].href).toBe("/brain-boost/kenken");
    expect(live[0].coverImage).toBe("/pillers/kenken-banner.png");
  });

  it("provides at least three non-live entries for the coming-soon grid", () => {
    const coming = BRAIN_BOOST_GAMES.filter((g) => g.status !== "live");
    expect(coming.length).toBeGreaterThanOrEqual(3);
    for (const game of coming) {
      expect(game.glyph).toBeDefined();
      expect((game.glyph ?? "").length).toBeGreaterThan(0);
    }
  });

  it("has every game slug unique", () => {
    const slugs = BRAIN_BOOST_GAMES.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("maps every GameStatus value via STATUS_LABEL", () => {
    const statuses: GameStatus[] = [
      "live",
      "coming-q3",
      "coming-q4",
      "exploring",
    ];
    for (const s of statuses) {
      expect(STATUS_LABEL[s]).toBeDefined();
      expect(STATUS_LABEL[s].length).toBeGreaterThan(0);
    }
  });
});
