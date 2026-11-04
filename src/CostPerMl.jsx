import {money,rateMoney} from './logic';

const quantity=value=>new Intl.NumberFormat('en-PH',{maximumFractionDigits:2}).format(value);

export default function CostPerMl({calc,form,onUpdate,onEdit}){
 const expenses=[['Labor','costingLabor',calc.laborCost],['Overhead','costingOverhead',calc.overheadCost],['Additional expenses','costingAdditional',calc.additionalCost]];
 return <section className="card cost-sheet" aria-label="Cost per milliliter breakdown">
  <header className="cost-sheet-header"><div><p className="eyebrow">FORMULA COSTING</p><h2>Content cost breakdown</h2><p>Costs for the full formulated output</p></div><button className="btn" onClick={onEdit}>Open formulation</button></header>
  <div className="cost-sheet-section-title"><h3>Raw materials</h3><span>{calc.rows.length} {calc.rows.length===1?'ingredient':'ingredients'}</span></div>
  <div className="cost-sheet-materials">{calc.rows.map((row,index)=><div className="cost-sheet-material" key={row.id}><span className="cost-sheet-number">{index+1}</span><div className="cost-sheet-material-main"><strong>{row.name}</strong><small>{quantity(row.ml)} mL · {quantity(row.grams)} g</small></div><div className="cost-sheet-material-price"><strong>{money(row.cost)}</strong><small>{rateMoney(row.unitCost)} / {row.unit}</small></div></div>)}</div>
  <div className="cost-sheet-subtotal"><span>Raw materials subtotal</span><strong>{money(calc.ingredientCost)}</strong></div>
  <div className="cost-sheet-section-title"><h3>Operating costs</h3><span>For this output</span></div>
  <div className="cost-sheet-expenses">{expenses.map(([label,key,value])=><label key={key} className="cost-sheet-expense"><span>{label}</span><span className="cost-sheet-expense-input"><span>₱</span><input type="number" inputMode="decimal" min="0" step="any" aria-label={`${label} cost`} value={form[key]??value} onChange={event=>onUpdate({[key]:event.target.value})}/></span></label>)}</div>
  <div className="cost-sheet-total"><div><span>Content cost</span><strong>{money(calc.baseCost)}</strong></div><div><span>Overall content</span><strong>{quantity(calc.volume)} mL</strong></div></div>
  <div className="cost-sheet-result"><div><span>CONTENT COST PER mL</span><strong>{rateMoney(calc.costPerMl)}</strong></div><small>{money(calc.baseCost)} ÷ {quantity(calc.volume)} mL</small></div>
 </section>;
}
