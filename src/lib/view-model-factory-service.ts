import { Injectable, Injector, ProviderToken } from '@angular/core';
import { BaseViewModel, Constructable, DependencyArray, ViewModelFactory } from './view-model';

@Injectable({ providedIn: 'root' })
export class ViewModelFactoryService {

  private _factory: ViewModelFactory;

  constructor(injector: Injector) {
    let resolve = (dependencies: ProviderToken<any>[]): any[] => {
      return dependencies.map(t => injector.get(t));
    };
    this._factory = new ViewModelFactory(resolve);
  }

  public constructWithModel<TModel>(model: TModel) {
    return this._factory.constructWithModel(model);
  }

  public constructVMTypeWithModel<TViewModel extends BaseViewModel<TViewModel, TModel>, TModel>(
    type: Constructable<TViewModel>,
    model: TModel,
    dependencies?: DependencyArray
  ) {
    return this._factory.constructVMTypeWithModel(type, model, dependencies);
  }
}