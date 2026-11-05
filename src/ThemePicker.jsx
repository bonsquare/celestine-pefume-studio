import {Check} from 'lucide-react';
import {themes} from './themes';

// Settings > Appearance. Picking a theme applies at once and is saved with your data so it follows you to other devices.
export default function ThemePicker({value,onChange}){
  return <section className="card theme-picker" aria-label="Appearance">
    <div className="card-head"><div><p className="eyebrow">APPEARANCE</p><h2>Color theme</h2></div></div>
    <p className="muted">Choose how the app looks. It changes instantly.</p>
    <div className="theme-grid" role="radiogroup" aria-label="Color theme">
      {themes.map(theme=><button type="button" key={theme.id} role="radio" aria-checked={value===theme.id} className={`theme-card${value===theme.id?' is-selected':''}`} onClick={()=>onChange(theme.id)}>
        <span className="theme-swatches" aria-hidden="true">{theme.swatch.map((color,index)=><i key={index} style={{background:color}}/>)}</span>
        <span className="theme-name"><strong>{theme.name}</strong>{value===theme.id&&<Check size={14} aria-hidden="true"/>}</span>
        <small>{theme.note}</small>
      </button>)}
    </div>
  </section>;
}
