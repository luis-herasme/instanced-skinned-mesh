import { THREE } from "../three";
import { InstancedAnimation } from "./instanced-animation";
import { GLTF } from "three/examples/jsm/Addons.js";
import { InstancedSkinnedMeshData } from "./instanced-skinned-mesh-handler";

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export class ViewSensitiveInstancedAnimator {
  private camera: THREE.Camera;
  private instancedAnimation: InstancedAnimation;
  private modelBoundingBox: THREE.Box3;
  private lastUpdateTimes: number[] = [];

  public maxDistance: number;
  public minAnimationDuration: number;
  public maxAnimationDuration: number;

  // FOR DEBUGGING
  private instancesInsideFrustum: boolean[] = [];

  constructor({
    camera,
    minAnimationDuration,
    maxAnimationDuration,
    maxDistance,
    gltf,
    count,
  }: {
    camera: THREE.Camera;
    minAnimationDuration: number;
    maxAnimationDuration: number;
    maxDistance: number;
    gltf: GLTF;
    count: number;
  }) {
    this.camera = camera;
    this.minAnimationDuration = minAnimationDuration;
    this.maxAnimationDuration = maxAnimationDuration;
    this.maxDistance = maxDistance;
    this.instancedAnimation = new InstancedAnimation({ gltf, count });
    this.modelBoundingBox = new THREE.Box3().setFromObject(gltf.scene.clone());
  }

  get numberOfInstancesInsideFrustum() {
    return this.instancesInsideFrustum.filter((inside) => inside).length;
  }

  public addInstance(data: InstancedSkinnedMeshData) {
    this.instancedAnimation.addInstance(data);
  }

  public update(deltaTime: number) {
    console.log("Number of instances inside frustum: ", this.numberOfInstancesInsideFrustum)
    let instancesUpdated = 0;
    const now = Date.now();
    const cameraFrustum = new THREE.Frustum();

    cameraFrustum.setFromProjectionMatrix(
      new THREE.Matrix4().multiplyMatrices(
        this.camera.projectionMatrix,
        this.camera.matrixWorldInverse
      )
    );

    for (let i = 0; i < this.instancedAnimation.instancesData.length; i++) {
      const instanceData = this.instancedAnimation.instancesData[i];

      instanceData.currentTime =
        (instanceData.currentTime + deltaTime) %
        this.instancedAnimation.animations[instanceData.animationIndex]
          .duration;

      const distance = instanceData.position.distanceTo(this.camera.position);

      // updateRate, how many times per second we should update the instance,
      // based on the distance from the camera
      const updateRate = lerp(
        this.minAnimationDuration,
        this.maxAnimationDuration,
        distance / this.maxDistance
      );

      if (now - this.lastUpdateTimes[i] < updateRate) {
        continue;
      }

      // Check if instance is inside frustum
      this.modelBoundingBox.translate(instanceData.position);

      if (!cameraFrustum.intersectsBox(this.modelBoundingBox)) {
        this.modelBoundingBox.translate(instanceData.position.clone().negate());
        this.instancesInsideFrustum[i] = false;
        continue;
      } else {
        this.instancesInsideFrustum[i] = true;
      }

      this.modelBoundingBox.translate(instanceData.position.clone().negate());
      this.instancedAnimation.updateInstance(i);
      this.lastUpdateTimes[i] = now;
      instancesUpdated++;
    }

    this.instancedAnimation.updateSkinnedMeshes();
    console.log("instancesUpdated: ", instancesUpdated);
  }

  get group() {
    return this.instancedAnimation.group;
  }

  get animations() {
    return this.instancedAnimation.animations;
  }
}
