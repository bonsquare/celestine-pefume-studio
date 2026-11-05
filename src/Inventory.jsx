import {useEffect,useMemo,useState} from 'react';
import {Plus,Pencil,Trash2,X,Save} from 'lucide-react';
import {num,money,unitLabel} from './logic';
import {addStock,addSupply,removeSupply,setStockCount,stockRows,stockSummary,supplyCategories,updateSupply} from './inventory';

const display=value=>new Intl.NumberFormat('en-PH',{maximumFractionDigits:2}).format(num(value));
const Field=({label,unit,children})=><label className="field"><span>{label}</span><span className="input-wrap">{children}{unit&&<em>{unitLabel(unit)}</em>}</span></label>;
const NumberInput=({value,onChange,...props})=><input type="number" inputMode="decimal" min="0" step="any" value={value} onChange={event=>onChange(event.target.value)} {...props}/>;
const filters=[['all','All'],['material','Raw materials'],['supply','Bottles & supplies'],['low','Low stock']];
const groups=['Raw materials','Bottles & supplies'];
const when=value=>value?new Date(value).toLocaleString('en-PH',{dateStyle:'medium',timeStyle:'short'}):'';

function StockEntry({row,onAdd,onCount,onClose}){
  const [mode,setMode]=useState('add'),[quantity,setQuantity]=useState(''),[note,setNote]=useState(''),[error,setError]=useState('');
  const submit=event=>{
    event.preventDefault();
    if(quantity===''||num(quantity)<0||(mode==='add'&&num(quantity)<=0)){setError(mode==='add'?'Enter a quantity greater than zero.':'Enter the counted quantity.');return}
    (mode==='add'?onAdd:onCount)(num(quantity),note);
    onClose();
  };
  return <form className="stock-entry" onSubmit={submit}>
    <div className="stock-entry-modes" role="group" aria-label="Stock action"><button type="button" className={mode==='add'?'active':''} onClick={()=>{setMode('add');setError('')}}>Add stock</button><button type="button" className={mode==='count'?'active':''} onClick={()=>{setMode('count');setError('')}}>Set counted total</button></div>
    <div className="stock-entry-fields">
      <Field label={mode==='add'?'Quantity received':'Counted quantity'} unit={row.unit}><NumberInput autoFocus value={quantity} onChange={value=>{setQuantity(value);setError('')}}/></Field>
      <label className="field"><span>Note (optional)</span><input value={note} placeholder="e.g. Supplier delivery, invoice no." onChange={event=>setNote(event.target.value)}/></label>
    </div>
    <p className="stock-entry-hint">{mode==='add'?`Adds to the ${display(row.stock)} ${unitLabel(row.unit)} on hand.`:`Replaces the ${display(row.stock)} ${unitLabel(row.unit)} on hand with your physical count.`}</p>
    {error&&<p className="material-error" role="alert">{error}</p>}
    <div className="stock-entry-actions"><button type="submit" className="btn primary"><Save size={16}/> {mode==='add'?'Add to stock':'Save count'}</button><button type="button" className="btn secondary" onClick={onClose}>Cancel</button></div>
  </form>;
}

