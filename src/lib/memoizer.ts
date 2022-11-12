type FuncToMemoize<T> = (...args:any[])=>T;
type MemoizedFunc<T> = (...args:any[])=>T

class KeyChain<T> {
  private _map: Map<any, KeyChain<T>> | undefined;
  stored: boolean = false;
  value: T | undefined;
  get(args: any[]): KeyChain<T> {
    if (args.length === 0) {
      return this;
    } else {
      if (!this._map) {
        this._map = new Map<any, KeyChain<T>>();
      }
      let nextkc = this._map.get(args[0]);
      if (!nextkc) {
        nextkc = new KeyChain<T>();
        this._map.set(args[0], nextkc);
      }
      return nextkc.get(args.slice(1));
    }
  }
}

export class Memoizer<T> {
  private readonly _kc: KeyChain<T>;
  private readonly _fn: FuncToMemoize<T>;
  constructor(fn: FuncToMemoize<T>) {
    this._kc = new KeyChain<T>();
    this._fn = fn;
  }
  fn(...args:any[]) {
    let kc = this._kc.get(args);
    if (!kc.stored) {
      kc.value = this._fn(...args);
      kc.stored = true;
    }
    return kc.value!;
  }
  static construct<T>(fn: FuncToMemoize<T>): MemoizedFunc<T> {
    let m = new Memoizer<T>(fn);
    return (...args: any[]) => m.fn(...args);
  }
}
