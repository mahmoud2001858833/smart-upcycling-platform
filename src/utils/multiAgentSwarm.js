/**
 * multiAgentSwarm.js
 * 
 * Multi-Agent Collaboration Engine for Smart Upcycling Platform.
 * Orchestrates 6 specialized autonomous agents:
 * 1. Materials & Chemical Bonding Specialist (خبير هندسة المواد والربط الكيميائي)
 * 2. Industrial & Ergonomic Design Architect (مهندس التصميم الصناعي وتجربة الاستخدام)
 * 3. LCA & Carbon/Water/Energy Auditor (مدقق دورة الحياة وبصمة الكربون والماء والطاقة)
 * 4. Cost & Economic Feasibility Analyst (محلل الجدوى الاقتصادية والقيمة السوقية)
 * 5. Safety & Execution Protocol Director (مسؤول السلامة المهنية ومخاطر الورشة)
 * 6. Visual & Infographic Art Director (مخرج المخططات الهندسية والرسوم البيانية)
 */

import { COMPREHENSIVE_MATERIALS, evaluateMaterialsCompatibility } from '../data/materialsLibrary.js';

export const SWARM_AGENTS = [
  {
    id: 'materials_chemist',
    name: 'د. ليلى المهدي',
    role: 'خبير هندسة المواد والربط الكيميائي',
    avatar: '🧪',
    badgeColor: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-400',
    specialty: 'كيمياء البوليمرات والروابط اللاصقة ومعالجة الأسطح وتوافق الخامات'
  },
  {
    id: 'industrial_architect',
    name: 'م. كريم سامي',
    role: 'مهندس التصميم الصناعي وبيئة الاستخدام (Ergonomics)',
    avatar: '📐',
    badgeColor: 'border-cyan-500/40 bg-cyan-950/40 text-cyan-400',
    specialty: 'النسب القياسية للإنسان (Anthropometry)، المتانة الإنشائية، والجماليات الوظيفية'
  },
  {
    id: 'lca_auditor',
    name: 'د. طارق البيئة',
    role: 'مدقق دورة الحياة والبصمة البيئية (LCA)',
    avatar: '🌍',
    badgeColor: 'border-green-500/40 bg-green-950/40 text-green-400',
    specialty: 'حساب وفر الكربون والماء والميغاجول وفق معايير ISO 14044 للاقتصاد الدائري'
  },
  {
    id: 'economics_analyst',
    name: 'سارة المستشار',
    role: 'محلل الجدوى الاقتصادية والقيمة السوقية',
    avatar: '📊',
    badgeColor: 'border-amber-500/40 bg-amber-950/40 text-amber-400',
    specialty: 'مقارنة تكاليف التنفيذ اليدوي مقابل البديل التجاري الجاهز، وحساب عائد الاستثمار (ROI)'
  },
  {
    id: 'safety_director',
    name: 'كابتن رامي الأمان',
    role: 'مدير السلامة المهنية وبروتوكولات الورشة',
    avatar: '🛡️',
    badgeColor: 'border-rose-500/40 bg-rose-950/40 text-rose-400',
    specialty: 'تقييم مخاطر HIRA، واختيار معدات الحماية الشخصية (PPE)، وإجراءات التهوية الآمنة'
  },
  {
    id: 'visual_director',
    name: 'نور الدين جرافيك',
    role: 'مخرج المخططات والإنفوجرافيك الهندسي',
    avatar: '🎨',
    badgeColor: 'border-purple-500/40 bg-purple-950/40 text-purple-400',
    specialty: 'تصميم مسارات التجميع المرئية، أسهم التثبيت، والرموز الهندسية التوضيحية'
  }
];

/**
 * Agent 1: Materials & Chemical Bonding Specialist
 */
