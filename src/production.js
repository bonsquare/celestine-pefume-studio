import {num} from './logic';

export const batchStatuses=['Planned','Mixing','Maturing','Bottling','Completed','Cancelled'];
export const materialUsage=calculation=>(calculation?.rows||[]).map(row=>({materialId:row.materialId,name:row.name,unit:row.unit,quantity:row.unit==='g'?num(row.grams):num(row.ml)}));
export function inventoryShortages(ingredients,calculation){return materialUsage(calculation).map(usage=>{const material=ingredients.find(item=>item.id===usage.materialId),available=num(material?.stockQuantity);return {...usage,available,shortage:Math.max(0,usage.quantity-available)}}).filter(item=>item.shortage>1e-9)}
export function completeBatchInventory(ingredients,batch){if(batch.inventoryDeducted)return ingredients;const usage=materialUsage(batch.calculation);return ingredients.map(material=>{const consumed=usage.filter(item=>item.materialId===material.id).reduce((sum,item)=>sum+item.quantity,0);return consumed?{...material,stockQuantity:Math.max(0,num(material.stockQuantity)-consumed)}:material})}
export const batchWastage=batch=>Math.max(0,num(batch.expectedYield)-num(batch.actualYield));
