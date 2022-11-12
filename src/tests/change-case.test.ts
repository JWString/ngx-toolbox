import { camelCase } from 'change-case';
import { Cases, applyCasing } from '../test-index';

describe('change-case', () => {
    it('correctly changes case', () => {

        let toChange = {
            PascalCased: 'value',
            Items: [
                {
                    PascalCased1: 'value',
                    PascalCased2: 'value'
                },
                {
                    PascalCased3: 'value',
                    PascalCased4: 'value'
                }
            ]
        };

        let toCompare = {
            pascalCased: 'value',
            items: [
                {
                    pascalCased1: 'value',
                    pascalCased2: 'value'
                },
                {
                    pascalCased3: 'value',
                    pascalCased4: 'value'
                }
            ]
        };

        let result = applyCasing(toChange, Cases.camelCase);

        expect(result).toEqual(toCompare);

        let str = 'abc';
        let num = 123;
        let fn = () => { };
        let udf = undefined;
        let n = null;

        expect(applyCasing(str, camelCase)).toBe(str);
        expect(applyCasing(num, camelCase)).toBe(num);
        expect(applyCasing(fn, camelCase)).toBe(fn);
        expect(applyCasing(udf, camelCase)).toBe(udf);
        expect(applyCasing(n, camelCase)).toBe(n);

    });
});