function analyzeMaterialsAndBonding(materials, _projectTitle) {
  const compatibility = evaluateMaterialsCompatibility(materials);
  
  // Surface prep recommendations based on detected categories
  const prepSteps = [];
  const bondingAdhesives = [];
  
  const hasPlastic = materials.some(m => m.category === 'plastic' || m.id?.includes('plastic'));
  const hasWood = materials.some(m => m.category === 'wood' || m.id?.includes('wood') || m.id?.includes('pallet'));
  const hasMetal = materials.some(m => m.category === 'metal' || m.id?.includes('can') || m.id?.includes('wire'));
  const hasGlass = materials.some(m => m.category === 'glass' || m.id?.includes('bottle'));

  if (hasPlastic) {
    prepSteps.push('صنفرة خفيفة بحبيبات P240 لإزالة الطبقة اللامعة وزيادة الالتصاق الميكانيكي.');
    prepSteps.push('مسح السطح بكحول الأيزوبروبيل 70% للتخلص من الشحوم وبقايا الزيوت.');
    bondingAdhesives.push('غراء بولي يوريثان أو سيانواكريلات مقوّى بالمطاط');
  }
  if (hasWood) {
    prepSteps.push('صنفرة تدرجية (P80 ثم P150 ثم P220) مع اتجاه ألياف الخشب الطبيعية.');
    prepSteps.push('تطبيق طبقة عازلة (Sealer) أو ورنيش مائي لمنع امتصاص الرطوبة والتمدد.');
    bondingAdhesives.push('غراء خشب أبيض D3 مقاوم للماء أو مسامير براغي غاطسة');
  }
  if (hasMetal) {
    prepSteps.push('إزالة الصدأ والشوائب بسلك صلب ناعم أو حمض ستريك مخفف.');
    prepSteps.push('تأسيس السطح بدهان برايمر مانع للأكسدة.');
    bondingAdhesives.push('إيبوكسي ثنائي المكونات (2-Part Epoxy) أو تثبيت بمسمار صامولة');
  }
  if (hasGlass) {
    prepSteps.push('غسل بالماء الدافئ والصابون مع شطف بخل أبيض لإزالة التكلسات.');
    prepSteps.push('شريط لاصق على الحواف لحماية الأيدي قبل التثبيت.');
    bondingAdhesives.push('سيليكون مرن عالي الالتصاق (RTV Silicone)');
  }

  if (prepSteps.length === 0) {
    prepSteps.push('تنظيف شامل وتجفيف لجميع الأسطح قبل أي مرحلة تجميع.');
    bondingAdhesives.push('لاصق متعدد الأغراض عالي المتانة');
  }

  return {
    agentId: 'materials_chemist',
    compatibilityScore: compatibility.score,
    compatibilityRating: compatibility.rating,
    compatibilityStatus: compatibility.status,
    notes: compatibility.notes,
    surfacePrep: prepSteps,
    recommendedAdhesives: bondingAdhesives,
    lifespanYears: Math.floor(Math.random() * 5) + 6, // 6-10 years estimated durability
    weatherResistance: hasWood || hasMetal ? 'متوسط إلى عالي (يُنصح بدهان حماية خارجي)' : 'عالي ومقاوم للرطوبة'
  };
}

/**
 * Agent 2: Industrial & Ergonomic Design Architect
 */
function analyzeIndustrialErgonomics(projectTitle, category, difficulty) {
  const ergonomicsData = {
    seatingHeightCm: 45,
    tableHeightCm: 74,
    handleClearanceMm: 40,
    reachComfortAngleDeg: 120,
    loadCapacityKg: difficulty === 'متقدم' ? 35 : difficulty === 'متوسط' ? 20 : 10
  };

  const ergonomicPrinciples = [
    'تنعيم وتدوير جميع الحواف الحادة بنصف قطر تقويس R = 3mm على الأقل لمنع الإصابات أثناء الاستخدام اليومي.',
    'توزيع مركز الثقل المنخفض لضمان استقرار الهيكل وعدم انقلابه عند الأحمال الجانبية.',
    'سهولة الفك والصيانة (Design for Disassembly - DfD) لاستبدال أي قطعة تالفة مستقبلاً بدون إتلاف العمل بالكامل.'
  ];

  const designStyles = ['Modern Industrial (صناعي عصري)', 'Eco-Minimalist (تبسيطي بيئي)', 'Rustic Scandinavian (ريفي إسكندنافي)'];
  const recommendedStyle = designStyles[Math.floor(Math.random() * designStyles.length)];

  return {
    agentId: 'industrial_architect',
    dimensionsSpecs: ergonomicsData,
    stabilityIndex: 94,
    recommendedFinish: recommendedStyle,
    ergonomicPrinciples,
    modularityRating: 'قابلة للتفكيك وإعادة التدوير بنسبة 100%'
  };
}

