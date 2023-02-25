import { Observable, Subject } from 'rxjs';
import { Complex, isComplex, isFunction } from './types';
import { clone} from './clone';

//TYPES

type OnConfigureCallback = () => void;
type OnChangesCallback = (target: any, key: string, operation: 'delete' | 'set', value?: any) => void;
type ResolveCallback = (dependencies: any[]) => any[];
type ConfigureableViewModel<TSpecialization, TModel> = {
  _configured: boolean,
  _model: TModel | undefined,
  _proxy: ViewModel<TSpecialization, TModel> | undefined,
  _changes$: Subject<boolean> | undefined,
  beforeConfigure: OnConfigureCallback | undefined,
  afterConfigure: OnConfigureCallback | undefined,
  beforeChanges: OnChangesCallback | undefined,
  afterChanges: OnChangesCallback | undefined
};
export type ViewModel<TViewModel, TModel> = TViewModel & TModel;
export type DependencyArray = any[];
export type Constructable<T> = { new(...deps: DependencyArray): T };

//FUNCTIONS

function proxifyModel(
  model: Complex,
  onChanges: () => void,
  beforeChanges: OnChangesCallback,
  afterChanges: OnChangesCallback
): Complex {
  let innerHandler = new InnerProxyHandler(model, onChanges, beforeChanges, afterChanges);
  return new Proxy<Complex>(model, innerHandler);
}

function bindViewModel<
  TViewModel,
  TModel
>(
  model: TModel,
  vm: TViewModel,
  onChanges: () => void,
  beforeChanges: OnChangesCallback,
  afterChanges: OnChangesCallback
): ViewModel<TViewModel, TModel> {
  let innerProxy = proxifyModel(model as Complex, onChanges, beforeChanges, afterChanges);
  let outerHandler = new OuterProxyHandler<TViewModel, TModel>(vm);
  let outerProxy = new Proxy<TModel & object>(innerProxy as TModel & object, outerHandler);
  return outerProxy as unknown as ViewModel<TViewModel, TModel>;
}

//DECORATORS

export function accessible(target: any, propertyKey: string) {
  if (target.accessibleFields as Map<string, boolean>) {
    target.accessibleFields = new Map<string, boolean>(target.accessibleFields.entries());
  } else {
    target.accessibleFields = new Map<string, boolean>();
  }
  target.accessibleFields.set(propertyKey, true);
}

//PROXY HANDLERS

class BaseProxyHandler implements ProxyHandler<any> {    
  private throwOnInvocation(): any {
    throw 'Method not allowed.';
  }
  construct = this.throwOnInvocation;
  defineProperty = this.throwOnInvocation;
  getPrototypeOf = this.throwOnInvocation;
  setPrototypeOf = this.throwOnInvocation;
}

class InnerProxyHandler extends BaseProxyHandler implements ProxyHandler<Complex> {
   
  private readonly _proxyStore: Map<string, Complex>;
  private readonly onChanges: () => void;
  private readonly beforeChanges: OnChangesCallback;
  private readonly afterChanges: OnChangesCallback;

  constructor(
    model: Complex,
    onChanges: () => void,
    beforeChanges: OnChangesCallback,
    afterChanges: OnChangesCallback
  ) {
    super();
    this._proxyStore = new Map<string, Complex>();
    this.onChanges = onChanges;
    this.beforeChanges = beforeChanges;
    this.afterChanges = afterChanges;
    for (let entry of Object.entries(model)) {
      let [k, p] = entry;
      if (isComplex(p)) {
        this._proxyStore.set(k, proxifyModel(p, onChanges, beforeChanges, afterChanges));
      }
    }
  }

  public get(target: Complex, key: string): any {
    if (this._proxyStore.has(key)) {
      return this._proxyStore.get(key);
    } else {
      return target[key];
    }
  }

  public set(target: Complex, key: string, value: any): boolean {
    if (!Object.is(target[key], value)) {
      this.beforeChanges(target, key, 'set', value);
      if (isComplex(value)) {
        let proxy = proxifyModel(value, this.onChanges, this.beforeChanges, this.afterChanges);
        this._proxyStore.set(key, proxy);
      } else if (this._proxyStore.has(key)) {
        this._proxyStore.delete(key);
      }
      target[key] = value;
      this.afterChanges(target, key, 'set', value);
      this.onChanges();
    }
    return true;
  }

  public deleteProperty(target: Complex, key: string): boolean {
    if (target[key] !== undefined) {
      this.beforeChanges(target, key, 'delete');
      if (this._proxyStore.has(key)) {
        this._proxyStore.delete(key);
      }
      delete target[key];
      this.afterChanges(target, key, 'delete');
      this.onChanges();
    }
    return true;
  }
}

class OuterProxyHandler<TViewModel, TModel> extends BaseProxyHandler implements ProxyHandler<TModel & object> {

  private _vm: TViewModel;

  constructor(vm: TViewModel) {
    super();
    this._vm = vm;
  }

  private vmExposesKey(key: string) {
    let proto = Object.getPrototypeOf(this._vm);
    return proto.accessibleFields?.get(key) || false;
  }

  public get(target: Complex, key: string): any {        
    if (this.vmExposesKey(key)) {
      let p = (this._vm as Record<string, any>)[key];
      if (isFunction(p)) {
        return (...args: any[]) => p.apply(this._vm, args);
      } else {
        return p;
      }
    } else {
      return target[key];
    }
  }

