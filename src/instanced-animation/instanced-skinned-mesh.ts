import * as THREE from "three";

const _instanceLocalMatrix = /*@__PURE__*/ new THREE.Matrix4();
const _instanceWorldMatrix = /*@__PURE__*/ new THREE.Matrix4();

const _offsetMatrix = /*@__PURE__*/ new THREE.Matrix4();
const _identityMatrix = /*@__PURE__*/ new THREE.Matrix4();

const _instanceIntersects: THREE.Intersection[] = [];

let patchedChunks = false;

export class InstancedSkinnedMesh extends THREE.SkinnedMesh {
  public instanceMatrix: THREE.InstancedBufferAttribute;
  public instanceColor: THREE.InstancedBufferAttribute | null;
  public instanceBones: Float32Array | null;
  public count: number;
  public _mesh: THREE.SkinnedMesh | null;
  public isInstancedMesh: boolean;

  constructor(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    count = 1
  ) {
    super(geometry, material);

    this.instanceMatrix = new THREE.InstancedBufferAttribute(
      new Float32Array(count * 16),
      16
    );
    this.instanceColor = null;
    this.instanceBones = null;

    this.count = count;

    this.frustumCulled = false;

    this._mesh = null;
    this.isInstancedMesh = true;

    const bind = this.bind.bind(this);
    this.bind = function (skeleton, bindMatrix) {
      bind(skeleton, bindMatrix);
      // @ts-ignore
      this.skeleton.update = (instanceBones, id) => {
        const bones = this.skeleton.bones;
        const boneInverses = this.skeleton.boneInverses;
        const boneMatrices = instanceBones || this.skeleton.boneMatrices;
        const boneTexture = this.skeleton.boneTexture;
        const instanceId = id || 0;

        // flatten bone matrices to array
        for (let i = 0, il = bones.length; i < il; i++) {
          // compute the offset between the current and the original transform
          const matrix = bones[i] ? bones[i].matrixWorld : _identityMatrix;

          _offsetMatrix.multiplyMatrices(matrix, boneInverses[i]);
          _offsetMatrix.toArray(
            boneMatrices,
            16 * (i + instanceId * bones.length)
          );
        }

        if (boneTexture !== null) {
          boneTexture.needsUpdate = true;
        }
      };

      // @ts-ignore
      this.skeleton.computeInstancedBoneTexture = () => {
        this.skeleton.boneTexture = new THREE.DataTexture(
          this.instanceBones,
          this.skeleton.bones.length * 4,
          this.count,
          THREE.RGBAFormat,
          THREE.FloatType
        );
        this.skeleton.boneTexture.needsUpdate = true;
      };

      this.skeleton.computeBoneTexture =
        // @ts-ignore
        this.skeleton.computeInstancedBoneTexture;
    };

    if (!patchedChunks) {
      patchedChunks = true;

      THREE.ShaderChunk.points_vert = THREE.ShaderChunk.points_vert.replace(
        "#include <clipping_planes_pars_vertex>",
        "#include <clipping_planes_pars_vertex>\n#include <skinning_pars_vertex>"
      );
      THREE.ShaderChunk.points_vert = THREE.ShaderChunk.points_vert.replace(
        "#include <morphtarget_vertex>",
        "#include <skinbase_vertex>\n#include <morphtarget_vertex>\n#include <skinning_vertex>"
      );

      // Update PointsMaterial
      THREE.ShaderLib.points.vertexShader = THREE.ShaderChunk.points_vert;

      THREE.ShaderChunk.skinning_pars_vertex = /* glsl */ `
        #ifdef USE_SKINNING

          uniform mat4 bindMatrix;
          uniform mat4 bindMatrixInverse;

          uniform highp sampler2D boneTexture;
          uniform int boneTextureSize;

          mat4 getBoneMatrix( const in float i ) {

          #ifdef USE_INSTANCING
              
              int j = 4 * int(i);
              vec4 v1 = texelFetch(boneTexture, ivec2( j, gl_InstanceID ), 0);
              vec4 v2 = texelFetch(boneTexture, ivec2( j + 1, gl_InstanceID ), 0);
              vec4 v3 = texelFetch(boneTexture, ivec2( j + 2, gl_InstanceID ), 0);
              vec4 v4 = texelFetch(boneTexture, ivec2( j + 3, gl_InstanceID ), 0);
              
          #else

            float j = i * 4.0;
            float x = mod( j, float( boneTextureSize ) );
            float y = floor( j / float( boneTextureSize ) );

            float dx = 1.0 / float( boneTextureSize );
            float dy = 1.0 / float( boneTextureSize );

            y = dy * ( y + 0.5 );

            vec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );
            vec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );
            vec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );
            vec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );

          #endif

            mat4 bone = mat4( v1, v2, v3, v4 );

            return bone;

          }

        #endif
      `;
    }
  }

  copy(source: any) {
    super.copy(source);

    if (source.isInstancedMesh) {
      this.instanceMatrix.copy(source.instanceMatrix);

      if (source.instanceColor !== null)
        this.instanceColor = source.instanceColor.clone();

      this.count = source.count;
    }

    return this;
  }

  getColorAt(index: number, color: THREE.Color) {
    if (this.instanceColor === null) {
      return;
    }

    color.fromArray(this.instanceColor.array, index * 3);
  }

  getMatrixAt(index: number, matrix: THREE.Matrix4) {
    matrix.fromArray(this.instanceMatrix.array, index * 16);
  }

  raycast(raycaster: THREE.Raycaster, intersects: THREE.Intersection[]) {
    const matrixWorld = this.matrixWorld;
    const raycastTimes = this.count;

    if (this._mesh === null) {
      this._mesh = new THREE.SkinnedMesh(this.geometry, this.material);
      this._mesh.copy(this);
    }

    const _mesh = this._mesh;

    if (_mesh.material === undefined) return;

    for (let instanceId = 0; instanceId < raycastTimes; instanceId++) {
      // calculate the world matrix for each instance

      this.getMatrixAt(instanceId, _instanceLocalMatrix);

      _instanceWorldMatrix.multiplyMatrices(matrixWorld, _instanceLocalMatrix);

      // the mesh represents this single instance

      _mesh.matrixWorld = _instanceWorldMatrix;

      _mesh.raycast(raycaster, _instanceIntersects);

      // process the result of raycast

      for (let i = 0, l = _instanceIntersects.length; i < l; i++) {
        const intersect = _instanceIntersects[i];
        intersect.instanceId = instanceId;
        intersect.object = this;
        intersects.push(intersect);
      }

      _instanceIntersects.length = 0;
    }
  }

  setColorAt(index: number, color: THREE.Color) {
    if (this.instanceColor === null) {
      this.instanceColor = new THREE.InstancedBufferAttribute(
        new Float32Array(this.instanceMatrix.count * 3),
        3
      );
    }

    color.toArray(this.instanceColor.array, index * 3);
  }

  setMatrixAt(index: number, matrix: THREE.Matrix4) {
    matrix.toArray(this.instanceMatrix.array, index * 16);
  }

  setBonesAt(index: number, skeleton: THREE.Skeleton) {
    skeleton = skeleton || this.skeleton;

    const size = skeleton.bones.length * 16;

    if (this.instanceBones === null) {
      this.instanceBones = new Float32Array(size * this.count);
    }

    // @ts-ignore
    skeleton.update(this.instanceBones, index);
  }

  updateMorphTargets() {}

  dispose() {
    this.dispatchEvent({ type: "removed" });
  }
}
