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
      eyebrow: "Brain Boost",
      title: "KenKen",
      lede: "Arithmetic logic puzzles.",
      cta_play_label: "Play",
      cta_daily_label: "Daily",
    };
    expect(hero.component).toBe("kenken_hero");
  });

  test("composite bloks carry nested item arrays", () => {
    const steps: KenkenStepsBlok = {
      _uid: "2",
      component: "kenken_steps",
      heading: "How to play",
      steps: [
        { _uid: "s1", component: "kenken_step", title: "Fill", text: "1..N" },
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
          symbol: "+",
          name: "Add",
          description: "sum",
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
          name: "Easy",
          sizes: "3×3",
          operations: "+ − × ÷",
          description: "Gentle start",
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
      richtext: { type: "doc", content: [] },
    };
    const cta: KenkenCtaBlok = {
      _uid: "6",
      component: "kenken_cta",
      heading: "Ready?",
      cta_play_label: "Play",
      cta_daily_label: "Daily",
    };
    expect(prose.component).toBe("kenken_prose");
    expect(cta.component).toBe("kenken_cta");
  });
});
