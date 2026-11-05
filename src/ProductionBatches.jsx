import {useEffect,useRef,useState} from 'react';
import {Check,Plus,Trash2} from 'lucide-react';
import {money,num,uid} from './logic';
import {snapshotPricing} from './pricing';
import {deductSuppliesForBatch,stockDiffEntries} from './stock';
import {addDays,autoProgressBatch,batchStatuses,batchTimeline,completeBatchInventory,inventoryShortages,localDate,markStageDone,nextBatchNumber,undoStage} from './production';

// The fields you can edit on a batch. They are kept as a draft until you press Save.
const editable=['status','actualYield','macerationStart','macerationDate','maturationDate','macerationDoneOn','maturationDoneOn','macerationNote','maturationNote'];
const pick=batch=>Object.fromEntries(editable.map(key=>[key,batch[key]]));
const sameFields=(a,b)=>editable.every(key=>(a[key]??'')===(b[key]??''));

function BatchCard({batch,deleting,setDeleting,onSave,onDelete}){
  const [draft,setDraft]=useState(batch);
  const dirty=!sameFields(draft,batch);
  // Pick up changes made elsewhere (like a date arriving) unless you are in the middle of editing.
  const lastSaved=useRef(batch);
  useEffect(()=>{if(sameFields(draft,lastSaved.current))setDraft(batch);lastSaved.current=batch},[batch]);// eslint-disable-line react-hooks/exhaustive-deps
  const set=patch=>setDraft(current=>({...current,...patch}));
  const line=batchTimeline(draft);
  const save=()=>{const merged=autoProgressBatch({...batch,...pick(draft)});setDraft({...batch,...pick(merged)});onSave(batch,pick(merged))};
  return <article className="production-record">
    <div className="production-record-head">
      <div><span>Batch ID <b>{batch.batchNumber||'—'}</b></span><strong>{batch.name}</strong><small>{batch.date} · {batch.bottles} bottles</small></div>
      <select className={`batch-status status-${(draft.status||'Planned').toLowerCase()}`} value={draft.status||'Planned'} onChange={event=>set({status:event.target.value})}>{batchStatuses.map(status=><option key={status}>{status}</option>)}</select>
    </div>
    <div className="production-metrics">
      <div><span>Expected</span><strong>{num(batch.expectedYield||batch.calculation?.volume).toFixed(1)} ML</strong></div>
      <label><span>Actual yield</span><input type="number" min="0" value={draft.actualYield??batch.expectedYield??batch.calculation?.volume} onChange={event=>set({actualYield:event.target.value})}/></label>
      <div><span>Raw material cost</span><strong>{money(batch.calculation?.ingredientCost)}</strong></div>
    </div>
    <div className="batch-timeline">
      <div className={`timeline-phase${line.ready?' is-ready':''}`}><strong>{line.phase}</strong>{line.detail&&<small>{line.detail}</small>}</div>
      {[['maceration','macerationStart','macerationDate',line.maceration],['maturation',null,'maturationDate',line.maturation]].map(([key,startKey,endKey,stage])=><div className={`timeline-stage stage-${stage.state}`} key={key}>
        <div className="timeline-stage-head"><span>{stage.label}</span><small>{stage.state==='unset'?'Not set':stage.state==='done'?`Done${stage.doneOn?` ${stage.doneOn}`:''}`:stage.state==='upcoming'?'Not started':`${stage.daysLeft} day${stage.daysLeft===1?'':'s'} left`}</small>{(draft[`${key}DoneOn`]||stage.state!=='done')&&<button type="button" className="stage-done-btn" onClick={()=>setDraft(current=>current[`${key}DoneOn`]?undoStage(current,key):markStageDone(current,key))}>{draft[`${key}DoneOn`]?'Undo':'Mark done'}</button>}</div>
        <div className="timeline-bar"><i style={{width:`${stage.percent}%`}}/></div>
        <div className="timeline-dates">
          {startKey&&<label><span>Starts</span><input type="date" value={draft.macerationStart||draft.date||''} onChange={event=>set({[startKey]:event.target.value})}/></label>}
          <label><span>{key==='maturation'?'Ready for packaging':'Maceration ready'}</span><input type="date" value={draft[endKey]||''} min={draft.macerationStart||draft.date||undefined} onChange={event=>set({[endKey]:event.target.value})}/></label>
        </div>
        <input className="stage-note" placeholder={`${stage.label} notes (optional)`} value={draft[`${key}Note`]||''} onChange={event=>set({[`${key}Note`]:event.target.value})}/>
      </div>)}
    </div>
    <div className="production-record-foot">
      <small>{batch.inventoryDeducted?'Inventory deducted':'Inventory deducts when completed'}</small>
      {deleting===batch.id
        ?<div className="batch-delete-confirm"><small>{batch.inventoryDeducted?'Stock already deducted stays deducted.':'Delete this batch?'}</small><button type="button" className="btn" onClick={()=>setDeleting(null)}>Cancel</button><button type="button" className="btn danger" onClick={()=>onDelete(batch)}>Delete</button></div>
        :<><button type="button" className={`btn batch-save${dirty?' primary':''}`} disabled={!dirty} onClick={save}>{dirty?'Save changes':<><Check size={14}/> Saved</>}</button><button type="button" className="remove-cost-row" onClick={()=>setDeleting(batch.id)} aria-label={`Delete ${batch.batchNumber}`}><Trash2 size={15}/></button></>}
    </div>
  </article>;
}

