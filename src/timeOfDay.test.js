import {describe,expect,it} from 'vitest';
import {greetings,sceneFromSearch,timeOfDay} from './timeOfDay';

const at=(hour,minute=0)=>new Date(2026,10,5,hour,minute);

describe('timeOfDay',()=>{
  it('is morning from 5:00 to 11:59',()=>{
    expect(timeOfDay(at(5,0))).toBe('morning');
    expect(timeOfDay(at(8,30))).toBe('morning');
    expect(timeOfDay(at(11,59))).toBe('morning');
  });
  it('is afternoon from 12:00 to 17:59',()=>{
    expect(timeOfDay(at(12,0))).toBe('afternoon');
    expect(timeOfDay(at(15,45))).toBe('afternoon');
    expect(timeOfDay(at(17,59))).toBe('afternoon');
  });
  it('is evening from 18:00 through the night until 4:59',()=>{
    expect(timeOfDay(at(18,0))).toBe('evening');
    expect(timeOfDay(at(23,59))).toBe('evening');
    expect(timeOfDay(at(0,0))).toBe('evening');
    expect(timeOfDay(at(4,59))).toBe('evening');
  });
  it('covers all 24 hours with exactly one scene each',()=>{
    const scenes=Array.from({length:24},(_,hour)=>timeOfDay(at(hour)));
    expect(scenes.every(scene=>scene in greetings)).toBe(true);
    expect(scenes.filter(scene=>scene==='morning')).toHaveLength(7);
    expect(scenes.filter(scene=>scene==='afternoon')).toHaveLength(6);
    expect(scenes.filter(scene=>scene==='evening')).toHaveLength(11);
  });
  it('has a greeting for every scene',()=>{
    expect(greetings).toEqual({morning:'Good morning',afternoon:'Good afternoon',evening:'Good evening'});
  });
});

describe('sceneFromSearch',()=>{
  it('previews a scene named in the link',()=>{
    expect(sceneFromSearch('?scene=evening',at(9))).toBe('evening');
    expect(sceneFromSearch('?page=Costing&scene=afternoon',at(9))).toBe('afternoon');
  });
  it('falls back to the clock for unknown or missing values',()=>{
    expect(sceneFromSearch('?scene=night',at(9))).toBe('morning');
    expect(sceneFromSearch('',at(14))).toBe('afternoon');
    expect(sceneFromSearch('?scene=',at(20))).toBe('evening');
  });
});
