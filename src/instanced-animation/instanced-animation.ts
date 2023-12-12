import * as THREE from "three";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";
import { GLTF } from "three/examples/jsm/Addons.js";
import {
  InstancedSkinnedMeshData,
  InstancedSkinnedMeshHandler,
} from "./instanced-skinned-mesh-handler";

type SimpleSkinnedMesh = THREE.SkinnedMesh<
  THREE.BufferGeometry,
  THREE.Material
>;

function getSkinnedMesh(gltf: GLTF): SimpleSkinnedMesh[] {
  const { scene } = gltf;

  const skinnedMeshes = SkeletonUtils.clone(scene).getObjectsByProperty(
    "isSkinnedMesh",
    true
  ) as SimpleSkinnedMesh[];

  if (!skinnedMeshes || skinnedMeshes.length === 0) {
    throw new Error("Skinned mesh not found");
  }

  for (let i = 0; i < skinnedMeshes.length; i++) {
    if (skinnedMeshes[i].material && Array.isArray(skinnedMeshes[i].material)) {
      throw new Error("Skinned mesh has multiple materials");
    }
  }

  return skinnedMeshes;
}

export class InstancedAnimation {
  public group = new THREE.Group();
  public animations: THREE.AnimationClip[] = [];
  public instancesData: InstancedSkinnedMeshData[] = [];
  private skinnedMeshesAnimations: InstancedSkinnedMeshHandler[] = [];

  constructor({ gltf, count }: { gltf: GLTF; count: number }) {
    this.animations = gltf.animations.map((clip) => clip.clone());
    const skinnedMeshes = getSkinnedMesh(gltf);

    for (const skinnedMesh of skinnedMeshes) {
      const instancedSkinnedMeshHandler = new InstancedSkinnedMeshHandler({
        count,
        skinnedMesh,
        animations: this.animations,
        instancesData: this.instancesData,
      });

      this.skinnedMeshesAnimations.push(instancedSkinnedMeshHandler);
      this.group.add(instancedSkinnedMeshHandler.instancedMesh);
    }
  }

  dispose() {
    for (const skinnedMeshAnimation of this.skinnedMeshesAnimations) {
      skinnedMeshAnimation.dispose();
    }
  }

  update(deltaTime: number) {
    for (let i = 0; i < this.instancesData.length; i++) {
      const instanceData = this.instancesData[i];

      instanceData.currentTime =
        (instanceData.currentTime + deltaTime) %
        this.animations[instanceData.animationIndex].duration;

      this.updateInstance(i);
    }

    this.updateSkinnedMeshes();
  }

  updateInstance(i: number) {
    for (let j = 0; j < this.skinnedMeshesAnimations.length; j++) {
      this.skinnedMeshesAnimations[j].updateInstance(i);
    }
  }

  updateSkinnedMeshes() {
    for (const skinnedMeshAnimation of this.skinnedMeshesAnimations) {
      skinnedMeshAnimation.updateInstancedMesh();
    }
  }

  addInstance(data: InstancedSkinnedMeshData) {
    this.instancesData.push(data);

    this.skinnedMeshesAnimations.forEach((skinnedMeshAnimation) => {
      skinnedMeshAnimation.updateInstance(this.instancesData.length - 1);
    });
  }
}
