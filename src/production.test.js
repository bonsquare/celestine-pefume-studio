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

describe('marking a stage done',()=>{
 it('overrides the dates and makes the batch ready',()=>{
  const b={date:'2026-11-05',macerationDate:'2026-11-19',maturationDate:'2026-12-05',macerationDoneOn:'2026-11-12'};
  const a=batchTimeline(b,'2026-11-13');expect(a.maceration.state).toBe('done');expect(a.phase).toBe('Maturing');
  const c=batchTimeline({...b,maturationDoneOn:'2026-11-20'},'2026-11-21');expect(c.ready).toBe(true);expect(c.detail).toBe('since 2026-11-20');
 });
});

import {autoProgressBatch,autoProgressBatches,markStageDone,nextBatchNumber,undoStage} from './production';
describe('auto progress and batch IDs',()=>{
 const base={status:'Planned',date:'2026-11-05',macerationDate:'2026-11-19',maturationDate:'2026-12-05'};
 it('marks maceration done and moves to Maturing when its date arrives',()=>{
  const a=autoProgressBatch(base,'2026-11-19');expect(a.macerationDoneOn).toBe('2026-11-19');expect(a.status).toBe('Maturing');expect(a.maturationDoneOn).toBeUndefined();
 });
 it('marks maturation done and moves to Bottling when ready',()=>{
  const a=autoProgressBatch(base,'2026-12-06');expect(a.maturationDoneOn).toBe('2026-12-05');expect(a.status).toBe('Bottling');
 });
 it('does nothing before the dates, for finished batches, or after Undo',()=>{
  expect(autoProgressBatch(base,'2026-11-10')).toBe(base);
  const done={...base,status:'Completed'};expect(autoProgressBatch(done,'2027-01-01')).toBe(done);
  const undone=undoStage(markStageDone(base,'maceration','2026-11-19'),'maceration');expect(autoProgressBatch(undone,'2026-11-25').macerationDoneOn).toBe('');
 });
 it('never moves a status backward and returns the same list when nothing changed',()=>{
  expect(autoProgressBatch({...base,status:'Bottling'},'2026-11-19').status).toBe('Bottling');
  const list=[base];expect(autoProgressBatches(list,'2026-11-10')).toBe(list);expect(autoProgressBatches(list,'2026-11-19')).not.toBe(list);
 });
 it('gives every batch a unique ID even after a delete',()=>{
  const list=[{batchNumber:'B-20261105-001'},{batchNumber:'B-20261105-003'}];
  expect(nextBatchNumber(list,'2026-11-05')).toBe('B-20261105-004');expect(nextBatchNumber(list,'2026-11-06')).toBe('B-20261106-001');
 });
});
