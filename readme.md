# Instanced skinned mesh
This repository contains a few classes that allow you to animate a large number of skinned meshes efficiently.

### Demo
[Demo](https://instanced-animation.vercel.app/)

[Editor](https://codesandbox.io/p/github/luis-herasme/instanced-skinned-mesh/main?file=%2Fsrc%2Finstanced-animation%2Fview-sensitive-instanced-animator.ts%3A51%2C47&layout=%257B%2522sidebarPanel%2522%253A%2522EXPLORER%2522%252C%2522rootPanelGroup%2522%253A%257B%2522direction%2522%253A%2522horizontal%2522%252C%2522contentType%2522%253A%2522UNKNOWN%2522%252C%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522id%2522%253A%2522ROOT_LAYOUT%2522%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522contentType%2522%253A%2522UNKNOWN%2522%252C%2522direction%2522%253A%2522vertical%2522%252C%2522id%2522%253A%2522clq2zarx10006356ocduye8ea%2522%252C%2522sizes%2522%253A%255B63.656387835763596%252C36.343612164236404%255D%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522contentType%2522%253A%2522EDITOR%2522%252C%2522direction%2522%253A%2522horizontal%2522%252C%2522id%2522%253A%2522EDITOR%2522%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL%2522%252C%2522contentType%2522%253A%2522EDITOR%2522%252C%2522id%2522%253A%2522clq2zarx10002356ofhj9yg9j%2522%257D%255D%257D%252C%257B%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522contentType%2522%253A%2522SHELLS%2522%252C%2522direction%2522%253A%2522horizontal%2522%252C%2522id%2522%253A%2522SHELLS%2522%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL%2522%252C%2522contentType%2522%253A%2522SHELLS%2522%252C%2522id%2522%253A%2522clq2zarx10004356ompy0ygrz%2522%257D%255D%252C%2522sizes%2522%253A%255B100%255D%257D%255D%257D%252C%257B%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522contentType%2522%253A%2522DEVTOOLS%2522%252C%2522direction%2522%253A%2522vertical%2522%252C%2522id%2522%253A%2522DEVTOOLS%2522%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL%2522%252C%2522contentType%2522%253A%2522DEVTOOLS%2522%252C%2522id%2522%253A%2522clq2zarx10005356o75wwvy81%2522%257D%255D%252C%2522sizes%2522%253A%255B100%255D%257D%255D%252C%2522sizes%2522%253A%255B40%252C60%255D%257D%252C%2522tabbedPanels%2522%253A%257B%2522clq2zarx10002356ofhj9yg9j%2522%253A%257B%2522id%2522%253A%2522clq2zarx10002356ofhj9yg9j%2522%252C%2522tabs%2522%253A%255B%257B%2522id%2522%253A%2522clq303lpx0002356o60fhlog3%2522%252C%2522mode%2522%253A%2522permanent%2522%252C%2522type%2522%253A%2522FILE%2522%252C%2522initialSelections%2522%253A%255B%257B%2522startLineNumber%2522%253A51%252C%2522startColumn%2522%253A47%252C%2522endLineNumber%2522%253A51%252C%2522endColumn%2522%253A47%257D%255D%252C%2522filepath%2522%253A%2522%252Fsrc%252Finstanced-animation%252Fview-sensitive-instanced-animator.ts%2522%252C%2522state%2522%253A%2522IDLE%2522%257D%255D%252C%2522activeTabId%2522%253A%2522clq303lpx0002356o60fhlog3%2522%257D%252C%2522clq2zarx10005356o75wwvy81%2522%253A%257B%2522id%2522%253A%2522clq2zarx10005356o75wwvy81%2522%252C%2522activeTabId%2522%253A%2522clq2zg9el0109356o8xgg79lc%2522%252C%2522tabs%2522%253A%255B%257B%2522type%2522%253A%2522TASK_PORT%2522%252C%2522taskId%2522%253A%2522dev%2522%252C%2522port%2522%253A5173%252C%2522id%2522%253A%2522clq2zg9el0109356o8xgg79lc%2522%252C%2522mode%2522%253A%2522permanent%2522%252C%2522path%2522%253A%2522%252F%2522%257D%255D%257D%252C%2522clq2zarx10004356ompy0ygrz%2522%253A%257B%2522id%2522%253A%2522clq2zarx10004356ompy0ygrz%2522%252C%2522activeTabId%2522%253A%2522clq2zatna007j356ow26rkr1g%2522%252C%2522tabs%2522%253A%255B%257B%2522id%2522%253A%2522clq2zarx10003356o2f4ii0ct%2522%252C%2522mode%2522%253A%2522permanent%2522%252C%2522type%2522%253A%2522TERMINAL%2522%252C%2522shellId%2522%253A%2522clq2zats0000negdobz4s7bxq%2522%257D%252C%257B%2522type%2522%253A%2522TASK_LOG%2522%252C%2522taskId%2522%253A%2522dev%2522%252C%2522id%2522%253A%2522clq2zatna007j356ow26rkr1g%2522%252C%2522mode%2522%253A%2522permanent%2522%257D%252C%257B%2522type%2522%253A%2522TASK_LOG%2522%252C%2522taskId%2522%253A%2522CSB_RUN_OUTSIDE_CONTAINER%253D1%2520devcontainer%2520templates%2520apply%2520--template-id%2520%255C%2522ghcr.io%252Fdevcontainers%252Ftemplates%252Ftypescript-node%255C%2522%2520--template-args%2520%27%257B%257D%27%2520--features%2520%27%255B%255D%27%2522%252C%2522id%2522%253A%2522clq2zcwqo00dc356o7u73gzby%2522%252C%2522mode%2522%253A%2522permanent%2522%257D%255D%257D%257D%252C%2522showDevtools%2522%253Atrue%252C%2522showShells%2522%253Atrue%252C%2522showSidebar%2522%253Atrue%252C%2522sidebarPanelSize%2522%253A15%257D)

## InstancedAnimation

This is an abstraction around the `InstancedSkinnedMesh` class created by CodyJasonBennett, which is a user-land implementation of this [PR](https://github.com/mrdoob/three.js/pull/22667).
One of the main differences is that this class takes a `GLTF` object and extracts all the animations and skinned meshes from it, which creates a more convenient API for the user. This is more similar to the default animation system in `three.js`. Additionally, this class is more high-level and does all the boilerplate for you, so you don't have to update the skinned meshes and bones manually.

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

If you want to manage the animation update rate of each instance yourself, you can use the `updateInstance` method instead of `update`.

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

  this.updateInstance(0);
}
```

## ViewSensitiveInstancedAnimator

This is an abstraction around the `InstancedAnimation` class, which allows you to control the animation update rate based on the distance from the camera and ignore the instances outside the camera's frustum. This is useful for large scenes with many animated objects.

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