function SupplyForm({initial,isNew,onSave,onClose,onDelete}){
  const [draft,setDraft]=useState({name:'',category:'Bottle',openingStock:'',reorderLevel:'',unitCost:'',usedPerBottle:'',...initial}),[error,setError]=useState('');
  const set=(key,value)=>{setDraft(current=>({...current,[key]:value}));setError('')};
  useEffect(()=>{const key=event=>{if(event.key==='Escape')onClose()};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key)},[]);
  const submit=event=>{
    event.preventDefault();
    if(!draft.name.trim()){setError('Enter an item name.');return}
    if([draft.openingStock,draft.reorderLevel,draft.unitCost,draft.usedPerBottle].some(value=>value!==''&&num(value)<0)){setError('Quantities and costs cannot be negative.');return}
    onSave(draft);
  };
  return <div className="material-dialog-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}><section className="material-dialog" role="dialog" aria-modal="true" aria-labelledby="supply-dialog-title">
    <div className="material-dialog-header"><div><p className="eyebrow">STOCK INVENTORY</p><h2 id="supply-dialog-title">{isNew?'Add bottle, sticker or supply':`Edit ${initial.name}`}</h2></div><button type="button" className="icon-button" aria-label="Close form" onClick={onClose}><X size={20}/></button></div>
    <form onSubmit={submit} className="material-dialog-form"><div className="material-dialog-fields">
      <h3 className="material-form-heading">Item</h3>
      <Field label="Item name"><input autoFocus value={draft.name} placeholder="e.g. 50 ML glass bottle" onChange={event=>set('name',event.target.value)}/></Field>
      <Field label="Category"><select value={draft.category} onChange={event=>set('category',event.target.value)}>{supplyCategories.map(category=><option key={category} value={category}>{category}</option>)}</select></Field>
      <h3 className="material-form-heading">Stock</h3>
      {isNew&&<Field label="Opening stock" unit="PCS"><NumberInput value={draft.openingStock} onChange={value=>set('openingStock',value)}/></Field>}
      <Field label="Low-stock level" unit="PCS"><NumberInput value={draft.reorderLevel} onChange={value=>set('reorderLevel',value)}/></Field>
      <h3 className="material-form-heading">Cost and use</h3>
      <Field label="Cost per piece" unit="₱"><NumberInput value={draft.unitCost} onChange={value=>set('unitCost',value)}/></Field>
      <Field label="Used per bottle" unit="PCS"><NumberInput value={draft.usedPerBottle} onChange={value=>set('usedPerBottle',value)}/></Field>
    </div>
    <p className="stock-entry-hint">“Used per bottle” takes stock off automatically when a batch is completed (bottles × this number). Leave it at 0 to adjust this item by hand only.</p>
    {error&&<p className="material-error" role="alert">{error}</p>}
    <div className="material-dialog-actions"><button type="submit" className="btn primary"><Save size={18}/> Save item</button><button type="button" className="btn secondary" onClick={onClose}>Cancel</button>{!isNew&&<button type="button" className="btn danger-action" onClick={()=>onDelete(initial)}><Trash2 size={17}/> Delete</button>}</div></form>
  </section></div>;
}

