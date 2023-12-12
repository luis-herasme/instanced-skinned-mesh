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
  public minAnimationDuration: number;
  public maxAnimationDuration: number;

  public group = new THREE.Group();

  rootBones: THREE.Bone[] = [];
  skinnedMeshes: THREE.SkinnedMesh<THREE.BufferGeometry, THREE.Material>[] = [];

  // FOR DEBUGGING
  private instancesInsideFrustum: boolean[] = [];

  constructor({
    camera,
    minAnimationDuration,
    maxAnimationDuration,
    maxDistance,
    instances,
  }: {
    camera: THREE.Camera;
    minAnimationDuration: number;
    maxAnimationDuration: number;
    maxDistance: number;
    instances: AnimationInstance[];
  }) {
    this.camera = camera;
    this.minAnimationDuration = minAnimationDuration;
    this.maxAnimationDuration = maxAnimationDuration;
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

  get numberOfInstancesInsideFrustum() {
    return this.instancesInsideFrustum.filter((inside) => inside).length;
  }

  public update(deltaTime: number) {
    console.log("Number of instances inside frustum: ", this.numberOfInstancesInsideFrustum)
    let instancesUpdated = 0;
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
        this.minAnimationDuration,
        this.maxAnimationDuration,
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
        this.instancesInsideFrustum[i] = false;
        continue;
      } else {
        this.instancesInsideFrustum[i] = true;
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
      instancesUpdated++;
    }

    console.log("instancesUpdated: ", instancesUpdated);
  }
}
