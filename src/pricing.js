import {num,uid} from './logic';

export const pricingTierNames=['Retail','Wholesale','Reseller','Promotional'];
export const defaultPricingTiers=()=>pricingTierNames.map((name,index)=>({id:uid(),name,method:'markup',rate:[100,50,40,25][index],rounding:index===0?'peso':'none',manualPrice:'',discountType:'percent',discount:0,maxDiscount:30,minMargin:0}));

const finite=value=>Number.isFinite(value)?value:0;
export const roundPrice=(price,mode)=>{const value=Math.max(0,finite(price));if(mode==='peso')return Math.ceil(value);if(mode==='5')return Math.ceil(value/5)*5;if(mode==='10')return Math.ceil(value/10)*10;if(mode==='ending9'){const rounded=Math.ceil(value);const candidate=Math.ceil((rounded+1)/10)*10-1;return candidate<value?candidate+10:candidate}return value};

export function calculatePriceTier(cost,quantity,tier){
 const unitCost=Math.max(0,num(cost)),qty=Math.max(0,Math.floor(num(quantity))),rate=num(tier.rate),method=['markup','margin','manual'].includes(tier.method)?tier.method:'markup';
 const warnings=[];let suggested=unitCost;
 if(unitCost<=0)warnings.push('Missing production cost information.');
 if(method==='margin'){
  if(rate<0||rate>=100){warnings.push('Target margin must be at least 0% and below 100%.');suggested=0}else suggested=unitCost/(1-rate/100);
 }else if(method==='manual')suggested=Math.max(0,num(tier.manualPrice));
 else suggested=unitCost*(1+Math.max(0,rate)/100);
 const override=tier.manualOverride!==''&&tier.manualOverride!=null?Math.max(0,num(tier.manualOverride)):null;
 const beforeDiscount=override??roundPrice(suggested,tier.rounding);
 const discountValue=Math.max(0,num(tier.discount));
 const discountAmount=tier.discountType==='fixed'?discountValue:beforeDiscount*discountValue/100;
 const finalPrice=Math.max(0,beforeDiscount-discountAmount),profit=finalPrice-unitCost;
 const actualMarkup=unitCost>0?profit/unitCost*100:0,actualMargin=finalPrice>0?profit/finalPrice*100:0;
 if(finalPrice<unitCost)warnings.push('Selling price is below production cost.');
 if(profit<0)warnings.push('This price produces a negative gross profit.');
 if(discountValue>Math.max(0,num(tier.maxDiscount)))warnings.push('Discount exceeds the configured limit.');
 if(actualMargin+1e-9<Math.max(0,num(tier.minMargin)))warnings.push('Selling price is below the minimum required margin.');
 return {suggested,priceBeforeDiscount:beforeDiscount,discountAmount,finalPrice,profit,actualMarkup,actualMargin,revenue:finalPrice*qty,projectedProfit:profit*qty,quantity:qty,warnings};
}

export function calculatePricingTiers(cost,quantity,tiers){return (tiers?.length?tiers:defaultPricingTiers()).map(tier=>({...tier,result:calculatePriceTier(cost,quantity,tier)}))}
export function snapshotPricing(cost,quantity,tiers){return {savedAt:new Date().toISOString(),costPerBottle:num(cost),quantity:Math.max(0,Math.floor(num(quantity))),tiers:structuredClone(calculatePricingTiers(cost,quantity,tiers))}}