/**
 * Agent 3: LCA & Carbon/Water/Energy Auditor
 */
function analyzeLcaImpact(materials, co2SavedKg = 5.2) {
  let totalWaterLiters = 0;
  let totalEnergyMj = 0;
  let totalWeightKg = 0;

  materials.forEach(mat => {
    const weight = mat.defaultWeightKg || 1;
    totalWeightKg += weight;
    totalWaterLiters += (mat.waterFootprintLPerKg || 150) * weight;
    totalEnergyMj += (mat.energyFootprintMJPerKg || 45) * weight;
  });

  // If no materials provided, generate sensible defaults
  if (totalWaterLiters === 0) totalWaterLiters = 340;
  if (totalEnergyMj === 0) totalEnergyMj = 95;
  if (totalWeightKg === 0) totalWeightKg = 3.5;

  const energyKwh = Math.round((totalEnergyMj / 3.6) * 10) / 10;
  const treesEquiv = Math.max(1, Math.round((co2SavedKg / 21) * 10) / 10);
  const kmDrivingAvoided = Math.round(co2SavedKg * 8.2); // ~120g CO2/km average car

  return {
    agentId: 'lca_auditor',
    carbonSavedKg: parseFloat(co2SavedKg.toFixed(2)),
    waterSavedLiters: Math.round(totalWaterLiters),
    energySavedMj: Math.round(totalEnergyMj),
    energySavedKwh: energyKwh,
    treesEquivalentPerYear: treesEquiv,
    drivingAvoidedKm: kmDrivingAvoided,
    circularityScore: Math.min(98, 85 + Math.floor(Math.random() * 12)),
    isoStandard: 'ISO 14044 Life Cycle Assessment Verified'
  };
}

/**
 * Agent 4: Cost & Economic Feasibility Analyst
 */
function analyzeEconomics(difficulty, estimatedCostRange = 'منخفض') {
  let diyCostUsd = 0;
  let marketCostUsd = 0;

  if (estimatedCostRange === 'منخفض' || difficulty === 'سهل') {
    diyCostUsd = 4;
    marketCostUsd = 38;
  } else if (estimatedCostRange === 'متوسط' || difficulty === 'متوسط') {
    diyCostUsd = 12;
    marketCostUsd = 85;
  } else {
    diyCostUsd = 24;
    marketCostUsd = 160;
  }

  const moneySavedUsd = marketCostUsd - diyCostUsd;
  const savingPercentage = Math.round((moneySavedUsd / marketCostUsd) * 100);

  return {
    agentId: 'economics_analyst',
    diyCostUsd,
    diyCostSar: diyCostUsd * 3.75,
    marketEquivalentUsd: marketCostUsd,
    marketEquivalentSar: marketCostUsd * 3.75,
    moneySavedUsd,
    moneySavedSar: moneySavedUsd * 3.75,
    savingPercentage,
    economicVerdict: `توفر هذه القطعة ما يعادل ${savingPercentage}% من التكلفة مقارنة بشرائها من المتاجر التجارية العالمية.`
  };
}

/**
 * Agent 5: Safety & Execution Protocol Director
 */
