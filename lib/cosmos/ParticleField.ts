import * as THREE from "three";
import { GPUComputationRenderer, type Variable } from "three/addons/misc/GPUComputationRenderer.js";
import { gaussian, mulberry32 } from "./math";
import { pointsFragment, pointsVertex, positionShader, velocityShader } from "./shaders";

type Options = {
  side: number;
  dataType: THREE.TextureDataType;
  bigBang: boolean;
  bounds: THREE.Vector3;
};

export class ParticleField {
  readonly side: number;
  readonly count: number;
  readonly points: THREE.Points;
  readonly sim: Record<string, THREE.IUniform>;
  readonly render: Record<string, THREE.IUniform>;

  private gpu: GPUComputationRenderer;
  private posVar: Variable;
  private velVar: Variable;
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;

  constructor(renderer: THREE.WebGLRenderer, blank: THREE.Texture, opts: Options) {
    this.side = opts.side;
    this.count = opts.side * opts.side;

    this.gpu = new GPUComputationRenderer(opts.side, opts.side, renderer);
    this.gpu.setDataType(opts.dataType);

    const pos0 = this.gpu.createTexture();
    const vel0 = this.gpu.createTexture();
    this.seed(pos0.image.data as Float32Array, vel0.image.data as Float32Array, opts);

    this.velVar = this.gpu.addVariable("textureVelocity", velocityShader, vel0);
    this.posVar = this.gpu.addVariable("texturePosition", positionShader, pos0);
    this.gpu.setVariableDependencies(this.velVar, [this.velVar, this.posVar]);
    this.gpu.setVariableDependencies(this.posVar, [this.velVar, this.posVar]);

    this.sim = this.velVar.material.uniforms;
    Object.assign(this.sim, {
      uTime: { value: 0 },
      uDelta: { value: 0 },
      uMotion: { value: 1 },
      uPointer: { value: new THREE.Vector3(0, 0, 100) },
      uPointerVel: { value: new THREE.Vector3() },
      uPointerActive: { value: 0 },
      uGravity: { value: 7 },
      uHold: { value: 0 },
      uShock: { value: new THREE.Vector4(0, 0, 0, -1) },
      uShockPower: { value: 0 },
      uLaunch: { value: 0 },
      uShapeA: { value: blank },
      uShapeB: { value: blank },
      uOffsetA: { value: new THREE.Vector3() },
      uOffsetB: { value: new THREE.Vector3() },
      uSpinA: { value: new THREE.Vector2() },
      uSpinB: { value: new THREE.Vector2() },
      uScaleA: { value: new THREE.Vector3(1, 1, 1) },
      uScaleB: { value: new THREE.Vector3(1, 1, 1) },
      uMorph: { value: 0 },
      uStrength: { value: 0 },
      uFlow: { value: 1 },
      uBounds: { value: opts.bounds },
    });
    const posUniforms = this.posVar.material.uniforms;
    posUniforms.uDelta = this.sim.uDelta;
    posUniforms.uMotion = this.sim.uMotion;

    const error = this.gpu.init();
    if (error) throw new Error(error);

    const refs = new Float32Array(this.count * 2);
    const rands = new Float32Array(this.count);
    const rand = mulberry32(7);
    for (let i = 0; i < this.count; i++) {
      refs[i * 2] = ((i % opts.side) + 0.5) / opts.side;
      refs[i * 2 + 1] = (Math.floor(i / opts.side) + 0.5) / opts.side;
      rands[i] = rand();
    }
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(this.count * 3), 3));
    this.geometry.setAttribute("aRef", new THREE.BufferAttribute(refs, 2));
    this.geometry.setAttribute("aRand", new THREE.BufferAttribute(rands, 1));
    this.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e4);

    this.render = {
      uPos: { value: null },
      uVel: { value: null },
      uSize: { value: 2.4 },
      uScale: { value: 1 },
      uOpacity: { value: 0 },
      uPointer: this.sim.uPointer,
      uPointerActive: this.sim.uPointerActive,
    };
    this.material = new THREE.ShaderMaterial({
      uniforms: this.render,
      vertexShader: pointsVertex,
      fragmentShader: pointsFragment,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.bindTextures();
  }

  private seed(pos: Float32Array, vel: Float32Array, opts: Options) {
    const rand = mulberry32(1337);
    const { x: bx, y: by } = opts.bounds;
    for (let i = 0; i < this.count; i++) {
      const o = i * 4;
      pos[o + 3] = rand();
      if (opts.bigBang) {
        const dir = new THREE.Vector3(gaussian(rand), gaussian(rand), gaussian(rand) * 0.6).normalize();
        const r = rand() * 0.25;
        const speed = 2 + Math.pow(rand(), 0.6) * 11;
        pos[o] = dir.x * r;
        pos[o + 1] = dir.y * r;
        pos[o + 2] = dir.z * r;
        vel[o] = dir.x * speed - dir.y * speed * 0.35;
        vel[o + 1] = dir.y * speed + dir.x * speed * 0.35;
        vel[o + 2] = dir.z * speed;
      } else {
        pos[o] = (rand() * 2 - 1) * bx;
        pos[o + 1] = (rand() * 2 - 1) * by;
        pos[o + 2] = (rand() * 2 - 1) * 3.5;
      }
    }
  }

  private bindTextures() {
    this.render.uPos.value = this.gpu.getCurrentRenderTarget(this.posVar).texture;
    this.render.uVel.value = this.gpu.getCurrentRenderTarget(this.velVar).texture;
  }

  step() {
    this.gpu.compute();
    this.bindTextures();
  }

  dispose() {
    this.gpu.dispose();
    this.geometry.dispose();
    this.material.dispose();
  }
}
