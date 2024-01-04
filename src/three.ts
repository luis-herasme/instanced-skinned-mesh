import type * as THREE_TYPES from "three";
export let THREE = undefined as unknown as typeof THREE_TYPES;

export function install(three: typeof THREE) {
  THREE = three;
}
