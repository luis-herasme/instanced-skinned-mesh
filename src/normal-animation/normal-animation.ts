import * as THREE from "three";
import { GLTF, SkeletonUtils } from "three/examples/jsm/Addons.js";

export type AnimationInstance = {
  model: THREE.Object3D;
  update: (deltaTime: number) => void;
};

export function createInstance(
  gltf: GLTF,
  position: THREE.Vector3
): AnimationInstance {
  const model = SkeletonUtils.clone(gltf.scene);
  model.position.copy(position);

  const mixer = new THREE.AnimationMixer(model);
  const animationIndex = Math.floor(Math.random() * gltf.animations.length);
  mixer.clipAction(gltf.animations[animationIndex].clone()).play();

  const update = (deltaTime: number) => {
    mixer.update(deltaTime);
  };

  return {
    model,
    update,
  };
}