  public set(target: Complex, key: string, value: any): boolean {
    if (this.vmExposesKey(key)) {
      (this._vm as Record<string, any>)[key] = value;
    } else {
      target[key] = value;
    }
    return true;
  }

  public deleteProperty(target: Complex, key: string): boolean {
    if (this.vmExposesKey(key)) {
      return true;
    }
    delete target[key];
    return true;
  }

  public ownKeys(target: TModel & object): ArrayLike<string | symbol> {
    return Reflect.ownKeys(target).concat([...Object.getPrototypeOf(this._vm).accessibleFields.keys()]);
  }

  public getOwnPropertyDescriptor(target: TModel & object, key: string): PropertyDescriptor | undefined {
    return this.vmExposesKey(key)
      ? Object.getOwnPropertyDescriptor(this._vm, key)
      : Object.getOwnPropertyDescriptor(target, key);
  }
}

//VIEW MODELS

export class BaseViewModel<TSpecialization, TModel> {
    
  [key: string]: any;
  private _configured: boolean;
  private _model?: TModel;
  private _proxy?: ViewModel<TSpecialization, TModel>;
  private _changes$?: Subject<boolean>;

  protected constructor();
  protected constructor(model: TModel);
  protected constructor(changes$: Subject<boolean>);
  protected constructor(model: TModel, changes$: Subject<boolean>);
  protected constructor(model?: TModel, changes$?: Subject<boolean>) {
    this._configured = false;
    this._model = model;
    this._changes$ = changes$;
  }

  protected get model(): TModel {
    return this._model!;
  }

  protected syncModel(model: TModel) {
    if (!this._configured) {
      throw 'Method not available: override ViewModel.afterConfigure if you need to use syncModel on ViewModel initialization.';
    }
    (this._model as unknown as TModel) = model;
    let onChanges = () => this._changes$?.next(true);
    let beforeChanges = this.beforeChanges ?? (() => {});
    let afterChanges = this.afterChanges ?? (() => {});
    let vm = this as unknown as TSpecialization;
    this._proxy = bindViewModel<TSpecialization, TModel>(model, vm, onChanges, beforeChanges, afterChanges);
  }

  protected beforeConfigure: OnConfigureCallback | undefined;

  protected afterConfigure: OnConfigureCallback | undefined;

  protected beforeChanges: OnChangesCallback | undefined;

  protected afterChanges: OnChangesCallback | undefined;

  protected emitChanges() {
    this._changes$?.next(true);
  }

  @accessible
  public get changes$(): Observable<boolean> {
    return this._changes$!.asObservable();
  }

  public get asModel(): ViewModel<TSpecialization, TModel> {
    return this._proxy!;
  }
}

export class GenericViewModel<TModel> extends BaseViewModel<GenericViewModel<TModel>, TModel> {

  public constructor() {
    super();
  }

  @accessible
  public cloneModel() {
    return clone(this.model);
  }

  @accessible
  public override syncModel(model: TModel) {
    return super.syncModel(model);
  }
}

//FACTORY

export class ViewModelFactory {

  constructor(resolve: ResolveCallback) {
    this.resolve = resolve;
  }

  private readonly resolve: ResolveCallback;

  private construct<TViewModel extends BaseViewModel<TViewModel, TModel>, TModel>(
    type: Constructable<TViewModel>,
    model?: TModel,
    dependencies?: DependencyArray
  ): TViewModel {
    let vm = (
      dependencies
        ? new type(...this.resolve(dependencies))
        : new type()
    ) as unknown as ConfigureableViewModel<TViewModel, TModel>;
    if (vm.beforeConfigure) {
      vm.beforeConfigure();
    };
    let m = model ?? vm._model;
    if (!m) {
      throw 'A model is required to construct a ViewModel.';
    }
    let c = vm._changes$ ?? new Subject<boolean>();
    let onChanges = () => c.next(true);
    let beforeChanges: OnChangesCallback = vm.beforeChanges ?? (() => {});
    let afterChanges: OnChangesCallback = vm.afterChanges ?? (() => {});
    let proxy: ViewModel<TViewModel, TModel>;
    try {
      proxy = bindViewModel<TViewModel, TModel>(m, vm as unknown as TViewModel, onChanges, beforeChanges, afterChanges);
    } catch {
      throw 'Failed to generate a proxy for the model.  This can happen with complex objects containing cycles.  Try to move complex members to a ViewModel specialization.';
    }
    vm._model = m;
    vm._changes$ = c;
    vm._proxy = proxy;
    vm._configured = true;
    if(vm.afterConfigure) {
      vm.afterConfigure();
    }
    return vm as unknown as TViewModel;
  }

  public constructWithModel<TModel>(
    model: TModel
  ): GenericViewModel<TModel> {
    return this.construct(GenericViewModel<TModel>, model);
  }

  public constructVMTypeWithModel<
    TViewModel extends BaseViewModel<TViewModel, TModel>,
    TModel
  >(
    type: Constructable<TViewModel>,
    model: TModel,
    dependencies?: DependencyArray
  ): TViewModel {
    return this.construct<TViewModel, TModel>(type, model, dependencies);
  }

}