export default function Inventory({data,onChange,onNotice}){
  const [query,setQuery]=useState(''),[filter,setFilter]=useState('all'),[openKey,setOpenKey]=useState(null),[form,setForm]=useState(null),[showAll,setShowAll]=useState(false);
  const rows=useMemo(()=>stockRows(data),[data]),summary=useMemo(()=>stockSummary(rows),[rows]);
  const counts={all:rows.length,material:rows.filter(row=>row.kind==='material').length,supply:rows.filter(row=>row.kind==='supply').length,low:summary.low};
  const needle=query.trim().toLowerCase();
  const shown=rows.filter(row=>(filter==='all'||(filter==='low'?row.low:row.kind===filter))&&[row.name,row.detail,row.category].join(' ').toLowerCase().includes(needle)).sort((a,b)=>a.name.localeCompare(b.name,undefined,{sensitivity:'base'}));
  const log=[...(data.stockLog||[])].reverse(),visibleLog=showAll?log:log.slice(0,8);
  const saveSupply=draft=>{
    if(form.isNew){onChange(addSupply(data,draft,draft.openingStock));onNotice(`${draft.name.trim()} added to inventory.`)}
    else{onChange(updateSupply(data,form.initial.id,draft));onNotice(`${draft.name.trim()} updated.`)}
    setForm(null);
  };
  const deleteSupply=item=>{if(!confirm(`Delete “${item.name}” from inventory? Its stock history stays in the log.`))return;onChange(removeSupply(data,item.id));onNotice(`${item.name} deleted.`);setForm(null)};
  return <>
    <section className="card inventory-card">
      <div className="card-head"><div><p className="eyebrow">STOCK INVENTORY</p><h2>Everything in stock</h2></div><button className="btn primary" onClick={()=>setForm({isNew:true,initial:{}})}><Plus size={16}/> Add bottle or supply</button></div>
      <div className="inventory-stats"><div><span>Items</span><strong>{summary.items}</strong></div><div className={summary.low?'warn':''}><span>Low stock</span><strong>{summary.low}</strong></div><div><span>Stock value</span><strong>{money(summary.value)}</strong></div></div>
      <div className="inventory-tools"><label className="tool-search"><span>Search</span><input type="search" value={query} placeholder="Find an item" onChange={event=>setQuery(event.target.value)}/></label>
        <div className="status-chips inventory-chips" role="group" aria-label="Filter stock">{filters.map(([value,label])=><button type="button" key={value} className={filter===value?'active':''} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{label}<small>{counts[value]}</small></button>)}</div></div>
      {shown.length?groups.map(group=>{const list=shown.filter(row=>row.group===group);return list.length?<section className="inventory-group" key={group}><h3 className="inventory-group-title">{group}<small>{list.length}</small></h3>{list.map(row=>{const key=`${row.kind}:${row.id}`,open=openKey===key;return <article className={`stock-row ${row.low?'low':''}`} key={key}>
        <div className="stock-row-main">
          <div className="stock-row-name"><strong>{row.name}</strong><small>{row.detail}</small></div>
          <div className="stock-row-qty"><strong>{display(row.stock)} <em>{unitLabel(row.unit)}</em></strong><small className={row.low?'low':''}>{row.low?'Low stock':'In stock'} · alert at {display(row.reorder)}</small></div>
          <div className="stock-row-actions"><button className="btn primary stock-add" aria-expanded={open} onClick={()=>setOpenKey(open?null:key)}><Plus size={15}/> Add stock</button>{row.kind==='supply'&&<button className="icon-button" aria-label={`Edit ${row.name}`} onClick={()=>setForm({isNew:false,initial:row.item})}><Pencil size={17}/></button>}</div>
        </div>
        {open&&<StockEntry row={row} onClose={()=>setOpenKey(null)} onAdd={(quantity,note)=>{onChange(addStock(data,row.kind,row.id,quantity,note));onNotice(`Added ${display(quantity)} ${unitLabel(row.unit)} to ${row.name}.`)}} onCount={(quantity,note)=>{onChange(setStockCount(data,row.kind,row.id,quantity,note));onNotice(`${row.name} count set to ${display(quantity)} ${unitLabel(row.unit)}.`)}}/>}
      </article>})}</section>:null}):<div className="library-empty"><h3>{rows.length?'No items match':'Nothing in stock yet'}</h3><p>{rows.length?'Try a different search or filter.':'Add raw materials in the Raw Material Library, or add bottles, stickers and other supplies here.'}</p>{rows.length?<button className="btn" onClick={()=>{setQuery('');setFilter('all')}}>Clear filters</button>:<button className="btn primary" onClick={()=>setForm({isNew:true,initial:{}})}><Plus size={16}/> Add bottle or supply</button>}</div>}
      <p className="stock-footnote">Raw material details, prices and units are edited in the Raw Material Library. Completed batches deduct materials automatically.</p>
    </section>
    <section className="card inventory-card">
      <div className="card-head"><div><p className="eyebrow">HISTORY</p><h2>Stock movements</h2></div><span className="muted">{log.length} {log.length===1?'entry':'entries'}</span></div>
      {log.length?<><ul className="stock-log">{visibleLog.map(entry=><li key={entry.id}><div><strong>{entry.name}</strong><small>{when(entry.date)} · {entry.reason}{entry.note?` · ${entry.note}`:''}</small></div><div className={`stock-log-change ${entry.change>0?'up':'down'}`}>{entry.change>0?'+':''}{display(entry.change)} {unitLabel(entry.unit)}<small>Balance {display(entry.balance)}</small></div></li>)}</ul>{log.length>8&&<button className="btn secondary" onClick={()=>setShowAll(!showAll)}>{showAll?'Show fewer':`Show all ${log.length}`}</button>}</>:<p className="stock-footnote">Added stock, counts and batch usage will be listed here.</p>}
    </section>
    {form&&<SupplyForm key={form.initial.id||'new'} initial={form.initial} isNew={form.isNew} onSave={saveSupply} onClose={()=>setForm(null)} onDelete={deleteSupply}/>}
  </>;
}
