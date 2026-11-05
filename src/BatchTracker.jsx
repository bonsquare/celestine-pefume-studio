import {batchTimeline,localDate} from './production';

const open=batch=>!['Completed','Cancelled'].includes(batch.status||'Planned');

// Dashboard card: batches still in production, soonest-ready first, with maceration and maturation progress.
export default function BatchTracker({batches,onGo}){
  const today=localDate();
  const rows=batches.filter(open).map(batch=>({batch,line:batchTimeline(batch,today)})).sort((a,b)=>(a.batch.maturationDate||'9999').localeCompare(b.batch.maturationDate||'9999')).slice(0,4);
  return <section className="card batch-tracker">
    <div className="card-head"><div><p className="eyebrow">PRODUCTION</p><h2>Batches in production</h2></div>{batches.length>0&&<button className="dashboard-text-action" onClick={()=>onGo('Batches')}>View all</button>}</div>
    {rows.length?<ul className="tracker-list">{rows.map(({batch,line})=>{
      const stage=line.maceration.state!=='done'&&line.maceration.state!=='unset'?line.maceration:line.maturation;
      return <li key={batch.id}><button type="button" onClick={()=>onGo('Batches')}>
        <span className="tracker-name"><strong>{batch.name}</strong><small>{batch.batchNumber} · {batch.status||'Planned'}</small></span>
        <span className={`tracker-phase${line.ready?' is-ready':''}`}><strong>{line.phase}</strong><small>{line.detail||(batch.maturationDate?'':'No dates set')}{batch.maturationDate&&!line.ready?` · ready ${batch.maturationDate}`:''}</small></span>
        <span className="timeline-bar"><i style={{width:`${line.ready?100:stage.percent}%`}}/></span>
      </button></li>})}</ul>:<p className="empty">No batches in production. Plan a batch to track its maceration and maturation here.</p>}
  </section>;
}
