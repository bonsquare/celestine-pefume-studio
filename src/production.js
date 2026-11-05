import {num} from './logic';

export const batchStatuses=['Planned','Mixing','Maturing','Bottling','Completed','Cancelled'];
export const materialUsage=calculation=>(calculation?.rows||[]).map(row=>({materialId:row.materialId,name:row.name,unit:row.unit,quantity:row.unit==='g'?num(row.grams):num(row.ml)}));
export function inventoryShortages(ingredients,calculation){return materialUsage(calculation).map(usage=>{const material=ingredients.find(item=>item.id===usage.materialId),available=num(material?.stockQuantity);return {...usage,available,shortage:Math.max(0,usage.quantity-available)}}).filter(item=>item.shortage>1e-9)}
export function completeBatchInventory(ingredients,batch){if(batch.inventoryDeducted)return ingredients;const usage=materialUsage(batch.calculation);return ingredients.map(material=>{const consumed=usage.filter(item=>item.materialId===material.id).reduce((sum,item)=>sum+item.quantity,0);return consumed?{...material,stockQuantity:Math.max(0,num(material.stockQuantity)-consumed)}:material})}
const pad=value=>String(value).padStart(2,'0');
export const localDate=(date=new Date())=>`${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
export const addDays=(iso,days)=>{const date=new Date(`${iso}T00:00:00`);date.setDate(date.getDate()+num(days));return localDate(date)};
export const daysBetween=(from,to)=>Math.round((new Date(`${to}T00:00:00`)-new Date(`${from}T00:00:00`))/864e5);

// Maceration runs from its start date to its ready date; maturation continues from there to the date it is ready for packaging.
export function batchTimeline(batch,today=localDate()){
  const start=batch.macerationStart||batch.date||today,macEnd=batch.macerationDate||'',matEnd=batch.maturationDate||'';
  const stage=(key,label,from,to)=>{
    if(!to)return {key,label,from,to,state:'unset',daysLeft:null,percent:0};
    const total=Math.max(1,daysBetween(from,to)),elapsed=daysBetween(from,today),daysLeft=daysBetween(today,to);
    const state=daysLeft<=0?'done':elapsed>=0?'active':'upcoming';
    return {key,label,from,to,state,daysLeft:Math.max(0,daysLeft),total,percent:state==='done'?100:Math.min(100,Math.max(0,Math.round(elapsed/total*100)))};
  };
  const maceration=stage('maceration','Maceration',start,macEnd),maturation=stage('maturation','Maturation',macEnd||start,matEnd);
  let phase='Set dates',detail='';
  if(matEnd&&maturation.state==='done'){phase='Ready for packaging';detail=`since ${matEnd}`}
  else if(macEnd&&maceration.state!=='done'){phase=maceration.state==='upcoming'?'Maceration starts soon':'Macerating';detail=`${maceration.daysLeft} day${maceration.daysLeft===1?'':'s'} left`}
  else if(matEnd){phase='Maturing';detail=`${maturation.daysLeft} day${maturation.daysLeft===1?'':'s'} left`}
  return {maceration,maturation,phase,detail,ready:Boolean(matEnd)&&maturation.state==='done'};
}
// Raw material cost of one bottle: the materials in the formula only (no labor, overhead, or packaging).
export function rawMaterialPerBottle(batch){
  const calc=batch.calculation||{},volume=num(calc.volume),size=num(calc.bottleSize);
  if(volume>0&&size>0)return num(calc.ingredientCost)/volume*size;
  return num(calc.bottles)>0?num(calc.ingredientCost)/num(calc.bottles):0;
}
export const batchWastage=batch=>Math.max(0,num(batch.expectedYield)-num(batch.actualYield));
