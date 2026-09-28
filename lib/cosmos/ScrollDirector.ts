import { damp, smoothstep } from "./math";
import { shapeDefaults } from "./shapes";

type Section = {
  el: HTMLElement;
  key: string;
  x: number;
  y: number;
  strength: number;
  flow: number;
};

export type Direction = {
  a: Section;
  b: Section;
  morph: number;
  strength: number;
  flow: number;
  dominant: string;
};

const HERO: Section = {
  el: null as unknown as HTMLElement,
  key: "drift",
  x: 0,
  y: 0,
  ...shapeDefaults("drift"),
};

export class ScrollDirector {
  private sections: Section[] = [];
  private index = 0;

  refresh() {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-cosmos]"));
    this.sections = els.map((el) => {
      const key = el.dataset.cosmos || "drift";
      const defaults = shapeDefaults(key);
      const num = (v: string | undefined, fallback: number) => (v === undefined ? fallback : Number(v));
      return {
        el,
        key,
        x: num(el.dataset.cosmosX, 0),
        y: num(el.dataset.cosmosY, 0),
        strength: num(el.dataset.cosmosStrength, defaults.strength),
        flow: num(el.dataset.cosmosFlow, defaults.flow),
      };
    });
    this.index = this.rawIndex();
    return this.sections.map((s) => s.key);
  }

  private rawIndex() {
    const n = this.sections.length;
    if (n < 2) return 0;
    const mid = window.innerHeight / 2;
    const centers = this.sections.map((s) => {
      const r = s.el.getBoundingClientRect();
      return r.top + r.height / 2;
    });
    if (mid <= centers[0]) return 0;
    for (let i = 0; i < n - 1; i++) {
      if (mid < centers[i + 1]) return i + (mid - centers[i]) / (centers[i + 1] - centers[i]);
    }
    return n - 1;
  }

  update(dt: number): Direction {
    if (this.sections.length === 0) {
      return { a: HERO, b: HERO, morph: 0, strength: 0, flow: 1, dominant: "drift" };
    }
    this.index = damp(this.index, this.rawIndex(), 4, dt);
    const i = Math.min(Math.floor(this.index), this.sections.length - 1);
    const a = this.sections[i];
    const b = this.sections[Math.min(i + 1, this.sections.length - 1)];
    const morph = smoothstep(0.2, 0.8, this.index - i);
    return {
      a,
      b,
      morph,
      strength: a.strength + (b.strength - a.strength) * morph,
      flow: a.flow + (b.flow - a.flow) * morph,
      dominant: morph < 0.5 ? a.key : b.key,
    };
  }
}