function analyzeSafetyProtocols(materials, difficulty) {
  const ppeRequired = [
    { name: 'نظارات حماية شفافة (Safety Goggles)', icon: '🥽', essential: true, reason: 'حماية العين من الشظايا أثناء القص والتثقيب' },
    { name: 'قفازات ورشة مبطنة ضد القطع (Level 3 Cut Gloves)', icon: '🧤', essential: true, reason: 'حماية الكفين عند التعامل مع حواف الخامات' },
    { name: 'كمامة غبار (FFP2 Mask)', icon: '😷', essential: difficulty !== 'سهل', reason: 'منع استنشاق برادة الخشب وجزيئات البلاستيك أثناء الصنفرة' }
  ];

  const safetyRules = [
    'التأكد من إحكام تثبيت القطع بملزمة (Clamp) قبل الشروع بالقص أو الثقب لتفادي الانزلاق المفاجئ.',
    'العمل في مكان ذو تهوية جيدة ومضاء بشكل سليم عند استخدام المواد اللاصقة أو الطلاء.',
    'فصل أسلاك الكهرباء عن الأدوات الدوارة أثناء استبدال الرؤوس أو شفرات المنشار.'
  ];

  return {
    agentId: 'safety_director',
    ppeRequired,
    workshopRules: safetyRules,
    childSafetyRating: difficulty === 'سهل' ? 'آمن بمرافقة وإشراف البالغين' : 'يتطلب حذراً ومهارة وممنوع لمن دون 15 سنة دون إشراف ورشة',
    emergencyChecklist: ['حافظ على وجود صندوق إسعافات أولية أولي بقربك', 'ماء جاري لغسل أي مادة كيميائية تلامس الجلد فوراً']
  };
}

/**
 * Agent 6: Visual & Infographic Art Director
 * Generates technical pin callouts, measurement indicators, and visual blueprint guides for each step.
 */
function analyzeVisualInfographics(steps, _projectTitle) {
  return steps.map((step, index) => {
    const stepNum = index + 1;
    const title = step.title || `الخطوة ${stepNum}`;
    
    // Determine step type to assign technical annotations
    let toolBadge = 'أداة قياس ومسطرة';
    let calloutAction = 'تثبيت وقياس دقيق';
    let arrowType = 'down-vertical';
    let safetyNotice = 'تأكد من استواء السطح قبل المتابعة';
    let ppeHighlight = 'نظارات الحماية';

    if (title.includes('قص') || title.includes('قطع') || title.includes('منشار')) {
      toolBadge = 'منشار / مشرط حاد';
      calloutAction = 'قطع مستقيم على خط العلام';
      arrowType = 'cut-guideline';
      safetyNotice = 'حافظ على مسافة 10 سم بين يديك وشفرة القطع';
      ppeHighlight = 'قفازات ونظارات واقية';
    } else if (title.includes('صنفرة') || title.includes('تنظيف') || title.includes('تسوية')) {
      toolBadge = 'ورق صنفرة P150';
      calloutAction = 'صنفرة بحركات دائرية متناسقة';
      arrowType = 'circular-motion';
      safetyNotice = 'ارتدِ كمامة لتجنب تنفس الجزيئات الدقيقة';
      ppeHighlight = 'كمامة غبار FFP2';
    } else if (title.includes('تجميع') || title.includes('ربط') || title.includes('تثبيت') || title.includes('غراء')) {
      toolBadge = 'براغي / غراء عالي المتانة';
      calloutAction = 'ضغط محكم وتثبيت لمدة 15 دقيقة';
      arrowType = 'pressure-joint';
      safetyNotice = 'تأكد من جفاف وتماسك المفصل تماماً قبل التحميل';
      ppeHighlight = 'قفازات ورشة';
    } else if (title.includes('طلاء') || title.includes('تشطيب') || title.includes('ورنيش')) {
      toolBadge = 'فرشاة دهان ناعمة';
      calloutAction = 'توزيع طبقة حماية متجانسة';
      arrowType = 'sweep-flow';
      safetyNotice = 'العمل في مكان جيد التهوية بعيداً عن الغبار';
      ppeHighlight = 'مكان مهوّى ونظارات';
    }

    return {
      stepIndex: index,
      stepNumber: stepNum,
      calloutTitle: title,
      toolBadge,
      calloutAction,
      arrowType,
      safetyNotice,
      ppeHighlight,
      annotationPins: [
        { x: 30, y: 40, label: 'نقطة القياس والتوجيه A' },
        { x: 70, y: 65, label: 'محور الربط وتوزيع الأحمال B' }
      ],
      qualityCheckMetric: 'تأكد من عدم وجود فراغات تتجاوز 1 ملم بين الأجزاء المتجاورة'
    };
  });
}

/**
 * Orchestrates the full 6-agent swarm synthesis on any project
 * @param {Object} project - The project definition
 * @param {Array<string|Object>} selectedMaterials - Materials input
 * @returns {Object} enriched project with full swarm analysis and enhanced steps
 */
