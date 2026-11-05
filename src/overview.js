import {num} from './logic';
import {calculatePricingTiers} from './pricing';

// The numbers shown on the dashboard for the current formula. They come from the same calculations as
// Costing -> Pricing, so both screens always agree:
//  - rawMaterialCost: what the raw materials cost at today's library prices (whole batch)
//  - costOfProduction: raw materials + labour + overhead + other costs + packaging (whole batch)
//  - costPerBottle: cost of one finished bottle (its share of the content plus its own packaging)
//  - suggestedPrice: the Retail price from the Pricing tab, based on that finished-bottle cost
// Per-bottle figures need a bottle size chosen in Costing; until then they are null.
export function formulaOverview(form,calc){
  const hasBottle=num(calc.bottleSize)>0&&num(calc.unitBottleCost)>0;
  const quantity=form?.pricingQuantity??calc.bottles;
  const tier=hasBottle?calculatePricingTiers(calc.unitBottleCost,quantity,form?.pricingTiers)[0]:null;
  return {
    volume:num(calc.volume),
    bottles:num(calc.bottles),
    rawMaterialCost:num(calc.ingredientCost),
    costOfProduction:num(calc.productionCost),
    hasBottle,
    costPerBottle:hasBottle?num(calc.unitBottleCost):null,
    tierName:tier?.name||'Retail',
    suggestedPrice:tier?tier.result.finalPrice:null,
    profitPerBottle:tier?tier.result.profit:null
  };
}
