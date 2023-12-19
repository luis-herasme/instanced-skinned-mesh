import { THREE } from "../three";
import { InstancedAnimation } from "./instanced-animation";
import { GLTF } from "three/examples/jsm/Addons.js";
import {
  AnimationState,
  InstancedSkinnedMeshData,
} from "./instanced-skinned-mesh-handler";

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

type AnimationGroupID = string;
type AnimationGroup = {
  animations: Record<string, AnimationState>;
  instancesIDs: number[];
};

type AnimationGroups = Map<AnimationGroupID, AnimationGroup>;

function roundToNearest(value: number, nearest: number): number {
  return Math.round(value / nearest) * nearest;
}

export class ViewSensitiveInstancedAnimator {
  private camera: THREE.Camera;
  private instancedAnimation: InstancedAnimation;
  private modelBoundingBox: THREE.Box3;
  private lastUpdateTimes: number[] = [];
  private animationGroups: AnimationGroups = new Map();

  public maxDistance: number;
  public minAnimationInterval: number;
  public maxAnimationInterval: number;

  constructor({
    camera,
    minAnimationInterval,
    maxAnimationInterval,
    maxDistance,
    gltf,
    count,
  }: {
    camera: THREE.Camera;
    minAnimationInterval: number;
    maxAnimationInterval: number;
    maxDistance: number;
    gltf: GLTF;
    count: number;
  }) {
    this.camera = camera;
    this.minAnimationInterval = minAnimationInterval;
    this.maxAnimationInterval = maxAnimationInterval;
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

      for (const [animationName, animation] of Object.entries(
        instanceData.animations
      )) {
        const animationDuration =
          this.instancedAnimation.animationsByName[animationName].duration;

        animation.time += deltaTime;

        if (animation.time > animationDuration) {
          animation.time = 0;
        }
      }

      const distance = instanceData.position.distanceTo(this.camera.position);

      // updateRate, how many times per second we should update the instance,
      // based on the distance from the camera
      const updateRate = lerp(
        this.minAnimationInterval,
        this.maxAnimationInterval,
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

      const groupID = this.calculateGroupID(instanceData.animations, distance);
      let group = this.animationGroups.get(groupID);

      if (group === undefined) {
        group = {
          animations: instanceData.animations,
          instancesIDs: [i],
        };

        this.animationGroups.set(groupID, group);
      } else {
        group.instancesIDs.push(i);
      }

      this.lastUpdateTimes[i] = now;
    }

    for (const group of this.animationGroups.values()) {
      this.instancedAnimation.updateMixer(group.animations);

      for (const instanceID of group.instancesIDs) {
        this.instancedAnimation.updateSkinnedMeshMatrix(instanceID);
      }
    }

    if (this.animationGroups.size > 0) {
      this.instancedAnimation.instanceMatrixNeedsUpdate();
    }

    this.animationGroups.clear();
  }

  get group() {
    return this.instancedAnimation.group;
  }

  get animations() {
    return this.instancedAnimation.animations;
  }

  private weightPrecision = 0.1;

  private calculateGroupID(
    animations: Record<string, AnimationState>,
    distance: number
  ): string {
    let groupID = "";
    const animationNames = Object.keys(animations).sort();
    const maxAnimationIntervalSeconds = this.maxAnimationInterval / 1000;

    for (const animationName of animationNames) {
      const animation = animations[animationName];

      if (distance > this.maxDistance && animation.weight < 0.99) {
        continue;
      }

      const time = roundToNearest(animation.time, maxAnimationIntervalSeconds);
      const weight = roundToNearest(animation.weight, this.weightPrecision);
      groupID += `${animationName}-${weight}-${time}`;
    }

    return groupID;
  }
}
