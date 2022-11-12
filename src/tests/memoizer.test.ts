import { Memoizer } from '../test-index';

describe('memoizer', () => {
    it('correctly memoizes', () => {

        let runCount = 0;

        let fn = function(n1: number, n2: number, n3: number) {
            runCount++;
            return n1 * 100 + n2 * 10 + n3;
        };

        let params = [
            [0,0,0],
            [0,0,1],
            [0,1,0],
            [0,1,1],
            [1,0,0],
            [1,0,1],
            [1,1,0],
            [1,1,1]
        ];

        let toCompare = [0, 1, 10, 11, 100, 101, 110, 111];

        let m = Memoizer.construct(fn);

        let results: number[] = [];


        for (let i = 0; i < 100; i++) {
            for (let j = 0; j < 8; j++) {                
                results.push(m(...params[j]));
            }
        }

        for (let i = 0; i < 100; i++) {
            for (let j = 0; j < 8; j++) {
                let index = (8 * i) + j;
                expect(results[index]).toEqual(toCompare[j]);
            }
        }

        expect(runCount).toEqual(8);

    });
});