export default function ProductionBatches({data,form,calc,onChange,onNotice}){
 const [filter,setFilter]=useState('all'),[deleting,setDeleting]=useState(null);
 const create=()=>{const quantity=form.pricingQuantity??calc.bottles,pricingSnapshot=snapshotPricing(calc.unitBottleCost,quantity,form.pricingTiers),today=localDate(),batch={id:uid(),batchNumber:nextBatchNumber(data.batches,today),name:form.name,date:today,status:'Planned',macerationStart:today,macerationDate:addDays(today,14),maturationDate:addDays(today,30),expectedYield:calc.volume,actualYield:calc.volume,bottles:quantity,productionCost:calc.productionCost,costPerBottle:calc.unitBottleCost,projectedGrossProfit:pricingSnapshot.tiers[0]?.result.projectedProfit??0,formula:structuredClone(form),calculation:structuredClone(calc),pricingSnapshot,inventoryDeducted:false};onChange({...data,batches:[...data.batches,batch]});onNotice(`Planned batch ${batch.batchNumber}.`)};
 // Saving always updates the batch with the same ID. It never adds a second copy.
 const update=(batch,patch)=>{const next={...batch,...patch};if(patch.status==='Completed'&&!batch.inventoryDeducted){const shortages=inventoryShortages(data.ingredients,batch.calculation);if(shortages.length){onNotice(`Cannot complete: insufficient ${shortages.map(item=>item.name).join(', ')}.`);return}next.inventoryDeducted=true;const ingredients=completeBatchInventory(data.ingredients,batch),logged={...data,ingredients,stockLog:[...(data.stockLog||[]),...stockDiffEntries(data.ingredients,ingredients,'material','Batch',batch.batchNumber)]},used=deductSuppliesForBatch(logged,num(batch.bottles),batch.batchNumber);onChange({...used.data,batches:data.batches.map(item=>item.id===batch.id?next:item)});onNotice(used.short.length?`Batch completed. Not enough stock of: ${used.short.join(', ')}.`:'Batch completed and stock deducted.');return}onChange({...data,batches:data.batches.map(item=>item.id===batch.id?next:item)});onNotice(`Saved batch ${batch.batchNumber}.`)};
 const remove=batch=>{setDeleting(null);onChange({...data,batches:data.batches.filter(item=>item.id!==batch.id)});onNotice('Batch deleted.')};
 const names=[...new Set(data.batches.map(batch=>batch.name||'Untitled'))].sort((a,b)=>a.localeCompare(b));
 const active=names.includes(filter)?filter:'all';
 const shown=active==='all'?data.batches:data.batches.filter(batch=>(batch.name||'Untitled')===active);
 return <section className="card production-batches"><div className="card-head"><div><p className="eyebrow">PRODUCTION</p><h2>Production batches</h2></div><button className="btn primary batch-add" onClick={create}><Plus size={15}/> Plan batch</button></div>
  {data.batches.length>1&&<label className="batch-filter"><span>Formulation</span><select value={active} onChange={event=>setFilter(event.target.value)}><option value="all">All formulations ({data.batches.length})</option>{names.map(name=><option key={name} value={name}>{name} ({data.batches.filter(batch=>(batch.name||'Untitled')===name).length})</option>)}</select></label>}
  {data.batches.length?<div className="production-list">{[...shown].reverse().map(batch=><BatchCard key={batch.id} batch={batch} deleting={deleting} setDeleting={setDeleting} onSave={update} onDelete={remove}/>)}</div>:<p className="empty">Plan a production batch to track its status, yield, maturation, cost, and material usage.</p>}
 </section>
}
