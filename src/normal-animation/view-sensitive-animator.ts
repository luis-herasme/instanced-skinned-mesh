import { THREE } from "../three";
import { AnimationInstance } from "./normal-animation";

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export class ViewSensitiveAnimator {
  private camera: THREE.Camera;
  private instances: AnimationInstance[];
  private modelBoundingBox: THREE.Box3;
  private lastUpdateTimes: number[] = [];

  public maxDistance: number;
  public minAnimationInterval: number;
  public maxAnimationInterval: number;

  public group = new THREE.Group();

  rootBones: THREE.Bone[] = [];
  skinnedMeshes: THREE.SkinnedMesh<THREE.BufferGeometry, THREE.Material>[] = [];

  constructor({
    camera,
    minAnimationInterval,
    maxAnimationInterval,
    maxDistance,
    instances,
  }: {
    camera: THREE.Camera;
    minAnimationInterval: number;
    maxAnimationInterval: number;
    maxDistance: number;
    instances: AnimationInstance[];
  }) {
    this.camera = camera;
    this.minAnimationInterval = minAnimationInterval;
    this.maxAnimationInterval = maxAnimationInterval;
    this.maxDistance = maxDistance;
    this.instances = instances;

    this.modelBoundingBox = new THREE.Box3().setFromObject(instances[0].model);
    this.modelBoundingBox.translate(
      instances[0].model.position.clone().negate()
    );

    for (let i = 0; i < instances.length; i++) {
      const instance = instances[i];
      const rootBone = instance.model.getObjectByProperty(
        "isBone",
        true
      ) as THREE.Bone;
      rootBone.matrixWorldAutoUpdate = false;

      const skinnedMesh = instance.model.getObjectByProperty(
        "isSkinnedMesh",
        true
      ) as THREE.SkinnedMesh<THREE.BufferGeometry, THREE.Material>;
      skinnedMesh.bindMode = "detached";
      
      this.rootBones.push(rootBone);
      this.skinnedMeshes.push(skinnedMesh);
      this.group.add(rootBone);
    }
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

    for (let i = 0; i < this.instances.length; i++) {
      const instance = this.instances[i];
      const distance = instance.model.position.distanceTo(this.camera.position);

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
      this.modelBoundingBox.translate(instance.model.position);

      if (!cameraFrustum.intersectsBox(this.modelBoundingBox)) {
        this.modelBoundingBox.translate(
          instance.model.position.clone().negate()
        );
        continue;
      }

      this.modelBoundingBox.translate(instance.model.position.clone().negate());
      let instanceDelta = deltaTime;

      if (this.lastUpdateTimes[i] !== undefined) {
        instanceDelta = now - this.lastUpdateTimes[i];
      }

      instance.update(instanceDelta / 1000);
      // @ts-ignore
      this.skinnedMeshes[i].skeleton.needsUpdate = true;
      this.rootBones[i].updateWorldMatrix(false, true);

      this.lastUpdateTimes[i] = now;
    }
  }
}
