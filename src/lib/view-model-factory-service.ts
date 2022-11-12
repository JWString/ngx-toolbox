import { Injectable, Injector, ProviderToken } from '@angular/core';
import { BaseViewModel, Constructable, DependencyArray, GenericViewModel, ViewModelFactory } from './view-model';

@Injectable({ providedIn: 'root' })
export class ViewModelFactoryService {

    constructor(injector: Injector) {
        let resolve = (dependencies: ProviderToken<any>[]): any[] => {
            return dependencies.map(t => injector.get(t));
        };
        let factory = new ViewModelFactory(resolve);
        this.constructWithModel = factory.constructWithModel;
        this.constructVMTypeWithModel = factory.constructVMTypeWithModel;
    }

    public readonly constructWithModel:
        <TModel>
            (model: TModel) =>
                GenericViewModel<TModel>;

    public readonly constructVMTypeWithModel:
        <TViewModel extends BaseViewModel<TViewModel, TModel>, TModel>
            (type: Constructable<TViewModel>, model: TModel, dependencies?: DependencyArray) =>
                TViewModel;
}