import * as THREE_FOR_TYPES from "three";

// This version of three.js fixes the Object3D.matrixWorldAutoUpdate issue
// https://github.com/DolphinIQ/three.js/tree/remove-force-flag
import * as THREE_JS from "./threejs/three.module.js";
export const THREE = THREE_JS as unknown as typeof THREE_FOR_TYPES;
