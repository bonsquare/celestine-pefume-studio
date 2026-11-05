import {attentionCount} from './overview';

const plural=(count,one,many)=>`${count} ${count===1?one:many}`;

// The top of the Dashboard: a greeting, what needs attention, and quick actions.
export default function DashboardBanner({name,alerts,onGo,onNewFormula}){
  const attention=attentionCount(alerts),empty=alerts.formulas===0;
  const items=[
    {key:'low',count:alerts.lowStock,text:plural(alerts.lowStock,'low-stock item','low-stock items'),page:'Inventory of Raw Materials'},
    {key:'ready',count:alerts.ready,text:plural(alerts.ready,'batch ready to bottle','batches ready to bottle'),page:'Batches'},
    {key:'bottle',count:alerts.needBottle,text:plural(alerts.needBottle,'formula needs a bottle size','formulas need a bottle size'),page:'Costing'},
    {key:'price',count:alerts.unsavedPrice,text:plural(alerts.unsavedPrice,'price not saved','prices not saved'),page:'Costing'}
  ].filter(item=>item.count>0);
  const headline=name?`Hello, ${name}`:'Welcome back';
  const summary=empty
    ?'Build a formula, calculate its cost and prepare it for production.'
    :attention===0
      ?'Everything is on track. Nothing needs your attention.'
      :`${plural(attention,'thing needs','things need')} your attention.`;
  return <section className="dashboard-hero dashboard-banner">
    <div className="dashboard-hero-copy">
      <p className="eyebrow">PRODUCTION OVERVIEW</p>
      <h2>{headline}</h2>
      <p>{summary}</p>
      {!empty&&<div className="banner-chips" role="list">
        {items.map(item=><button type="button" role="listitem" key={item.key} className="banner-chip warn" onClick={()=>onGo(item.page)}><strong>{item.count}</strong> {item.text.replace(/^\d+ /,'')}</button>)}
        {attention===0&&<span className="banner-chip ok" role="listitem">All caught up</span>}
        {alerts.inProgress>0&&<button type="button" role="listitem" className="banner-chip" onClick={()=>onGo('Batches')}><strong>{alerts.inProgress}</strong> {alerts.inProgress===1?'batch':'batches'} in progress</button>}
      </div>}
    </div>
    <div className="dashboard-hero-actions">
      <button type="button" className="btn primary" onClick={onNewFormula}>New formula</button>
      <button type="button" className="btn" onClick={()=>onGo('Inventory of Raw Materials')}>Add stock</button>
    </div>
  </section>;
}
