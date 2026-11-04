import {it,expect} from 'vitest';
import {normalizeData} from './storage';
import {calculate,newFormula,initial} from './logic';
it('preserves legacy per-mL costs when adding purchase fields',()=>{const legacy={...initial,ingredients:[{id:'i1',name:'Fragrance oil',unitCost:2.5,density:.95}],formulas:[{...newFormula(),ingredients:[{id:'r1',name:'Fragrance oil',percentage:100,density:.95,unitCost:2.5}]}]};const data=normalizeData(legacy);expect(data.ingredients[0]).toMatchObject({contentQuantity:1,contentUnit:'mL',purchasePrice:2.5,category:'Fragrance Oil',supplier:'',make:''});expect(data.formulas[0].ingredients[0].materialId).toBe('i1');expect(calculate(data.formulas[0],data).rows[0].cost).toBe(1250)});
