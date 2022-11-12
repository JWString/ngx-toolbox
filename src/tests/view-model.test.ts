import { accessible, BaseViewModel, ViewModelFactory } from '../test-index';

class TestVM extends BaseViewModel<TestVM, any> {
    
    public constructor() {
        super();
    }

    @accessible
    public get isVM() {
        return true;
    }

    public getModel(): any {
        return this.model;
    }

    public getItemCount(): number {
        return this.model.items.length;
    }
}

describe('view-model', () => {

    it('constructs', () => {
        let factory = new ViewModelFactory(() => []);

        let model = {
            title: 'parent',
            items: [
                {
                    title: 'child1'
                },
                {
                    title: 'child2'
                }
            ]
        };

        let vm = factory.constructVMTypeWithModel(TestVM, model);
        
        expect(vm.isVM).toEqual(true);
        expect(vm.getModel()).toBe(model);

        for (let i = 0; i < vm.asModel.items.length; i++) {
            expect(vm.asModel.items[i].title).toEqual(model.items[i].title);
        }
    });

    it('manages data', () => {
        let factory = new ViewModelFactory(() => []);

        let model = {
            title: 'parent',
            items: [
                {
                    title: 'child1'
                },
                {
                    title: 'child2'
                }
            ]
        };

        let vm = factory.constructVMTypeWithModel(TestVM, model);

        vm.asModel.items[0].title = 'modified';

        expect(vm.getModel().items[0].title).toEqual(model.items[0].title);
        expect(vm.getModel().items[0]).toBe(model.items[0]);
    });

    it('correctly syncs', () => {
        let factory = new ViewModelFactory(() => []);

        let model = {
            title: 'parent',
            items: [
                {
                    title: 'child1'
                },
                {
                    title: 'child2'
                }
            ]
        };

        let vm = factory.constructWithModel(model);

        let model2 = {
            title: 'version 2',
            items: [
                {
                    title: 'version 2 child1'
                },
                {
                    title: 'version 2 child2'
                }
            ]
        };

        vm.syncModel(model2);

        let clone = vm.cloneModel();

        expect(clone).toEqual(model2);

        let model3 = {
            value: 'something completely different'
        };

        vm.syncModel(model3 as any);

        clone = vm.cloneModel();

        expect(clone).toEqual(model3);
    });

    it('writes correctly', () => {

        let factory = new ViewModelFactory(() => []);
        let vm = factory.constructWithModel({});

        let changeCount = 0;

        let sub = vm.changes$.subscribe(() => {
            changeCount++;
        });

        vm.asModel.title = 'constructed';
        vm.asModel.items = [];
        vm.asModel.items.push('1');
        vm.asModel.items.push(2);
        vm.asModel.items.push({ item: 3 });

        sub.unsubscribe();

        let result = vm.cloneModel();
        let compare = {
            title: 'constructed',
            items: [
                '1',
                2,
                { item: 3 }
            ]
        };

        expect(changeCount).toEqual(5);
        expect(result).toEqual(compare);
    });

    it('throws on cycle', () => {

        let model1 = {
            model2: undefined
        };

        model1.model2 = {
            model1
        } as any;

        let factory = new ViewModelFactory(() => []);
        let caught = false;

        try {
            factory.constructWithModel(model1);
        } catch {
            caught = true;
        }

        expect(caught).toEqual(true);

    });
});