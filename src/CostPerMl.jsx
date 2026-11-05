import {Plus,Trash2} from 'lucide-react';
import {money,rateMoney,uid,num} from './logic';

const quantity=value=>new Intl.NumberFormat('en-PH',{maximumFractionDigits:2}).format(value);
const contentRate=value=>new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP',minimumFractionDigits:2,maximumFractionDigits:4}).format(value);

export default function CostPerMl({calc,form,onUpdate,onEdit}){
 const expenses=[['Labor','costingLabor',calc.laborCost],['Overhead','costingOverhead',calc.overheadCost]];
 const custom=form.operatingExpenses??(calc.additionalCost>0?[{id:'additional',name:'Additional expense',amount:form.costingAdditional??calc.additionalCost}]:[]);
 const updateCustom=items=>onUpdate({operatingExpenses:items,costingAdditional:items.reduce((sum,item)=>sum+num(item.amount),0)});
 return <section className="card cost-sheet" aria-label="Cost per milliliter breakdown">
  <header className="cost-sheet-header"><div><p className="eyebrow">FORMULA COSTING</p><h2>Content cost breakdown</h2><p>Costs for the full formulated output</p></div><button className="btn" onClick={onEdit}>Open formulation</button></header>
  <div className="cost-sheet-section-title"><h3>Raw materials</h3><span>{calc.rows.length} {calc.rows.length===1?'ingredient':'ingredients'}</span></div>
  <div className="cost-sheet-materials">{calc.rows.map((row,index)=><div className="cost-sheet-material" key={row.id}><span className="cost-sheet-number">{index+1}</span><div className="cost-sheet-material-main"><strong>{row.name}</strong><small>{quantity(row.ml)} mL · {quantity(row.grams)} g</small></div><div className="cost-sheet-material-price"><strong>{money(row.cost)}</strong><small>{rateMoney(row.unitCost)} / {row.unit}</small></div></div>)}</div>
  <div className="cost-sheet-subtotal"><span>Raw materials subtotal</span><strong>{money(calc.ingredientCost)}</strong></div>
  <div className="cost-sheet-section-title"><h3>Operating costs</h3><span>For this output</span></div>
  <div className="cost-sheet-expenses">{expenses.map(([label,key,value])=><label key={key} className="cost-sheet-expense"><span>{label}</span><span className="cost-sheet-expense-input"><span>₱</span><input type="number" inputMode="decimal" min="0" step="any" aria-label={`${label} cost`} value={form[key]??value} onChange={event=>onUpdate({[key]:event.target.value})}/></span></label>)}{custom.map(item=><div className="extra-cost-row" key={item.id}><input className="extra-cost-name" aria-label="Expense name" placeholder="Expense name" value={item.name} onChange={event=>updateCustom(custom.map(row=>row.id===item.id?{...row,name:event.target.value}:row))}/><span className="cost-sheet-expense-input"><span>₱</span><input type="number" inputMode="decimal" min="0" step="any" aria-label={`${item.name||'Additional expense'} cost`} value={item.amount} onChange={event=>updateCustom(custom.map(row=>row.id===item.id?{...row,amount:event.target.value}:row))}/></span><button className="remove-cost-row" aria-label={`Remove ${item.name||'expense'}`} onClick={()=>updateCustom(custom.filter(row=>row.id!==item.id))}><Trash2 size={16}/></button></div>)}<button className="btn add-cost-row" onClick={()=>updateCustom([...custom,{id:uid(),name:'',amount:0}])}><Plus size={16}/> Add operating expense</button></div>
  <div className="content-cost-summary"><div className="content-cost-result"><span>Cost per mL</span><strong>{contentRate(calc.costPerMl)}</strong></div><div className="content-cost-facts"><div><span>Total cost</span><strong>{money(calc.baseCost)}</strong></div><div><span>Output</span><strong>{quantity(calc.volume)} mL</strong></div></div></div>
 </section>;
}
