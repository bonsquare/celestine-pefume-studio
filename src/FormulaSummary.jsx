import {useRef} from 'react';
import {Printer} from 'lucide-react';
import {num,unitLabel} from './logic';

const display=value=>new Intl.NumberFormat('en-PH',{maximumFractionDigits:2}).format(num(value));

export default function FormulaSummary({calculation,name,scentName,inspiredBy,savedAt,live=false}){
  const root=useRef(null);
  // Don't repeat the scent name when it is the same as the formula name.
  const showScent=Boolean(scentName&&scentName.trim()&&scentName.trim().toLowerCase()!==String(name||'').trim().toLowerCase());
  // Mark only this summary as the print area, print, then unmark (CSS in style.css hides the rest of the page).
  const print=()=>{const node=root.current;if(!node)return;node.classList.add('print-area');const done=()=>{node.classList.remove('print-area');window.removeEventListener('afterprint',done)};window.addEventListener('afterprint',done);window.print()};
  const {unit,rowsDisplay,percentage,oilPercentage,totalDisplay,basis}=calculation;
  const outputMl=calculation.outputMl??calculation.result?.volume??totalDisplay;
  const roles=new Map((calculation.formula?.materials||[]).map(row=>[row.id,row.role]));
  return <div ref={root} className="formula-summary-design"><button type="button" className="btn secondary summary-print-button" onClick={print}><Printer size={16}/> Print formula sheet</button><div className="formula-summary-banner"><div className="formula-summary-identity"><p className="eyebrow">FORMULA NAME</p><h3 className="formula-summary-name">{name||'Formula'}</h3>{(showScent||inspiredBy)&&<dl className="formula-summary-scent">{showScent&&<div><dt>Scent</dt><dd>{scentName}</dd></div>}{inspiredBy&&<div><dt>Inspired by</dt><dd>{inspiredBy}</dd></div>}</dl>}<span>{basis==='oil'?'Based on fragrance oil amount':'Based on total output'}</span><div className="formula-summary-concentration"><strong>{display(oilPercentage)}%</strong><small>Fragrance concentration</small></div></div><div className="formula-summary-total"><small>Finished output</small><strong>{display(outputMl)} <em>ML</em></strong></div></div><div className="formula-summary-section"><div className="formula-summary-heading"><h4>Ingredients to measure</h4><span>{rowsDisplay.length} materials · {display(percentage)}% total</span></div><div className="formula-summary-ingredients">{rowsDisplay.map(row=><div className="formula-summary-ingredient" key={row.id}><div className="formula-summary-row-top"><strong>{row.name}</strong><span>{display(row.percentage)}%</span></div><div className="formula-summary-track"><i className={roles.get(row.id)==='oil'?'oil':''} style={{width:`${Math.max(0,Math.min(100,num(row.percentage)))}%`}}/></div><div className="formula-summary-row-bottom"><span>Measure</span><strong className="formula-summary-quantity">{display(row.quantity)} <small>{unitLabel(unit)}</small></strong></div></div>)}</div><div className="formula-summary-measure-total"><span>Total to measure</span><strong>{display(totalDisplay)} {unitLabel(unit)}</strong></div></div>{savedAt&&<p className="formula-summary-date">Saved {new Date(savedAt).toLocaleString('en-PH',{dateStyle:'medium',timeStyle:'short'})}. This summary reflects the quantities when the formula was saved.</p>}{live&&<p className="formula-summary-date">This older formula uses current raw material density values. Save an update to keep a quantity snapshot.</p>}</div>;
}
