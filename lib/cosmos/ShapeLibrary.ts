import * as THREE from "three";
import { buildShape, type ShapeContext } from "./shapes";

export class ShapeLibrary {
  private textures = new Map<string, THREE.DataTexture>();

  constructor(
    private side: number,
    private ctx: ShapeContext,
  ) {}

  get(key: string) {
    let tex = this.textures.get(key);
    if (!tex) {
      const data = new Float32Array(this.side * this.side * 4);
      buildShape(key, data, this.side * this.side, this.ctx);
      tex = new THREE.DataTexture(data, this.side, this.side, THREE.RGBAFormat, THREE.FloatType);
      tex.needsUpdate = true;
      this.textures.set(key, tex);
    }
    return tex;
  }

  resize(ctx: ShapeContext) {
    const changed = Math.abs(ctx.halfW - this.ctx.halfW) / this.ctx.halfW > 0.08 ||
      Math.abs(ctx.halfH - this.ctx.halfH) / this.ctx.halfH > 0.08;
    if (!changed) return;
    this.ctx = ctx;
    for (const [key, tex] of this.textures) {
      buildShape(key, tex.image.data as Float32Array, this.side * this.side, ctx);
      tex.needsUpdate = true;
    }
  }

  dispose() {
    this.textures.forEach((t) => t.dispose());
    this.textures.clear();
  }
}
