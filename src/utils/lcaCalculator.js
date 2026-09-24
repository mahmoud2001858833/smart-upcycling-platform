/**
 * Scientific Carbon Offset Calculator (LCA Methodology)
 * Based on ISO 14040/14044 and verified emission benchmarks.
 * 
 * Formula:
 * Delta CO2e = (Emissions_virgin + Emissions_landfill_avoided) - Emissions_upcycling_process
 */

// Global constant multipliers for real-world environmental equivalences
export const EQUIVALENCE_CONSTANTS = {
  // US EPA GHG Equivalencies: 8.22 grams CO2e per full smartphone charge
  SMARTPHONE_CHARGE_KG_CO2E: 0.00822,
  
  // UK DEFRA average internal combustion engine passenger vehicle (medium car): ~0.245 kg CO2e / km
  PASSENGER_CAR_KM_KG_CO2E: 0.245,
  
  // Average urban seedling absorption capacity (~21.77 kg CO2 / year = 0.0596 kg CO2 / day)
  TREE_ABSORPTION_DAY_KG_CO2E: 0.0596,
  
  // 10W LED bulb consuming 0.01 kWh, global average grid intensity 0.475 kg CO2e/kWh = 0.00475 kg CO2e / hour
  LED_BULB_HOUR_KG_CO2E: 0.00475,
};

/**
 * Calculates net avoided emissions for a given material and mass
 * @param {Object} material
 * @param {number} material.massKg - Weight of scrap in kilograms
 * @param {number} material.virginFactor - kg CO2e / kg for virgin material
 * @param {number} material.landfillFactor - kg CO2e / kg for avoided landfill/incineration
 * @param {number} [material.processFactor=0.005] - kg CO2e / kg for manual DIY upcycling
 */
export function calculateMaterialOffset({ massKg, virginFactor, landfillFactor, processFactor = 0.005 }) {
  const virginAvoided = massKg * virginFactor;
  const landfillAvoided = massKg * landfillFactor;
  const processEmissions = massKg * processFactor;
  const netOffset = (virginAvoided + landfillAvoided) - processEmissions;

  return {
    massKg: Number(massKg.toFixed(3)),
    virginAvoided: Number(virginAvoided.toFixed(4)),
    landfillAvoided: Number(landfillAvoided.toFixed(4)),
    processEmissions: Number(processEmissions.toFixed(4)),
    netOffsetKg: Number(Math.max(0, netOffset).toFixed(4)),
  };
}

/**
 * Calculates collective offset for multiple materials
 * @param {Array} materialsList - Array of material items with massKg and factors
 */
export function calculateCollectiveOffset(materialsList) {
  let totalMassKg = 0;
  let totalVirginAvoided = 0;
  let totalLandfillAvoided = 0;
  let totalProcessEmissions = 0;
  let totalNetOffsetKg = 0;

  const itemizedResults = materialsList.map(item => {
    const res = calculateMaterialOffset(item);
    totalMassKg += res.massKg;
    totalVirginAvoided += res.virginAvoided;
    totalLandfillAvoided += res.landfillAvoided;
    totalProcessEmissions += res.processEmissions;
    totalNetOffsetKg += res.netOffsetKg;
    return {
      ...item,
      ...res,
    };
  });

  const smartphoneCharges = Math.round(totalNetOffsetKg / EQUIVALENCE_CONSTANTS.SMARTPHONE_CHARGE_KG_CO2E);
  const carKmAvoided = Number((totalNetOffsetKg / EQUIVALENCE_CONSTANTS.PASSENGER_CAR_KM_KG_CO2E).toFixed(1));
  const treeDaysEquivalent = Number((totalNetOffsetKg / EQUIVALENCE_CONSTANTS.TREE_ABSORPTION_DAY_KG_CO2E).toFixed(1));
  const ledHoursEquivalent = Math.round(totalNetOffsetKg / EQUIVALENCE_CONSTANTS.LED_BULB_HOUR_KG_CO2E);

  return {
    totalMassKg: Number(totalMassKg.toFixed(3)),
    totalMassGrams: Math.round(totalMassKg * 1000),
    totalVirginAvoided: Number(totalVirginAvoided.toFixed(3)),
    totalLandfillAvoided: Number(totalLandfillAvoided.toFixed(3)),
    totalProcessEmissions: Number(totalProcessEmissions.toFixed(3)),
    totalNetOffsetKg: Number(totalNetOffsetKg.toFixed(3)),
    equivalences: {
      smartphoneCharges,
      carKmAvoided,
      treeDaysEquivalent,
      ledHoursEquivalent,
    },
    itemizedResults,
  };
}
