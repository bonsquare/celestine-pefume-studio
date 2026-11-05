// Morning 5:00 to 11:59, afternoon 12:00 to 17:59, evening 18:00 to 4:59.
export function timeOfDay(date=new Date()){
  const hour=date.getHours();
  if(hour>=5&&hour<12)return 'morning';
  if(hour>=12&&hour<18)return 'afternoon';
  return 'evening';
}

export const greetings={morning:'Good morning',afternoon:'Good afternoon',evening:'Good evening'};

const DAY=86400000;
const startOfDay=date=>new Date(date.getFullYear(),date.getMonth(),date.getDate());

// The Christmas season runs from November 1 to January 6. Before Christmas it counts the days down.
export function christmasInfo(date=new Date()){
  const month=date.getMonth(),day=date.getDate();
  const active=month===10||month===11||(month===0&&day<=6);
  if(!active)return {active:false,daysLeft:null,label:''};
  const year=month===0?date.getFullYear()-1:date.getFullYear();
  const daysLeft=Math.round((new Date(year,11,25)-startOfDay(date))/DAY);
  const label=daysLeft>1?`${daysLeft} days to Christmas`:daysLeft===1?'1 day to Christmas':daysLeft===0?'Merry Christmas!':'Happy holidays';
  return {active:true,daysLeft,label};
}

// ?theme=christmas or ?theme=normal previews a theme any time. Otherwise Christmas shows during the season.
export function themeFromSearch(search,date=new Date()){
  try{
    const wanted=new URLSearchParams(search).get('theme');
    if(wanted==='christmas'||wanted==='normal')return wanted;
  }catch{/* fall through to the calendar */}
  return christmasInfo(date).active?'christmas':'normal';
}

// ?scene=morning (or afternoon, evening) previews a scene at any hour. Anything else uses the clock.
export function sceneFromSearch(search,date=new Date()){
  try{
    const wanted=new URLSearchParams(search).get('scene');
    return wanted in greetings?wanted:timeOfDay(date);
  }catch{return timeOfDay(date)}
}
