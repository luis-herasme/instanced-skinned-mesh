import { THREE } from "../three";
import { InstancedAnimation } from "./instanced-animation";
import { GLTF } from "three/examples/jsm/Addons.js";
import { InstancedSkinnedMeshData } from "./instanced-skinned-mesh-handler";

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

type AnimationGroupID = string;
type AnimationGroup = {
  animationIndex: number;
  currentTime: number;
  instancesIDs: number[];
};

type AnimationGroups = Map<AnimationGroupID, AnimationGroup>;

export class ViewSensitiveInstancedAnimator {
  private camera: THREE.Camera;
  private instancedAnimation: InstancedAnimation;
  private modelBoundingBox: THREE.Box3;
  private lastUpdateTimes: number[] = [];
  private animationGroups: AnimationGroups = new Map();

  public maxDistance: number;
  public minAnimationDuration: number;
  public maxAnimationDuration: number;

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

  public addInstance(data: InstancedSkinnedMeshData) {
    this.instancedAnimation.addInstance(data);
  }

  public update(deltaTime: number) {
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

      const animationDuration =
        this.instancedAnimation.animations[instanceData.animationIndex]
          .duration;

      instanceData.currentTime = instanceData.currentTime + deltaTime;

      if (instanceData.currentTime > animationDuration) {
        instanceData.currentTime = 0;
      }

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
        continue;
      }

      this.modelBoundingBox.translate(instanceData.position.clone().negate());

      const minAnimationDurationInSeconds = this.minAnimationDuration / 1000;

      let currentTime =
        Math.round(instanceData.currentTime / minAnimationDurationInSeconds) *
        minAnimationDurationInSeconds;

      if (distance > this.maxDistance) {
        const maxAnimationDurationInSeconds = this.maxAnimationDuration / 1000;

        currentTime =
          Math.round(instanceData.currentTime / maxAnimationDurationInSeconds) *
          maxAnimationDurationInSeconds;
      }

      const groupID = `${instanceData.animationIndex}-${currentTime}`;
      let group = this.animationGroups.get(groupID);

      if (group === undefined) {
        group = {
          animationIndex: instanceData.animationIndex,
          currentTime: currentTime,
          instancesIDs: [i],
        };

        this.animationGroups.set(groupID, group);
      } else {
        group.instancesIDs.push(i);
      }

      this.lastUpdateTimes[i] = now;
    }

    for (const group of this.animationGroups.values()) {
      this.instancedAnimation.updateMixer({
        animationIndex: group.animationIndex,
        time: group.currentTime,
      });

      for (const instanceID of group.instancesIDs) {
        this.instancedAnimation.updateSkinnedMeshMatrix(instanceID);
      }

      this.instancedAnimation.stopAnimation(group.animationIndex);
    }

    this.animationGroups.clear();
  }

  get group() {
    return this.instancedAnimation.group;
  }

  get animations() {
    return this.instancedAnimation.animations;
  }
}
