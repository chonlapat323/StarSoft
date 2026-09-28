import * as THREE from "three";
import { damp } from "./math";

const DISTANCE = 16;

export class CameraRig {
  readonly camera: THREE.PerspectiveCamera;
  reducedMotion = false;
  private yaw = 0;
  private pitch = 0;
  private px = 0;
  private py = 0;
  private time = 0;

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(35, aspect, 0.1, 100);
    this.camera.position.set(0, 0, DISTANCE);
  }

  get halfExtents() {
    const halfH = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * DISTANCE;
    return { halfW: halfH * this.camera.aspect, halfH };
  }

  resize(aspect: number) {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  update(dt: number, pointerNx: number, pointerNy: number, scrollProgress: number) {
    this.time += dt;
    const still = this.reducedMotion;
    const targetYaw = still ? 0 : (scrollProgress - 0.5) * 0.3;
    const targetPitch = still ? 0 : Math.sin(scrollProgress * Math.PI) * 0.08;
    this.yaw = damp(this.yaw, targetYaw, 1.6, dt);
    this.pitch = damp(this.pitch, targetPitch, 1.6, dt);
    this.px = damp(this.px, still ? 0 : pointerNx * 0.45, 2.2, dt);
    this.py = damp(this.py, still ? 0 : pointerNy * 0.28, 2.2, dt);

    const breathe = still ? 0 : Math.sin(this.time * 0.21) * 0.12;
    const c = this.camera;
    c.position.set(
      Math.sin(this.yaw) * DISTANCE + this.px,
      Math.sin(this.pitch) * DISTANCE + this.py + breathe * 0.5,
      Math.cos(this.yaw) * DISTANCE + breathe,
    );
    c.lookAt(0, 0, 0);
  }
}
