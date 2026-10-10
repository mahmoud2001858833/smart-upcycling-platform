/**
 * National emission baselines and coefficients for Jordan & international benchmarks
 * Data Sources:
 * - Jordan Ministry of Environment GHG Third National Communication (TNC / BUR2)
 * - NEPCO (National Electric Power Company - Jordan) Grid Emission Factor: ~0.495 kg CO2e / kWh
 * - Jordan Water Authority (Energy intensity of water pumping/desalination: ~2.1 kWh/m3)
 * - US EPA GHG Equivalencies Calculator & IPCC Tier 1 Mobile Combustion
 * - Global benchmark: 4.7 tonnes CO2e / person / year (World Average)
 * - Jordan average: ~2.8 tonnes CO2e / person / year
 */

export const JORDAN_REGIONS = [
  { id: 'amman', name: 'العاصمة عمان', gridFactor: 0.51, waterFactor: 0.0035, transportFactor: 0.22, baselinePerCapita: 3.1 },
  { id: 'irbid', name: 'إربد والشمال', gridFactor: 0.49, waterFactor: 0.0032, transportFactor: 0.20, baselinePerCapita: 2.7 },
  { id: 'zarqa', name: 'الزرقاء', gridFactor: 0.52, waterFactor: 0.0036, transportFactor: 0.23, baselinePerCapita: 3.2 },
  { id: 'aqaba', name: 'العقبة والجنوب', gridFactor: 0.48, waterFactor: 0.0042, transportFactor: 0.24, baselinePerCapita: 3.4 },
  { id: 'balqa', name: 'البلقاء', gridFactor: 0.49, waterFactor: 0.0033, transportFactor: 0.21, baselinePerCapita: 2.8 },
  { id: 'karak', name: 'الكرك', gridFactor: 0.48, waterFactor: 0.0031, transportFactor: 0.20, baselinePerCapita: 2.5 },
  { id: 'mafraq', name: 'المفرق', gridFactor: 0.47, waterFactor: 0.0034, transportFactor: 0.22, baselinePerCapita: 2.6 },
  { id: 'jerash', name: 'جرش وعجلون', gridFactor: 0.48, waterFactor: 0.0030, transportFactor: 0.19, baselinePerCapita: 2.4 }
];

export const FUEL_TYPES = [
  { id: 'gasoline_90', name: 'بنزين أوكتان 90', emissionPerKm: 0.192 },
  { id: 'gasoline_95', name: 'بنزين أوكتان 95', emissionPerKm: 0.198 },
  { id: 'diesel', name: 'ديزل (سولار)', emissionPerKm: 0.215 },
  { id: 'hybrid', name: 'هايبرد (هجين)', emissionPerKm: 0.110 },
  { id: 'electric', name: 'كهربائي بالكامل (EV)', emissionPerKm: 0.065 }
];

export const ENERGY_SOURCES = [
  { id: 'grid', name: 'شبكة الكهرباء العامة (National Grid)', factorMultiplier: 1.0 },
  { id: 'solar_partial', name: 'طاقة شمسية جزئية (Net-Metering 50%)', factorMultiplier: 0.5 },
  { id: 'solar_full', name: 'طاقة شمسية كاملة (Off-Grid / 100% Solar)', factorMultiplier: 0.05 }
];

/**
 * Core mathematical engine for carbon prediction & scenario simulations
 */
