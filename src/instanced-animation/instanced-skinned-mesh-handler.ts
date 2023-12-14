import { GLTF } from "three/examples/jsm/Addons.js";
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

    this.mixer = new THREE.AnimationMixer(this.skinnedMesh);

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

  updateInstance(i: number, maxLevelOfDetail: number) {
    const instanceData = this.instancesData[i];
    this.animationsActions[instanceData.animationIndex].play();
    // @ts-ignore
    this.mixer.setTime(instanceData.currentTime, maxLevelOfDetail);

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

        bone.matrixWorldNeedsUpdate = false;
      }
    }

    this.instancedMesh.setMatrixAt(i, this.skinnedMesh.matrix);
    this.instancedMesh.setBonesAt(i, this.skinnedMesh.skeleton);

    this.animationsActions[instanceData.animationIndex].stop();
  }

  dispose() {
    this.instancedMesh.dispose();
  }
}
