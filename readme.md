# Instanced skinned mesh

## InstancedAnimation

This is an abstraction around the `InstancedSkinnedMesh` class created by CodyJasonBennett which is a user-land implementation of this [PR](https://github.com/mrdoob/three.js/pull/22667).
One of the main differences is that this class takes a `GLTF` object and extracts all the animations and skinned meshes from it, which creates a more convenient API for the user. This is more similar to default animation system in `three.js`.

### Usage

```ts
import { InstancedAnimation } from "./InstancedAnimation.ts";

const instancedAnimation = new InstancedAnimation({
  gltf: gltf,
  count: 100,
});

const instance = {
  position: new THREE.Vector3(0, 0, 0),
  rotation: new THREE.Quaternion(),
  scale: new THREE.Vector3(1, 1, 1),
  animationIndex: 0,
  currentTime: 0,
};

instancedAnimation.addInstance(instance);

function update(deltaTime) {
  instancedAnimation.update(deltaTime); // Updates the currentTime of each instance

  // You can modify the instance properties directly, for example:
  instance.position.x += 1;
}
```

If you want to manage the animation update rate of each instance yourself, you can use the `updateInstance` method instead of `update`:

```ts
import { InstancedAnimation } from "./InstancedAnimation.ts";

const instancedAnimation = new InstancedAnimation({
  gltf: gltf,
  count: 100,
});

const instance = {
  position: new THREE.Vector3(0, 0, 0),
  rotation: new THREE.Quaternion(),
  scale: new THREE.Vector3(1, 1, 1),
  animationIndex: 0,
  currentTime: 0,
};

instancedAnimation.addInstance(instance);

function update(deltaTime) {
  instance.currentTime =
    (instance.currentTime + deltaTime) %
    gltf.animations[instance.animationIndex].duration;

  this.updateInstance(i);
  this.updateSkinnedMeshes();
}
```

## ViewSensitiveInstancedAnimator

This is an abstraction around the `InstancedAnimation` class which allows you to control the animation update rate based on the distance from the camera and ignore the instances that are outside of the camera's frustum. This is useful for large scenes with many animated objects.

### Usage

```ts
import { ViewSensitiveInstancedAnimator } from "./ViewSensitiveInstancedAnimator.ts";

const viewSensitiveInstancedAnimator = new ViewSensitiveInstancedAnimator({
  gltf: gltf,
  count: 100,
  camera: camera,
  maxAnimationDuration: 100, // This is the update rate when the instance is at `maxDistance`
  minAnimationDuration: 1000 / 60, // This is the update rate when the instance in front of the camera
  maxDistance: 80, // This is the distance at which the instance will be updated at `maxAnimationDuration`
});

const instance = {
  position: new THREE.Vector3(0, 0, 0),
  rotation: new THREE.Quaternion(),
  scale: new THREE.Vector3(1, 1, 1),
  animationIndex: 0,
  currentTime: 0,
};

viewSensitiveInstancedAnimator.addInstance(instance);

function update(deltaTime) {
  viewSensitiveInstancedAnimator.update(deltaTime);
}
```
