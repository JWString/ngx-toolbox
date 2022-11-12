import { Complex, isArray, isComplex } from "./types";

export function clone<T>(item: T): T | undefined {
  if (item !== null && item !== undefined) {
    if (isArray(item)) {
      return [ ...(item as any[]).map(elem => clone(elem)) ] as unknown as T;
    } else if (isComplex(item)) {
      return Object
        .entries(item)
        .map(kvp => [kvp[0], clone(kvp[1])])
        .reduce((r, kvp) => (r[kvp[0]] = kvp[1], r), {} as Complex) as unknown as T;
    }
  }
  return item;
}