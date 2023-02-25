export type Function = (...args: any[]) => any;
export type Array = any[];
export type Complex = { [K: string]: any };

export function isNull(value: any): value is null {
  return value === null;
}

export function isUndefined(value: any): value is undefined {
  return value === undefined;
}

export function isNumber(value: any): value is number {
  return typeof value === 'number';
}

export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

export function isArray(value: any): value is Array {
  return Array.isArray(value);
}

export function isComplex(value: any): value is Complex {
  if (value !== null) {
    switch (typeof value) {
      case 'undefined':
      case 'number':
      case 'string':
      case 'boolean':
      case 'function':
        return false;
      default:
        return true;
    }
  } else {
    return false;
  }
}