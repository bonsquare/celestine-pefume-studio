import {useState} from 'react';

export default function CostingSetup({formulas,form,onSelect,onCreate}){
 const [query,setQuery]=useState('');
 const matches=formulas.filter(item=>item.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
 return <section className="costing-setup card">
  <div className="costing-setup-heading"><div><p className="eyebrow">COSTING SETUP</p><h2>Choose a created formula</h2></div><span>{formulas.length} saved</span></div>
  {formulas.length?<>
   <label className="field"><span>Search formulas</span><input type="search" placeholder="Type a formula name" value={query} onChange={event=>setQuery(event.target.value)}/></label>
   <div className="costing-formula-list" role="listbox" aria-label="Created formulas">{matches.length?matches.map(item=><button type="button" role="option" aria-selected={item.id===form.id} className={item.id===form.id?'active':''} key={item.id} onClick={()=>onSelect(item.id)}><strong>{item.name}</strong><small>{item.id===form.id?'Selected formula':'Select formula'}</small></button>):<p className="muted">No matching formulas.</p>}</div>
   <div className="costing-selected"><span>Selected formula</span><strong>{form.name}</strong></div>
  </>:<div className="costing-empty"><p>Create and save a formula to start costing its raw materials and bottles.</p><button className="btn primary" onClick={onCreate}>Create a formula</button></div>}
 </section>;
}
