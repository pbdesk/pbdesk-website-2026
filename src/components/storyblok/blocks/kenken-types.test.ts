/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import type {
  KenkenCtaBlok,
  KenkenHeroBlok,
  KenkenLevelsBlok,
  KenkenOperationsBlok,
  KenkenProseBlok,
  KenkenStepsBlok,
} from "./types";

describe("kenken blok types", () => {
  test("hero blok compiles with its fields", () => {
    const hero: KenkenHeroBlok = {
      _uid: "1",
      component: "kenken_hero",
      cta_daily_label: "Daily",
      cta_play_label: "Play",
      eyebrow: "Brain Boost",
      lede: "Arithmetic logic puzzles.",
      title: "KenKen",
    };
    expect(hero.component).toBe("kenken_hero");
  });

  test("composite bloks carry nested item arrays", () => {
    const steps: KenkenStepsBlok = {
      _uid: "2",
      component: "kenken_steps",
      heading: "How to play",
      steps: [
        { _uid: "s1", component: "kenken_step", text: "1..N", title: "Fill" },
      ],
    };
    const ops: KenkenOperationsBlok = {
      _uid: "3",
      component: "kenken_operations",
      heading: "Operations",
      operations: [
        {
          _uid: "o1",
          component: "kenken_operation",
          description: "sum",
          name: "Add",
          symbol: "+",
        },
      ],
    };
    const levels: KenkenLevelsBlok = {
      _uid: "4",
      component: "kenken_levels",
      heading: "Levels",
      levels: [
        {
          _uid: "l1",
          component: "kenken_level",
          description: "Gentle start",
          name: "Easy",
          operations: "+ − × ÷",
          sizes: "3×3",
        },
      ],
    };
    expect(steps.steps[0].title).toBe("Fill");
    expect(ops.operations[0].symbol).toBe("+");
    expect(levels.levels[0].name).toBe("Easy");
  });

  test("prose + cta bloks compile", () => {
    const prose: KenkenProseBlok = {
      _uid: "5",
      component: "kenken_prose",
      heading: "What is KenKen",
      richtext: { content: [], type: "doc" },
    };
    const cta: KenkenCtaBlok = {
      _uid: "6",
      component: "kenken_cta",
      cta_daily_label: "Daily",
      cta_play_label: "Play",
      heading: "Ready?",
    };
    expect(prose.component).toBe("kenken_prose");
    expect(cta.component).toBe("kenken_cta");
  });
});
