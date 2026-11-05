import {describe,it,expect} from 'vitest';
import {batchWastage,completeBatchInventory,inventoryShortages,materialUsage} from './production';

const calculation={rows:[{materialId:'oil',name:'Oil',unit:'mL',ml:20,grams:19},{materialId:'powder',name:'Powder',unit:'g',ml:5,grams:6}]};
describe('production inventory',()=>{
 it('uses each material purchase unit',()=>expect(materialUsage(calculation).map(x=>x.quantity)).toEqual([20,6]));
 it('detects insufficient stock',()=>expect(inventoryShortages([{id:'oil',stockQuantity:10},{id:'powder',stockQuantity:8}],calculation)).toMatchObject([{materialId:'oil',shortage:10}]));
 it('deducts inventory once',()=>{const ingredients=[{id:'oil',stockQuantity:30},{id:'powder',stockQuantity:10}],batch={calculation};const deducted=completeBatchInventory(ingredients,batch);expect(deducted.map(x=>x.stockQuantity)).toEqual([10,4]);expect(completeBatchInventory(deducted,{...batch,inventoryDeducted:true})).toEqual(deducted)});
 it('calculates production wastage',()=>expect(batchWastage({expectedYield:500,actualYield:480})).toBe(20));
});

import {addDays,batchTimeline,localDate} from './production';
describe('batch timeline',()=>{
 const batch={date:'2026-11-05',macerationStart:'2026-11-05',macerationDate:'2026-11-19',maturationDate:'2026-12-05'};
 it('adds days',()=>{expect(addDays('2026-11-05',30)).toBe('2026-12-05');expect(localDate(new Date(2026,0,3))).toBe('2026-01-03')});
 it('macerating then maturing then ready',()=>{
  const a=batchTimeline(batch,'2026-11-10');expect(a.phase).toBe('Macerating');expect(a.maceration.daysLeft).toBe(9);
  const b=batchTimeline(batch,'2026-11-25');expect(b.phase).toBe('Maturing');expect(b.maceration.state).toBe('done');expect(b.maturation.daysLeft).toBe(10);
  const c=batchTimeline(batch,'2026-12-05');expect(c.phase).toBe('Ready for packaging');expect(c.ready).toBe(true);
 });
 it('asks for dates when none are set',()=>{expect(batchTimeline({date:'2026-11-05'},'2026-11-06').phase).toBe('Set dates')});
});
