import {
  camelCase,
  capitalCase,
  constantCase,
  dotCase,
  headerCase,
  noCase,
  paramCase,
  pascalCase,
  pathCase,
  sentenceCase,
  snakeCase
} from 'change-case';

import { isArray, isComplex } from "./types";

export const Cases = {
  camelCase,
  capitalCase,
  constantCase,
  dotCase,
  headerCase,
  noCase,
  paramCase,
  pascalCase,
  pathCase,
  sentenceCase,
  snakeCase
};

export type Casing = (input: string) => string;

export function applyCasing(obj: any, toCase: Casing): any {
  if (isArray(obj)) {
    return obj.map(elem => applyCasing(elem, toCase));
  } else if (isComplex(obj)) {
    return Object.fromEntries(
      Object.entries(obj)
        .map(([k, p]: [string, any]) => [toCase(k), applyCasing(p, toCase)])
    );
  } else {
    return obj;
  }
}