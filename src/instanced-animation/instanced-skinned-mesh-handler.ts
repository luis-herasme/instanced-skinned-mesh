import { GLTF } from "three/examples/jsm/Addons.js";
import { InstancedSkinnedMesh } from "./instanced-skinned-mesh";
import { AnimationAction } from "../animation-action";
import { AnimationMixer } from "../animation-mixer";

export type AnimationState = {
  animationIndex: number;
  weight: number;
  time: number;
};

export type InstancedSkinnedMeshData = {
  position: THREE.Vector3;
  rotation: THREE.Quaternion;
  scale: THREE.Vector3;
  animations: AnimationState[];
};

export class InstancedSkinnedMeshHandler {
  private mixer: AnimationMixer;
  private animationsActions: AnimationAction[] = [];
  private instancesData: InstancedSkinnedMeshData[];
  private skinnedMesh: THREE.SkinnedMesh<THREE.BufferGeometry, THREE.Material>;
  private animations: THREE.AnimationClip[];
  public instancedMesh: InstancedSkinnedMesh;

  constructor({
    count,
    skinnedMesh,
    animations,
    instancesData,
    gltf,
  }: {
    count: number;
    skinnedMesh: THREE.SkinnedMesh<THREE.BufferGeometry, THREE.Material>;
    animations: THREE.AnimationClip[];
    instancesData: InstancedSkinnedMeshData[];
    gltf: GLTF;
  }) {
    this.instancesData = instancesData;
    this.animations = animations;
    this.skinnedMesh = skinnedMesh;

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

    this.mixer = new AnimationMixer(this.skinnedMesh);

    this.animations.forEach((clip, index) => {
      const newClip = clip.clone();
      newClip.tracks.forEach((track) => {
        const interpolantBone = gltf.scene.getObjectByName(
          track.name.split(".")[0]
        );
        // @ts-ignore
        track.level = interpolantBone.userData.level;
      });
      const action = this.mixer.clipAction(newClip);
      this.animationsActions[index] = action;
    });

    this.instancedMesh.frustumCulled = false;

    for (const bone of this.skinnedMesh.skeleton.bones) {
      bone.matrixWorldAutoUpdate = false;
    }
  }

  updateInstance(i: number, _maxLevelOfDetail: number) {
    this.updateMixer(this.instancesData[i].animations);
    this.updateSkinnedMeshMatrix(i);
  }

  dispose() {
    this.instancedMesh.dispose();
  }

  updateMixer(animations: AnimationState[]) {
    this.mixer.stopAllAction();

    for (let i = 0; animations.length > i; i++) {
      const animationAction =
        this.animationsActions[animations[i].animationIndex];
      animationAction.play();
      animationAction.setEffectiveWeight(animations[i].weight);
      animationAction.time = animations[i].time;
    }

    this.mixer.update(0.001);

    const bonesLength = this.skinnedMesh.skeleton.bones.length;
    for (let i = 0; bonesLength > i; i++) {
      const bone = this.skinnedMesh.skeleton.bones[i];
      if (bone.matrixAutoUpdate) {
        bone.updateMatrix();
      }

      if (bone.matrixWorldNeedsUpdate) {
        if (bone.parent === null) {
          bone.matrixWorld.copy(bone.matrix);
        } else {
          bone.matrixWorld.multiplyMatrices(
            bone.parent.matrixWorld,
            bone.matrix
          );
        }
      }
    }
  }

  stopAnimation(animationIndex: number) {
    this.animationsActions[animationIndex].stop();
  }

  updateSkinnedMeshMatrix(i: number) {
    const instanceData = this.instancesData[i];
    this.skinnedMesh.scale.copy(instanceData.scale);
    this.skinnedMesh.position.copy(instanceData.position);
    this.skinnedMesh.quaternion.copy(instanceData.rotation);

    this.skinnedMesh.updateMatrix();
    this.instancedMesh.setMatrixAt(i, this.skinnedMesh.matrix);
    this.instancedMesh.setBonesAt(i, this.skinnedMesh.skeleton);
  }
}