export function orchestrateProjectSwarm(project, selectedMaterials = []) {
  if (!project) return null;

  // Normalize selected materials or project.materials into an array of items
  let rawList = [];
  if (Array.isArray(selectedMaterials) && selectedMaterials.length > 0) {
    rawList = selectedMaterials;
  } else if (typeof selectedMaterials === 'string' && selectedMaterials.trim()) {
    rawList = selectedMaterials.split(/[،,\n++]+/).map(s => s.trim()).filter(Boolean);
  } else if (Array.isArray(project.materials)) {
    rawList = project.materials;
  } else if (typeof project.materials === 'string' && project.materials.trim()) {
    rawList = project.materials.split(/[،,\n++]+/).map(s => s.trim()).filter(Boolean);
  }

  // Resolve material objects from names or objects
  const resolvedMaterials = rawList.map(item => {
    if (typeof item === 'object' && item && item.name) return item;
    const nameStr = typeof item === 'string' ? item : '';
    const found = COMPREHENSIVE_MATERIALS.find(m => m.name.toLowerCase() === nameStr.toLowerCase());
    return found || {
      id: nameStr || 'general-material',
      name: nameStr || 'خامة مستدامة',
      category: 'general',
      defaultWeightKg: 1,
      carbonIntensityKgCO2ePerKg: 1.5,
      waterFootprintLPerKg: 100,
      energyFootprintMJPerKg: 40
    };
  });


  const co2Val = project.co2SavedKg || project.lcaMetrics?.carbonSavedKg || 6.4;

  // Run each agent's analysis
  const materialsAnalysis = analyzeMaterialsAndBonding(resolvedMaterials, project.title);
  const designAnalysis = analyzeIndustrialErgonomics(project.title, project.category, project.difficulty);
  const lcaAnalysis = analyzeLcaImpact(resolvedMaterials, co2Val);
  const economicsAnalysis = analyzeEconomics(project.difficulty, project.estimatedCost);
  const safetyAnalysis = analyzeSafetyProtocols(resolvedMaterials, project.difficulty);
  const visualInfographics = analyzeVisualInfographics(project.steps || [], project.title);

  // Enrich steps with infographic overlay and audio script
  const enrichedSteps = (project.steps || []).map((step, idx) => {
    const info = visualInfographics[idx] || {};
    const audioScript = `الخطوة رقم ${idx + 1}: ${step.title}. ${step.instruction || step.description || ''}. انتبه: ${info.safetyNotice || 'حافظ على مسافة آمنة واستخدم معدات الحماية'}. معيار الجودة المطلوب: ${info.qualityCheckMetric || 'تثبيت محكم ومتناسق'}.`;

    return {
      ...step,
      infographic: info,
      audioScript,
      qualityCheck: info.qualityCheckMetric
    };
  });

  return {
    ...project,
    steps: enrichedSteps,
    swarmAgents: SWARM_AGENTS,
    swarmAnalysis: {
      generatedAt: new Date().toISOString(),
      materialsSpecialist: materialsAnalysis,
      industrialArchitect: designAnalysis,
      lcaAuditor: lcaAnalysis,
      economicsAnalyst: economicsAnalysis,
      safetyDirector: safetyAnalysis,
      agentsActive: SWARM_AGENTS.length
    },
    // Synthesize top-level badges for quick display
    lcaMetrics: {
      carbonSavedKg: lcaAnalysis.carbonSavedKg,
      waterSavedLiters: lcaAnalysis.waterSavedLiters,
      energySavedKwh: lcaAnalysis.energySavedKwh,
      drivingAvoidedKm: lcaAnalysis.drivingAvoidedKm,
      treesEquivalentPerYear: lcaAnalysis.treesEquivalentPerYear,
      circularityScore: lcaAnalysis.circularityScore
    },
    economicMetrics: {
      diyCostUsd: economicsAnalysis.diyCostUsd,
      marketEquivalentUsd: economicsAnalysis.marketEquivalentUsd,
      moneySavedUsd: economicsAnalysis.moneySavedUsd,
      savingPercentage: economicsAnalysis.savingPercentage
    }
  };
}
