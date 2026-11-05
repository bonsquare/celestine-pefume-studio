export default function CostingSetup({formulas,form,selectedId,onSelect,onCreate}){
 return <section className="costing-setup card">
  <div className="costing-setup-heading"><div><p className="eyebrow">COSTING</p><h2>Pick a formula to cost</h2></div><span>{formulas.length} saved</span></div>
  {formulas.length?<>
   <div className="costing-current"><div><span>{selectedId?'Selected formulation':'First step'}</span><strong>{selectedId?form.name:'Choose a formulation'}</strong><small>{selectedId?'Work through steps 1 to 3 below to get its cost and selling price.':'Pick one to see its cost summary and set its price.'}</small></div><label className="costing-formula-select"><span>Choose formulation</span><select value={selectedId||''} onChange={event=>onSelect(event.target.value)}><option value="" disabled>Select formulation</option>{formulas.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>
  </>:<div className="costing-empty"><p>Create and save a formula to start costing its raw materials and bottles.</p><button className="btn primary" onClick={onCreate}>Create a formula</button></div>}
 </section>;
}
