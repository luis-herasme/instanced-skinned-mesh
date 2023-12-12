import { THREE } from "./three";
import Stats from "stats.js";
import { MapControls } from "three/examples/jsm/Addons.js";

export const PADDING = 5;
export const GROUND_SIZE = 250;

type SceneManager = {
  stats: Stats;
  camera: THREE.Camera;
  scene: THREE.Scene;
  update: (deltaTime: number) => void;
  destroy: () => void;
};

export function setup(): SceneManager {
  // Setup scene
  const stats = new Stats();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  camera.position.z = 100;
  camera.position.y = 100;

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(stats.dom);
  document.body.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
  directionalLight.position.set(0, 10, 0);
  scene.add(ambientLight);
  scene.add(directionalLight);

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(GROUND_SIZE * 2, GROUND_SIZE * 2),
    new THREE.MeshBasicMaterial({ color: 0xcccccc })
  );

  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Controls
  const controls = new MapControls(camera, renderer.domElement);

  const onResize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };

  onResize();
  window.addEventListener("resize", onResize);

  return {
    stats,
    scene,
    camera,
    update: (deltaTime: number) => {
      controls.update(deltaTime);
      renderer.render(scene, camera);
    },
    destroy() {
      window.removeEventListener("resize", onResize);
      document.body.removeChild(renderer.domElement);
      document.body.removeChild(stats.dom);
    },
  };
}
