import {money,num,rateMoney} from './logic';
import {formulaOverview} from './overview';

const ml=value=>`${new Intl.NumberFormat('en-PH',{maximumFractionDigits:2}).format(num(value))} ML`;

// A plain, step-by-step view of how the selling price is built up, with a shortcut to each place that changes a number.
export default function CostingSummary({calc,form,onGo}){
  const o=formulaOverview(form,calc);
  const other=num(calc.laborCost)+num(calc.overheadCost)+num(calc.additionalCost);
  const count=calc.rows.length;
  const steps=[
    {n:1,title:'Raw materials',value:money(calc.ingredientCost),note:`${count} ${count===1?'ingredient':'ingredients'} at the prices in your Raw Material Library`,tab:'content',action:'Review'},
    {n:2,title:'Labor, overhead and other costs',value:money(other),note:'Everything else it costs to make this batch',tab:'content',action:'Edit'},
    {n:3,title:'Cost of the perfume',value:money(calc.baseCost),note:`Step 1 + step 2 for the whole ${ml(calc.volume)} batch · ${rateMoney(calc.costPerMl)} per ML`,total:true},
    o.hasBottle
      ?{n:4,title:'Bottle and packaging',value:money(calc.packagingCost),note:`${calc.bottles} bottles of ${ml(calc.bottleSize)} · ${money(calc.packagingPerBottle)} bottle and packaging each`,tab:'bottling',action:'Edit'}
      :{n:4,title:'Bottle and packaging',value:'Not set',note:'Choose the bottle size you will sell to continue',tab:'bottling',action:'Set up',todo:true},
    {n:5,title:'Cost of production',value:o.hasBottle?money(o.costOfProduction):'—',note:'Perfume cost + bottle and packaging for the whole batch',total:true},
    {n:6,title:'Cost per finished bottle',value:o.hasBottle?money(o.costPerBottle):'—',note:'What one complete, ready-to-sell bottle costs you',total:true},
    o.hasBottle
      ?{n:7,title:`Suggested ${o.tierName.toLowerCase()} price`,value:money(o.suggestedPrice),note:`Profit per bottle: ${money(o.profitPerBottle)}`,tab:'pricing',action:'Set price',final:true}
      :{n:7,title:'Suggested selling price',value:'—',note:'Appears once a bottle size is chosen',final:true}
  ];
  return <section className="card costing-summary" aria-label="How your price is worked out">
    <div className="card-head"><div><p className="eyebrow">HOW IT ADDS UP</p><h2>Costing summary</h2></div><span className="muted">{form.name}</span></div>
    <p className="costing-summary-intro">Costing adds up everything it takes to make one finished bottle, then suggests a selling price. Work through the numbered steps below.</p>
    <ol className="costing-steps">{steps.map(step=><li key={step.n} className={`${step.total?'total':''} ${step.final?'final':''} ${step.todo?'todo':''}`}>
      <span className="costing-step-number">{step.n}</span>
      <div className="costing-step-copy"><strong>{step.title}</strong><small>{step.note}</small></div>
      <div className="costing-step-value"><strong>{step.value}</strong>{step.tab&&<button type="button" className="btn secondary" onClick={()=>onGo(step.tab)}>{step.action}</button>}</div>
    </li>)}</ol>
  </section>;
}
