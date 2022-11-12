import { isEquivalent } from '../test-index';

describe('equivalent', () => {
    it('detects equivalence', () => {

        let value1 = {
            value1: 'value',
            value2: 123,
            items: [
                {
                    value1: 'value',
                    value2: 123,
                },
                456,
                'value'
            ]
        };

        let value2 = {
            value1: 'value',
            value2: 123,
            items: [
                {
                    value1: 'value',
                    value2: 123,
                },
                456,
                'value'
            ]
        };

        let result = isEquivalent(value1, value2);
        
        expect(result).toEqual(true);
    });

    it('detects non-equivalence', () => {

        let obj1 = {
            value1: 'value',
            value2: 123,
            items: [
                {
                    value1: 'value',
                    value2: 123,
                },
                456,
                'value'
            ]
        };

        let obj2 = {
            value1: 'value',
            value2: 123,
            items: [
                {
                    value1: 'value',
                    value2: 456,
                },
                456,
                'value'
            ]
        };

        let obj3 = {
            value1: 'value',
            value2: 123,
            items: [
                {
                    value1: 'value',
                    value2: 456,
                },
                '456',
                'value'
            ]
        };

        let isEquiv1 = isEquivalent(obj1, obj2);
        let isEquiv2 = isEquivalent(obj2, obj3)

        expect(isEquiv1).toEqual(false);
        expect(isEquiv2).toEqual(false);

    });
})