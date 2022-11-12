import { clone } from '../test-index';

describe('clone', () => {
    it('correctly clones', () => {
        
        let toClone = {
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

        let toCompare = {
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

        let result = clone(toClone);

        expect(result).toEqual(toCompare);
    });
});