export function calculateEnvironmentalForecast(inputs) {
  const {
    electricityKwh = 500,        // Monthly kWh
    waterLiters = 15000,          // Monthly Liters
    carDistanceKm = 1000,         // Monthly Km
    flightsPerYear = 2,          // Flights / year
    wasteKg = 50,                // Monthly waste (kg)
    recyclingRatePercent = 30,   // %
    householdSize = 4,           // persons
    homeAreaSqm = 150,           // m²
    meatMealsPerWeek = 3,        // meals
    clothingPurchases = 5,       // items / month
    acHoursDaily = 6,            // hours / day
    fuelType = 'gasoline_90',
    energySource = 'grid',
    region = 'amman'
  } = inputs;

  const validHousehold = Math.max(householdSize, 1);
  const selectedRegion = JORDAN_REGIONS.find(r => r.id === region) || JORDAN_REGIONS[0];
  const selectedFuel = FUEL_TYPES.find(f => f.id === fuelType) || FUEL_TYPES[0];
  const selectedEnergy = ENERGY_SOURCES.find(e => e.id === energySource) || ENERGY_SOURCES[0];

  // 1. Electricity Emissions (Monthly & Annual)
  // Grid factor in Jordan ~0.495 kg CO2e / kWh * energy source multiplier
  const effectiveGridFactor = selectedRegion.gridFactor * selectedEnergy.factorMultiplier;
  const monthlyElectricityCo2 = electricityKwh * effectiveGridFactor;

  // AC impact factor (embedded in or added if heavy use)
  const acExtraMonthlyCo2 = (acHoursDaily > 4 ? (acHoursDaily - 4) * 30 * 1.5 * effectiveGridFactor : 0);

  // Total Electricity
  const totalMonthlyEnergyCo2 = monthlyElectricityCo2 + acExtraMonthlyCo2;

  // 2. Water Supply & Pumping Emissions
  // Water in Jordan pumped across elevation gradients (Disi, Zara Ma'in): ~0.0034 kg CO2e / Liter
  const monthlyWaterCo2 = (waterLiters * selectedRegion.waterFactor);

  // 3. Transport (Road + Flight)
  // Car travel
  const monthlyCarCo2 = carDistanceKm * selectedFuel.emissionPerKm;
  // Flight travel: Average short/medium haul flight ~350 kg CO2e per passenger roundtrip
  const annualFlightCo2 = flightsPerYear * 360;
  const monthlyFlightCo2 = annualFlightCo2 / 12;

  const totalMonthlyTransportCo2 = monthlyCarCo2 + monthlyFlightCo2;

  // 4. Waste & Upcycling
  // Unrecycled MSW in landfill emits ~0.85 kg CO2e / kg via anaerobic methane.
  // Upcycled / recycled waste offsets ~1.2 kg CO2e / kg.
  const recycledFraction = Math.min(Math.max(recyclingRatePercent / 100, 0), 1);
  const recycledWasteKg = wasteKg * recycledFraction;
  const landfilledWasteKg = wasteKg * (1 - recycledFraction);
  const monthlyWasteEmissions = landfilledWasteKg * 0.85;
  const monthlyWasteOffset = recycledWasteKg * 1.25;
  const netMonthlyWasteCo2 = Math.max(monthlyWasteEmissions - monthlyWasteOffset, 0);

  // 5. Diet & Consumption
  // Red meat meal ~3.6 kg CO2e vs plant meal 0.5 kg CO2e
  const monthlyMeatCo2 = (meatMealsPerWeek * 4.3) * 3.4;
  // Manufactured goods/clothes ~14 kg CO2e embodied per new garment/electronic
  const monthlyGoodsCo2 = clothingPurchases * 13.5;

  const totalMonthlyConsumptionCo2 = monthlyMeatCo2 + monthlyGoodsCo2;

  // Sum of Monthly Household Emissions
  const totalMonthlyHouseholdCo2 = totalMonthlyEnergyCo2 + monthlyWaterCo2 + totalMonthlyTransportCo2 + netMonthlyWasteCo2 + totalMonthlyConsumptionCo2;
  const totalAnnualHouseholdCo2 = totalMonthlyHouseholdCo2 * 12;

  // Per Capita (Per Person)
  const perCapitaAnnualCo2Kg = totalAnnualHouseholdCo2 / validHousehold;
  const perCapitaAnnualTonnes = perCapitaAnnualCo2Kg / 1000;

  // Benchmark Comparisons
  const jordanAvgTonnes = selectedRegion.baselinePerCapita; // ~2.8 - 3.1 tonnes
  const globalAvgTonnes = 4.7; // World average ~4.7 tonnes
  const parisAgreementTargetTonnes = 2.0; // Paris 1.5C climate goal ~2.0 tonnes

  const diffFromJordanPercent = ((perCapitaAnnualTonnes - jordanAvgTonnes) / jordanAvgTonnes) * 100;
  const diffFromGlobalPercent = ((perCapitaAnnualTonnes - globalAvgTonnes) / globalAvgTonnes) * 100;

  // Potential Reductions with Sustainable Measures
  // - Solar adoption or energy saving: 40% energy cut
  // - Upcycling and 80% recycling rate: 60% waste offset increase
  // - Public transit / eco-driving: 35% car cut
  // - Water aerators & conservation: 25% water cut
  const potentialSavingsMonthlyCo2 = (totalMonthlyEnergyCo2 * 0.40) + (monthlyCarCo2 * 0.35) + (monthlyWaterCo2 * 0.25) + (wasteKg * 0.5);
  const potentialSavingsAnnualTonnes = (potentialSavingsMonthlyCo2 * 12) / 1000;
  const potentialReductionPercent = Math.min(Math.round((potentialSavingsMonthlyCo2 / totalMonthlyHouseholdCo2) * 100), 65);

  // Category breakdown for chart
  const categories = [
    { key: 'energy', label: 'الكهرباء والتكييف', monthlyKg: Math.round(totalMonthlyEnergyCo2), percent: Math.round((totalMonthlyEnergyCo2 / totalMonthlyHouseholdCo2) * 100) || 0, color: '#f59e0b' },
    { key: 'transport', label: 'المواصلات والطيران', monthlyKg: Math.round(totalMonthlyTransportCo2), percent: Math.round((totalMonthlyTransportCo2 / totalMonthlyHouseholdCo2) * 100) || 0, color: '#3b82f6' },
    { key: 'consumption', label: 'الاستهلاك والغذاء', monthlyKg: Math.round(totalMonthlyConsumptionCo2), percent: Math.round((totalMonthlyConsumptionCo2 / totalMonthlyHouseholdCo2) * 100) || 0, color: '#8b5cf6' },
    { key: 'waste', label: 'النفايات والتدوير', monthlyKg: Math.round(netMonthlyWasteCo2), percent: Math.round((netMonthlyWasteCo2 / totalMonthlyHouseholdCo2) * 100) || 0, color: '#10b981' },
    { key: 'water', label: 'استهلاك وضخ المياه', monthlyKg: Math.round(monthlyWaterCo2), percent: Math.round((monthlyWaterCo2 / totalMonthlyHouseholdCo2) * 100) || 0, color: '#06b6d4' }
  ];

  // 12-Month Historical & Forecast Curve (Seasonality in Jordan: high AC in Summer Jul-Aug, heating in Dec-Feb)
  const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const seasonalFactors = [1.15, 1.10, 0.95, 0.88, 0.92, 1.05, 1.25, 1.28, 1.08, 0.94, 0.98, 1.12];

  const monthlyTrend = monthNames.map((m, idx) => {
    const factor = seasonalFactors[idx];
    const currentSimulated = Math.round(totalMonthlyHouseholdCo2 * factor);
    const optimizedSimulated = Math.round((totalMonthlyHouseholdCo2 - potentialSavingsMonthlyCo2) * factor);
    return {
      month: m,
      currentKg: currentSimulated,
      optimizedKg: optimizedSimulated
    };
  });

  // Regional Comparison within Jordan
  const regionalComparison = JORDAN_REGIONS.map(reg => {
    const factor = reg.baselinePerCapita / 3.0;
    return {
      id: reg.id,
      name: reg.name,
      baselinePerCapita: reg.baselinePerCapita,
      userPerCapita: Number(perCapitaAnnualTonnes.toFixed(2)),
      isUserRegion: reg.id === selectedRegion.id
    };
  });

  return {
    totalMonthlyHouseholdCo2Kg: Math.round(totalMonthlyHouseholdCo2),
    totalAnnualHouseholdCo2Tonnes: Number((totalAnnualHouseholdCo2 / 1000).toFixed(2)),
    perCapitaAnnualTonnes: Number(perCapitaAnnualTonnes.toFixed(2)),
    jordanAvgTonnes,
    globalAvgTonnes,
    parisAgreementTargetTonnes,
    diffFromJordanPercent: Math.round(diffFromJordanPercent),
    diffFromGlobalPercent: Math.round(diffFromGlobalPercent),
    potentialSavingsAnnualTonnes: Number(potentialSavingsAnnualTonnes.toFixed(2)),
    potentialReductionPercent,
    categories,
    monthlyTrend,
    regionalComparison,
    selectedRegion,
    selectedFuel,
    selectedEnergy
  };
}
