import { THREE } from "../three";
import { InstancedSkinnedMesh } from "./instanced-skinned-mesh";

export type InstancedSkinnedMeshData = {
  position: THREE.Vector3;
  rotation: THREE.Quaternion;
  scale: THREE.Vector3;
  animationIndex: number;
  currentTime: number;
};

export class InstancedSkinnedMeshHandler {
  private mixer: THREE.AnimationMixer;
  private instancesData: InstancedSkinnedMeshData[];
  private skinnedMesh: THREE.SkinnedMesh<THREE.BufferGeometry, THREE.Material>;
  private animationsActions: THREE.AnimationAction[] = [];
  private animations: THREE.AnimationClip[];
  public instancedMesh: InstancedSkinnedMesh;

  constructor({
    count,
    skinnedMesh,
    animations,
    instancesData,
  }: {
    count: number;
    skinnedMesh: THREE.SkinnedMesh<THREE.BufferGeometry, THREE.Material>;
    animations: THREE.AnimationClip[];
    instancesData: InstancedSkinnedMeshData[];
  }) {
    this.instancesData = instancesData;
    this.animations = animations.map((clip) => clip.clone());
    this.skinnedMesh = skinnedMesh.clone();
    this.skinnedMesh.geometry = skinnedMesh.geometry.clone();
    this.skinnedMesh.material = skinnedMesh.material.clone();
    this.skinnedMesh.skeleton = skinnedMesh.skeleton.clone();
    this.skinnedMesh.bindMatrix = skinnedMesh.bindMatrix.clone();
    
    this.instancedMesh = new InstancedSkinnedMesh(
      this.skinnedMesh.geometry,
      this.skinnedMesh.material,
      count
    );

    this.instancedMesh.copy(this.skinnedMesh);
    this.instancedMesh.bind(
      this.skinnedMesh.skeleton,
      this.skinnedMesh.bindMatrix
    );

    this.mixer = new THREE.AnimationMixer(this.skinnedMesh);

    this.animations.forEach((clip, index) => {
      const action = this.mixer.clipAction(clip.clone());
      this.animationsActions[index] = action;
    });

    this.instancedMesh.frustumCulled = false;
  }

  updateInstance(i: number) {
    const instanceData = this.instancesData[i];
    this.animationsActions[instanceData.animationIndex].play();
    this.mixer.setTime(instanceData.currentTime);

    this.skinnedMesh.scale.set(
      instanceData.scale.x,
      instanceData.scale.y,
      instanceData.scale.z
    );

    this.skinnedMesh.position.set(
      instanceData.position.x,
      instanceData.position.y,
      instanceData.position.z
    );

    this.skinnedMesh.quaternion.set(
      instanceData.rotation.x,
      instanceData.rotation.y,
      instanceData.rotation.z,
      instanceData.rotation.w
    );

    this.skinnedMesh.updateMatrix();
    this.skinnedMesh.skeleton.bones.forEach((bone) => bone.updateMatrixWorld());
    this.instancedMesh.setMatrixAt(i, this.skinnedMesh.matrix);
    this.instancedMesh.setBonesAt(i, this.skinnedMesh.skeleton);

    this.animationsActions[instanceData.animationIndex].stop();
  }

  updateInstancedMesh() {
    this.instancedMesh.instanceMatrix.needsUpdate = true;

    if (
      this.instancedMesh.skeleton &&
      // @ts-ignore
      this.instancedMesh.skeleton.bonetexture
    ) {
      // @ts-ignore
      this.instancedMesh.skeleton.bonetexture.needsUpdate = true;
    }
  }

  dispose() {
    this.instancedMesh.dispose();
  }
}
