import {
  Function,
  Complex,
  isNull,
  isUndefined,
  isNumber,
  isString,
  isFunction,
  isArray,
  isComplex,
  isBoolean
} from './types';

type NoParams = [undefined, undefined]
type NullParams = [null, null];
type NumberParams = [number, number];
type StringParams = [string, string];
type BooleanParams = [boolean, boolean];
type FunctionParams = [Function, Function];
type ArrayParams = [any[], any[]];
type ComplexParams = [Complex, Complex];
type EquivalenceParams = NoParams | NullParams | NumberParams | StringParams | BooleanParams | FunctionParams | ArrayParams | ComplexParams;

function isNoParams(params: EquivalenceParams): params is NoParams {
  return isUndefined(params[0]) && isUndefined(params[1]);
}

function isNullParams(params: EquivalenceParams): params is NullParams {
  return isNull(params[0]) && isNull(params[1]);
}

function isNumberParams(params: EquivalenceParams): params is NumberParams {
  return isNumber(params[0]) && isNumber(params[1]);
}

function isStringParams(params: EquivalenceParams): params is StringParams {
  return isString(params[0]) && isString(params[1]);
}

function isBooleanParams(params: EquivalenceParams): params is BooleanParams {
  return isBoolean(params[0]) && isBoolean(params[1]);
}

function isArrayParams(params: EquivalenceParams): params is ArrayParams {
  return isArray(params[0]) && isArray(params[1]);
}

function isComplexParams(params: EquivalenceParams): params is ComplexParams {
  return isComplex(params[0]) && isComplex(params[1]);
}

function isFunctionParams(params: EquivalenceParams): params is FunctionParams {
  return isFunction(params[0]) && isFunction(params[1]);
}

export function isEquivalent(...params: EquivalenceParams): boolean {
  if (isFunctionParams(params)) {
    let [value1, value2] = params;
    return value1.toString() === value2.toString();
  } else if (isArrayParams(params)) {
    let [value1, value2] = params;
    if (value1.length !== value2.length) {
      return false;
    } else {
      return value1.every((elem, i) => {
        return isEquivalent(elem, value2[i]);
      });
    }
  } else if (isComplexParams(params)) {
    let [value1, value2] = params;
    if (Object.keys(value1).length !== Object.keys(value2).length) {
      return false;
    } else {
      return Object.entries(value1).every(([k, p]) => {
        return isEquivalent(p, value2[k]);
      });
    }
  } else {
    if (isNumberParams(params) || isStringParams(params) || isBooleanParams(params)) {
      let [value1, value2] = params;
      return value1 === value2;
    } else if (isNoParams(params) || isNullParams(params)) {
      return true;
    } else {
      return false;
    }
  }
}