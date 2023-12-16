import "./style.css";
import { THREE } from "./three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { InstancedAnimation } from "./instanced-animation/instanced-animation";
import { GROUND_SIZE, PADDING, setup } from "./setup";
import { Settings, setupGUI } from "./gui";
import {
  AnimationInstance,
  createInstance,
} from "./normal-animation/normal-animation";
import { ViewSensitiveInstancedAnimator } from "./instanced-animation/view-sensitive-instanced-animator";
import { ViewSensitiveAnimator } from "./normal-animation/view-sensitive-animator";

const loader = new GLTFLoader();
const gltf = await loader.loadAsync("zombie.glb");

const sceneManager = setup();

type Scenario = {
  update: (deltaTime: number) => void;
  destroy: () => void;
};

type ScenarioCreator = (settings: Settings) => Scenario;

const noInstancedNoViewSensitive: ScenarioCreator = (settings: Settings) => {
  const instances: AnimationInstance[] = [];

  for (let i = 0; i < settings.numberOfInstances; i++) {
    const x = ((i * PADDING) % GROUND_SIZE) - GROUND_SIZE / 2;
    const y =
      Math.floor((i * PADDING) / GROUND_SIZE) * PADDING - GROUND_SIZE / 2;

    const animationInstance = createInstance(gltf, new THREE.Vector3(x, 0, y));
    instances.push(animationInstance);
  }
  sceneManager.scene.add(...instances.map((instance) => instance.model));

  return {
    update: (deltaTime: number) => {
      for (const instance of instances) {
        instance.update(deltaTime);
      }
    },
    destroy: () => {
      sceneManager.scene.remove(...instances.map((instance) => instance.model));
    },
  };
};

const instancedNoViewSensitive: ScenarioCreator = (settings: Settings) => {
  const instancedAnimation = new InstancedAnimation({
    gltf: gltf,
    count: settings.numberOfInstances,
  });

  for (let i = 0; i < settings.numberOfInstances; i++) {
    const x = ((i * PADDING) % GROUND_SIZE) - GROUND_SIZE / 2;
    const y =
      Math.floor((i * PADDING) / GROUND_SIZE) * PADDING - GROUND_SIZE / 2;

    instancedAnimation.addInstance({
      position: new THREE.Vector3(x, 0, y),
      currentTime: Math.random(),
      animationIndex: Math.floor(
        Math.random() * instancedAnimation.animations.length
      ),
      rotation: new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0),
        Math.PI / 2
      ),
      scale: new THREE.Vector3(0.01, 0.01, 0.01),
    });
  }

  sceneManager.scene.add(instancedAnimation.group);

  return {
    update: (deltaTime: number) => {
      instancedAnimation.update(deltaTime);
    },
    destroy: () => {
      sceneManager.scene.remove(instancedAnimation.group);
      instancedAnimation.dispose();
    },
  };
};

const instancedViewSensitive: ScenarioCreator = (settings: Settings) => {
  const viewSensitiveInstancedAnimation = new ViewSensitiveInstancedAnimator({
    camera: sceneManager.camera,
    minAnimationInterval: settings.minAnimationInterval,
    maxAnimationInterval: settings.maxAnimationInterval,
    maxDistance: settings.maxDistance,
    gltf: gltf,
    count: settings.numberOfInstances,
  });

  for (let i = 0; i < settings.numberOfInstances; i++) {
    const x = ((i * PADDING) % GROUND_SIZE) - GROUND_SIZE / 2;
    const y =
      Math.floor((i * PADDING) / GROUND_SIZE) * PADDING - GROUND_SIZE / 2;

    viewSensitiveInstancedAnimation.addInstance({
      position: new THREE.Vector3(x, 0, y),
      currentTime: Math.random(),
      animationIndex: Math.floor(
        Math.random() * viewSensitiveInstancedAnimation.animations.length
      ),
      rotation: new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0),
        Math.PI / 2
      ),
      scale: new THREE.Vector3(0.01, 0.01, 0.01),
    });
  }

  sceneManager.scene.add(viewSensitiveInstancedAnimation.group);

  return {
    update: (deltaTime: number) => {
      viewSensitiveInstancedAnimation.update(deltaTime);
    },
    destroy: () => {
      sceneManager.scene.remove(viewSensitiveInstancedAnimation.group);
    },
  };
};

const noInstancedViewSensitive: ScenarioCreator = (settings: Settings) => {
  const instances: AnimationInstance[] = [];

  for (let i = 0; i < settings.numberOfInstances; i++) {
    const x = ((i * PADDING) % GROUND_SIZE) - GROUND_SIZE / 2;
    const y =
      Math.floor((i * PADDING) / GROUND_SIZE) * PADDING - GROUND_SIZE / 2;

    const animationInstance = createInstance(gltf, new THREE.Vector3(x, 0, y));

    instances.push(animationInstance);
  }
  const viewSensitiveInstancedAnimation = new ViewSensitiveAnimator({
    camera: sceneManager.camera,
    minAnimationInterval: settings.minAnimationInterval,
    maxAnimationInterval: settings.maxAnimationInterval,
    maxDistance: settings.maxDistance,
    instances,
  });

  sceneManager.scene.add(...instances.map((instance) => instance.model));
  sceneManager.scene.add(viewSensitiveInstancedAnimation.group);

  return {
    update: (deltaTime: number) => {
      viewSensitiveInstancedAnimation.update(deltaTime);
    },
    destroy: () => {
      sceneManager.scene.remove(...instances.map((instance) => instance.model));
      sceneManager.scene.remove(viewSensitiveInstancedAnimation.group);
    },
  };
};

let scenario: Scenario | null = null;

setupGUI((settings: Settings) => {
  if (scenario) {
    scenario.destroy();
  }

  if (!settings.instanced && !settings.viewSensitive) {
    scenario = noInstancedNoViewSensitive(settings);
  } else if (settings.instanced && !settings.viewSensitive) {
    scenario = instancedNoViewSensitive(settings);
  } else if (!settings.instanced && settings.viewSensitive) {
    scenario = noInstancedViewSensitive(settings);
  } else if (settings.instanced && settings.viewSensitive) {
    scenario = instancedViewSensitive(settings);
  } else {
    throw new Error("Invalid settings");
  }
});

const clock = new THREE.Clock();

function animate() {
  const deltaTime = clock.getDelta();

  sceneManager.stats.begin();

  if (scenario) {
    scenario.update(deltaTime);
  }

  sceneManager.update(deltaTime);
  sceneManager.stats.end();
  requestAnimationFrame(animate);
}

animate();
