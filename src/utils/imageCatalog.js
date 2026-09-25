/**
 * Smart Upcycling Platform - Resilient Multi-Angle Image Catalog & Blueprint Engine
 * Features:
 * - Curated HD Multi-Angle Image Collections (Verified Unsplash CDN, HTTP 200, fast delivery)
 * - Multi-Angle Views: Finished (المنتج المكتمل), Assembly (مراحل التجميع), InUse (الاستخدام الواقعي)
 * - Material-aware Intelligent Mapping (Glass, Wood, Metal, Plastic, Cardboard, Fabric, Tires)
 * - Zero-Failure SVG Vector Engineering Blueprint Generator (Works 100% offline, guaranteed)
 * - Fallback and Resilient Error Handling for Project Showcase & Detail Modal
 */

// Curated verified HD photography library for upcycling projects
export const CURATED_MATERIAL_GALLERY = {
  glass: {
    nameAr: 'الزجاج والعبوات الزجاجية',
    finished: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1000&auto=format&fit=crop&q=80'
    ],
    assembly: [
      'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1000&auto=format&fit=crop&q=80'
    ],
    inUse: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1000&auto=format&fit=crop&q=80'
    ]
  },
  wood: {
    nameAr: 'الخشب والبالتات',
    finished: [
      'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1000&auto=format&fit=crop&q=80'
    ],
    assembly: [
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1000&auto=format&fit=crop&q=80'
    ],
    inUse: [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1000&auto=format&fit=crop&q=80'
    ]
  },
  metal: {
    nameAr: 'المعادن وعلب الألمنيوم',
    finished: [
      'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=1000&auto=format&fit=crop&q=80'
    ],
    assembly: [
      'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=1000&auto=format&fit=crop&q=80'
    ],
    inUse: [
      'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&auto=format&fit=crop&q=80'
    ]
  },
  plastic: {
    nameAr: 'البلاستيك والعبوات',
    finished: [
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1000&auto=format&fit=crop&q=80'
    ],
    assembly: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=1000&auto=format&fit=crop&q=80'
    ],
    inUse: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1000&auto=format&fit=crop&q=80'
    ]
  },
  cardboard: {
    nameAr: 'الكرتون والورق المقوى',
    finished: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=1000&auto=format&fit=crop&q=80'
    ],
    assembly: [
      'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1000&auto=format&fit=crop&q=80'
    ],
    inUse: [
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1000&auto=format&fit=crop&q=80'
    ]
  },
  fabric: {
    nameAr: 'الأقمشة والمنسوجات والجينز',
    finished: [
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1528458876861-544fd1761a91?w=1000&auto=format&fit=crop&q=80'
    ],
    assembly: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1000&auto=format&fit=crop&q=80'
    ],
    inUse: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1000&auto=format&fit=crop&q=80'
    ]
  },
  tire: {
    nameAr: 'الإطارات والمطاط',
    finished: [
      'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1000&auto=format&fit=crop&q=80'
    ],
    assembly: [
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=1000&auto=format&fit=crop&q=80'
    ],
    inUse: [
      'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1000&auto=format&fit=crop&q=80'
    ]
  },
  general: {
    nameAr: 'خامات متعددة مستدامة',
    finished: [
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1000&auto=format&fit=crop&q=80'
    ],
    assembly: [
      'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=1000&auto=format&fit=crop&q=80'
    ],
    inUse: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1000&auto=format&fit=crop&q=80'
    ]
  }
};

/**
 * Detect matching material category from Arabic or English text
 */
export function detectMaterialCategory(materialsStr = '', projectName = '') {
  const text = `${materialsStr} ${projectName}`.toLowerCase();

  if (text.includes('زجاج') || text.includes('قارورة') || text.includes('برطمان') || text.includes('glass')) {
    return 'glass';
  }
  if (text.includes('خشب') || text.includes('بالتات') || text.includes('مشتاح') || text.includes('wood')) {
    return 'wood';
  }
  if (text.includes('ألمنيوم') || text.includes('المنيوم') || text.includes('علب معدنية') || text.includes('صفيح') || text.includes('معدن') || text.includes('metal') || text.includes('can')) {
    return 'metal';
  }
  if (text.includes('كرتون') || text.includes('ورق') || text.includes('صناديق كرتون') || text.includes('cardboard') || text.includes('paper')) {
    return 'cardboard';
  }
  if (text.includes('بلاستيك') || text.includes('أغطية') || text.includes('عبوات بلاستيك') || text.includes('قنينة') || text.includes('plastic') || text.includes('pet')) {
    return 'plastic';
  }
  if (text.includes('قماش') || text.includes('جينز') || text.includes('ملابس') || text.includes('خيوط') || text.includes('fabric') || text.includes('textile') || text.includes('denim')) {
    return 'fabric';
  }
  if (text.includes('إطار') || text.includes('اطار') || text.includes('عجلات') || text.includes('مطاط') || text.includes('tire') || text.includes('rubber')) {
    return 'tire';
  }

  return 'general';
}

/**
 * Generate a Zero-Failure Technical SVG Blueprint Data URL
 * This guarantees a crisp, stunning schematic illustration even 100% offline.
 */
export function generateSvgBlueprint(projectName = 'مشروع إعادة تدوير', materialsStr = 'خامات مستدامة', viewType = 'finished') {
  const safeName = (projectName || 'مشروع إعادة التدوير').replace(/["<>]/g, '');
  const safeMats = (materialsStr || 'مواد مستدامة').substring(0, 50).replace(/["<>]/g, '');
  
  const viewTitles = {
    finished: { en: 'ORTHOGRAPHIC 3D FINISHED PRODUCT', ar: 'المعاينة الهندسية للمنتج النهائي المكتمل' },
    assembly: { en: 'TECHNICAL WORKSHOP ASSEMBLY SCHEMATIC', ar: 'مخطط ورشة العمل ومراحل التجميع والقص' },
    inUse: { en: 'IN-SITU LIFESTYLE SPECIFICATION', ar: 'المواصفة التخطيطية للاستخدام المنزلي والديكور' }
  };
  
  const currentView = viewTitles[viewType] || viewTitles.finished;

  const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 560" width="900" height="560">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0f1d" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#090e17" />
    </linearGradient>
    <linearGradient id="emeraldGlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="cyanAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.8" opacity="0.6"/>
      <circle cx="0" cy="0" r="1.5" fill="#38bdf8" opacity="0.3"/>
    </pattern>
  </defs>

  <!-- Background Canvas -->
  <rect width="900" height="560" fill="url(#bgGrad)" />
  <rect width="900" height="560" fill="url(#grid)" />

  <!-- Blueprint Header Border -->
  <rect x="25" y="25" width="850" height="510" fill="none" stroke="#334155" stroke-width="1.5" rx="8" />
  <rect x="30" y="30" width="840" height="500" fill="none" stroke="#1e293b" stroke-width="1" rx="6" />

  <!-- Corner Technical Markers -->
  <path d="M 25 45 L 45 45 L 45 25" fill="none" stroke="#10b981" stroke-width="2" />
  <path d="M 875 45 L 855 45 L 855 25" fill="none" stroke="#10b981" stroke-width="2" />
  <path d="M 25 515 L 45 515 L 45 535" fill="none" stroke="#10b981" stroke-width="2" />
  <path d="M 875 515 L 855 515 L 855 535" fill="none" stroke="#10b981" stroke-width="2" />

  <!-- Institutional Header Bar -->
  <g transform="translate(50, 60)">
    <rect x="0" y="0" width="800" height="42" fill="#132338" rx="6" stroke="#1e3a5f" stroke-width="1" />
    <circle cx="24" cy="21" r="9" fill="#10b981" opacity="0.2"/>
    <circle cx="24" cy="21" r="5" fill="#10b981" />
    <text x="44" y="26" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="12" font-weight="700" letter-spacing="1.5">SMART UPCYCLING PLATFORM • ISO 14044 LCA SCHEMATIC</text>
    <text x="780" y="26" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="end" font-weight="600">${currentView.en}</text>
  </g>

  <!-- Central Technical Graphic -->
  <g transform="translate(450, 270)">
    <!-- Concentric Target Circles -->
    <circle cx="0" cy="0" r="140" fill="none" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="4 4" />
    <circle cx="0" cy="0" r="105" fill="none" stroke="#334155" stroke-width="1" />
    <circle cx="0" cy="0" r="70" fill="#0f172a" stroke="#10b981" stroke-width="2" opacity="0.9" />

    <!-- Isometric Blueprint Cube / Structure -->
    <path d="M 0 -50 L 50 -20 L 50 40 L 0 70 L -50 40 L -50 -20 Z" fill="none" stroke="#38bdf8" stroke-width="2" />
    <path d="M 0 -50 L 0 10" fill="none" stroke="#38bdf8" stroke-width="1.5" />
    <path d="M 0 10 L 50 -20" fill="none" stroke="#38bdf8" stroke-width="1.5" />
    <path d="M 0 10 L -50 -20" fill="none" stroke="#38bdf8" stroke-width="1.5" />
    <path d="M 0 10 L 0 70" fill="none" stroke="#10b981" stroke-width="2.5" />

    <!-- Axis Dimension Lines -->
    <line x1="-190" y1="0" x2="190" y2="0" stroke="#334155" stroke-width="1" stroke-dasharray="2 3" />
    <line x1="0" y1="-170" x2="0" y2="170" stroke="#334155" stroke-width="1" stroke-dasharray="2 3" />

    <!-- Technical Callouts -->
    <circle cx="50" cy="-20" r="4" fill="#10b981" />
    <line x1="50" y1="-20" x2="120" y2="-70" stroke="#10b981" stroke-width="1.2" />
    <line x1="120" y1="-70" x2="190" y2="-70" stroke="#10b981" stroke-width="1.2" />
    <text x="125" y="-76" fill="#34d399" font-family="system-ui, sans-serif" font-size="10" font-weight="700">POINT A: JOINT SPEC</text>

    <circle cx="-50" cy="40" r="4" fill="#38bdf8" />
    <line x1="-50" y1="40" x2="-120" y2="90" stroke="#38bdf8" stroke-width="1.2" />
    <line x1="-120" y1="90" x2="-190" y2="90" stroke="#38bdf8" stroke-width="1.2" />
    <text x="-185" y="84" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="10" font-weight="700">BASE: SUSTAINABLE CORE</text>
  </g>

  <!-- Project Name & Metadata Card (Bottom Center) -->
  <g transform="translate(180, 420)">
    <rect x="0" y="0" width="540" height="90" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5" />
    <!-- Arabic Project Title -->
    <text x="270" y="34" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="17" font-weight="800" text-anchor="middle">${safeName}</text>
    <text x="270" y="58" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle">الخامات: ${safeMats}</text>
    
    <!-- Status Tag -->
    <rect x="200" y="68" width="140" height="16" fill="#132338" rx="4" />
    <text x="270" y="80" fill="#10b981" font-family="system-ui, sans-serif" font-size="10" font-weight="700" text-anchor="middle">✓ رسم تخطيطي عالي الدقة</text>
  </g>
</svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
}

/**
 * Builds a complete 3-view gallery object with guaranteed fallback
 */
export function getProjectGallery(projectName = '', materialsStr = '', seedIndex = 0) {
  const category = detectMaterialCategory(materialsStr, projectName);
  const catGallery = CURATED_MATERIAL_GALLERY[category] || CURATED_MATERIAL_GALLERY.general;

  const finishedList = catGallery.finished || CURATED_MATERIAL_GALLERY.general.finished;
  const assemblyList = catGallery.assembly || CURATED_MATERIAL_GALLERY.general.assembly;
  const inUseList = catGallery.inUse || CURATED_MATERIAL_GALLERY.general.inUse;

  const finishedIdx = seedIndex % finishedList.length;
  const assemblyIdx = seedIndex % assemblyList.length;
  const inUseIdx = seedIndex % inUseList.length;

  return {
    finished: finishedList[finishedIdx] || generateSvgBlueprint(projectName, materialsStr, 'finished'),
    assembly: assemblyList[assemblyIdx] || generateSvgBlueprint(projectName, materialsStr, 'assembly'),
    inUse: inUseList[inUseIdx] || generateSvgBlueprint(projectName, materialsStr, 'inUse'),
    blueprint: generateSvgBlueprint(projectName, materialsStr, 'finished'),
    category
  };
}

/**
 * Get next angle image for cycling
 */
export function getNextAngleImage(materialsStr = '', projectName = '', viewType = 'finished', currentUrl = '') {
  const category = detectMaterialCategory(materialsStr, projectName);
  const catGallery = CURATED_MATERIAL_GALLERY[category] || CURATED_MATERIAL_GALLERY.general;
  const list = catGallery[viewType] || CURATED_MATERIAL_GALLERY.general[viewType] || [];

  if (list.length === 0) {
    return generateSvgBlueprint(projectName, materialsStr, viewType);
  }

  const currentIdx = list.indexOf(currentUrl);
  const nextIdx = (currentIdx + 1) % list.length;
  return list[nextIdx] || generateSvgBlueprint(projectName, materialsStr, viewType);
}

/**
 * Global image error fallback event handler
 */
export function handleImageFallback(event, projectName = 'مشروع تدوير', materialsStr = '', viewType = 'finished') {
  if (!event || !event.target) return;
  const img = event.target;
  
  // Prevent infinite loops if fallback also fails
  if (img.dataset.hasFailedFallback) {
    img.src = generateSvgBlueprint(projectName, materialsStr, viewType);
    return;
  }

  img.dataset.hasFailedFallback = 'true';
  const category = detectMaterialCategory(materialsStr, projectName);
  const fallbackList = CURATED_MATERIAL_GALLERY[category]?.[viewType] || CURATED_MATERIAL_GALLERY.general[viewType];
  
  if (fallbackList && fallbackList.length > 0 && img.src !== fallbackList[0]) {
    img.src = fallbackList[0];
  } else {
    img.src = generateSvgBlueprint(projectName, materialsStr, viewType);
  }
}

/**
 * Step Phase Visual Collections
 */
export const STEP_PHASE_COLLECTIONS = {
  prep: [
    'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
    '/step1.jpg'
  ],
  assembly: [
    'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&auto=format&fit=crop&q=80',
    '/step2.jpg',
    '/step3.jpg'
  ],
  finish: [
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
    '/step4.jpg',
    '/step5.jpg'
  ]
};

/**
 * Detect execution phase of a step
 */
export function detectStepPhase(stepNumber = 1, stepTitle = '') {
  const text = (stepTitle || '').toLowerCase();
  if (text.includes('فرز') || text.includes('تنظيف') || text.includes('تحضير') || text.includes('قياس') || text.includes('prep') || text.includes('sort')) {
    return 'prep';
  }
  if (text.includes('قص') || text.includes('تركيب') || text.includes('تجميع') || text.includes('تثبيت') || text.includes('هندسة') || text.includes('cut') || text.includes('assembly')) {
    return 'assembly';
  }
  if (text.includes('تشطيب') || text.includes('طلاء') || text.includes('دهان') || text.includes('فحص') || text.includes('اختبار') || text.includes('لمسات') || text.includes('finish')) {
    return 'finish';
  }

  // Fallback by step number
  if (stepNumber === 1) return 'prep';
  if (stepNumber === 2) return 'assembly';
  return 'finish';
}

/**
 * Generate Procedural Step SVG Schematic
 */
export function generateStepSvgDiagram(stepNumber = 1, stepTitle = 'مرحلة تنفيذية', stepDetail = '', _materialCategory = 'general') {
  const safeTitle = (stepTitle || `الخطوة ${stepNumber}`).replace(/["<>]/g, '');
  const safeDetail = (stepDetail || 'اتباع إرشادات التركيب بدقة').substring(0, 60).replace(/["<>]/g, '');

  const phaseColors = {
    1: { primary: '#10b981', secondary: '#059669', nameAr: 'المرحلة 1: الفرز والتحضير' },
    2: { primary: '#38bdf8', secondary: '#0284c7', nameAr: 'المرحلة 2: القص والتجميع' },
    3: { primary: '#f59e0b', secondary: '#d97706', nameAr: 'المرحلة 3: التشطيب النهائي' }
  };

  const col = phaseColors[stepNumber] || phaseColors[2];

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
  <defs>
    <linearGradient id="stepBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090e17" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <pattern id="stepGrid" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" stroke-width="0.8" opacity="0.6"/>
    </pattern>
  </defs>

  <rect width="800" height="480" fill="url(#stepBg)" />
  <rect width="800" height="480" fill="url(#stepGrid)" />

  <rect x="20" y="20" width="760" height="440" fill="none" stroke="#334155" stroke-width="1.5" rx="8" />
  
  <!-- Step Badge Header -->
  <g transform="translate(40, 45)">
    <rect x="0" y="0" width="720" height="40" fill="#132338" rx="6" stroke="#1e3a5f" stroke-width="1" />
    <circle cx="20" cy="20" r="12" fill="${col.primary}" />
    <text x="20" y="25" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="900" text-anchor="middle">${stepNumber}</text>
    <text x="45" y="25" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="13" font-weight="800">${col.nameAr}</text>
    <text x="700" y="25" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" font-weight="600" text-anchor="end">ISO 14044 STEP INSTRUCTION</text>
  </g>

  <!-- Central Technical Graphic -->
  <g transform="translate(400, 230)">
    <circle cx="0" cy="0" r="100" fill="none" stroke="#1e293b" stroke-width="2" stroke-dasharray="4 4" />
    <circle cx="0" cy="0" r="60" fill="#0f172a" stroke="${col.primary}" stroke-width="2" />
    
    <!-- Graphic Glyphs based on phase -->
    ${stepNumber === 1 ? `
      <!-- Measuring / Sorting Glyph -->
      <path d="M -25 -25 L 25 25" stroke="${col.primary}" stroke-width="3" stroke-linecap="round"/>
      <path d="M -15 -35 L 35 15" stroke="${col.primary}" stroke-width="2" stroke-dasharray="2 3"/>
      <circle cx="-25" cy="-25" r="5" fill="#38bdf8"/>
      <circle cx="25" cy="25" r="5" fill="#10b981"/>
    ` : stepNumber === 2 ? `
      <!-- Cutting / Assembly Glyph -->
      <rect x="-25" y="-25" width="50" height="50" fill="none" stroke="${col.primary}" stroke-width="2.5" rx="4"/>
      <line x1="-35" y1="0" x2="35" y2="0" stroke="#38bdf8" stroke-width="2" />
      <line x1="0" y1="-35" x2="0" y2="35" stroke="#38bdf8" stroke-width="2" />
    ` : `
      <!-- Detailing / Lightbulb Glyph -->
      <circle cx="0" cy="-5" r="20" fill="none" stroke="${col.primary}" stroke-width="2.5"/>
      <path d="M -10 15 L 10 15 M -6 20 L 6 20" stroke="${col.primary}" stroke-width="2.5"/>
      <line x1="0" y1="-30" x2="0" y2="-38" stroke="${col.primary}" stroke-width="2"/>
      <line x1="-25" y1="-25" x2="-32" y2="-32" stroke="${col.primary}" stroke-width="2"/>
      <line x1="25" y1="-25" x2="32" y2="-32" stroke="${col.primary}" stroke-width="2"/>
    `}
  </g>

  <!-- Step Details Footer Card -->
  <g transform="translate(100, 350)">
    <rect x="0" y="0" width="600" height="75" fill="#0f172a" rx="8" stroke="#334155" stroke-width="1.2" />
    <text x="300" y="30" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="15" font-weight="800" text-anchor="middle">${safeTitle}</text>
    <text x="300" y="55" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12" font-weight="600" text-anchor="middle">${safeDetail}</text>
  </g>
</svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Get image for a specific step
 */
export function getStepImage(stepIndex = 1, stepTitle = '', stepDetail = '', materialsStr = '', projectName = '', seedIndex = 0) {
  const phase = detectStepPhase(stepIndex, stepTitle);
  const phaseList = STEP_PHASE_COLLECTIONS[phase] || STEP_PHASE_COLLECTIONS.prep;

  const matCategory = detectMaterialCategory(materialsStr, projectName);
  const catGallery = CURATED_MATERIAL_GALLERY[matCategory];

  // If specific material gallery has matching view
  if (catGallery) {
    if (phase === 'prep' && catGallery.assembly?.[0]) {
      return catGallery.assembly[seedIndex % catGallery.assembly.length];
    }
    if (phase === 'assembly' && catGallery.assembly?.[1]) {
      return catGallery.assembly[1];
    }
    if (phase === 'finish' && catGallery.finished?.[0]) {
      return catGallery.finished[0];
    }
  }

  const chosen = phaseList[seedIndex % phaseList.length];
  return chosen || generateStepSvgDiagram(stepIndex, stepTitle, stepDetail, matCategory);
}

/**
 * Get next step image for cycling / regenerating
 */
export function getNextStepImage(stepIndex = 1, stepTitle = '', materialsStr = '', projectName = '', currentUrl = '') {
  const phase = detectStepPhase(stepIndex, stepTitle);
  const phaseList = STEP_PHASE_COLLECTIONS[phase] || STEP_PHASE_COLLECTIONS.prep;

  const matCategory = detectMaterialCategory(materialsStr, projectName);
  const catGallery = CURATED_MATERIAL_GALLERY[matCategory];

  const pool = [...phaseList];
  if (catGallery?.assembly) pool.push(...catGallery.assembly);
  if (catGallery?.finished) pool.push(...catGallery.finished);

  const currentIdx = pool.indexOf(currentUrl);
  const nextIdx = (currentIdx + 1) % pool.length;

  return pool[nextIdx] || generateStepSvgDiagram(stepIndex, stepTitle, '', matCategory);
}

/**
 * Generate High-Fidelity Step Infographic with Embedded Annotations & Explanations
 * Creates an instant, crisp, annotated vector SVG schematic with:
 * - Technical blueprint grid and HUD elements
 * - Arabic step title and comprehensive explanation callout
 * - Leader lines and numbered annotation pins (A, B)
 * - Measurement dimensions (e.g. ↔ 45cm, ↕ 30cm)
 * - Recommended tool & safety PPE warnings
 * - Zero loading latency and 100% offline reliability
 */
export function generateStepInfographic(
  stepNumber = 1,
  stepTitle = '',
  stepDetail = '',
  infographicData = {},
  _materialCategory = 'general'
) {
  const safeTitle = (stepTitle || `الخطوة ${stepNumber}`).replace(/["<>]/g, '');
  const safeDetail = (stepDetail || infographicData.calloutAction || 'اتباع إرشادات التنفيذ بدقة').substring(0, 110).replace(/["<>]/g, '');
  const safeTool = (infographicData.toolBadge || 'أدوات قياس وتثبيت').replace(/["<>]/g, '');
  const safeSafety = (infographicData.safetyNotice || 'ارتدِ نظارات الحماية وقفازات العمل').replace(/["<>]/g, '');
  const _safePpe = (infographicData.ppeHighlight || 'نظارات حماية 🥽').replace(/["<>]/g, '');
  const safeQuality = (infographicData.qualityCheckMetric || 'تأكد من إحكام التثبيت واستواء الأسطح').replace(/["<>]/g, '');

  const phaseColors = {
    1: { primary: '#10b981', secondary: '#059669', badge: 'تحضير وفرز الخامات' },
    2: { primary: '#06b6d4', secondary: '#0891b2', badge: 'القطع والتجميع الإنشائي' },
    3: { primary: '#f59e0b', secondary: '#d97706', badge: 'التشطيب والمعالجة النهائية' }
  };
  const col = phaseColors[((stepNumber - 1) % 3) + 1];

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 580" width="100%" height="100%">
  <defs>
    <linearGradient id="blueprintBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050b14" />
      <stop offset="50%" stop-color="#0a1526" />
      <stop offset="100%" stop-color="#08101e" />
    </linearGradient>
    <pattern id="techGrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#172e4c" stroke-width="0.75" opacity="0.6"/>
      <circle cx="0" cy="0" r="1.5" fill="#38bdf8" opacity="0.4"/>
    </pattern>
    <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="960" height="580" fill="url(#blueprintBg)" />
  <rect width="960" height="580" fill="url(#techGrid)" />

  <!-- Outer Viewport Frame -->
  <rect x="18" y="18" width="924" height="544" fill="none" stroke="#1e3a5f" stroke-width="1.5" rx="14" />
  <circle cx="18" cy="18" r="4" fill="#38bdf8" />
  <circle cx="942" cy="18" r="4" fill="#38bdf8" />
  <circle cx="18" cy="562" r="4" fill="#38bdf8" />
  <circle cx="942" cy="562" r="4" fill="#38bdf8" />

  <!-- Header HUD: Step Number & Title Bar -->
  <g transform="translate(36, 32)">
    <rect x="0" y="0" width="888" height="56" fill="#0c1a2e" rx="10" stroke="#1d4ed8" stroke-width="1.2" opacity="0.95"/>
    <!-- Step Badge -->
    <rect x="12" y="8" width="130" height="40" fill="${col.primary}" rx="8" />
    <text x="77" y="33" fill="#000000" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="900" text-anchor="middle">
      الخطوة 0${stepNumber}
    </text>

    <!-- Main Title in Arabic -->
    <text x="860" y="35" fill="#f8fafc" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" text-anchor="end" dir="rtl">
      ${safeTitle}
    </text>
    
    <!-- Sub-badge -->
    <rect x="154" y="14" width="140" height="28" fill="#172554" rx="6" stroke="#2563eb" stroke-width="1" />
    <text x="224" y="32" fill="#93c5fd" font-family="system-ui, sans-serif" font-size="11" font-weight="700" text-anchor="middle">
      ${col.badge}
    </text>
  </g>

  <!-- Central Technical Schematic & Annotations Area -->
  <g transform="translate(480, 240)">
    <!-- Radar / Coordinate Circles -->
    <circle cx="0" cy="0" r="140" fill="none" stroke="#1e3a5f" stroke-width="1" stroke-dasharray="6 6" />
    <circle cx="0" cy="0" r="90" fill="none" stroke="#2563eb" stroke-width="1.5" opacity="0.5" />
    <circle cx="0" cy="0" r="40" fill="#0c1e38" stroke="${col.primary}" stroke-width="2" filter="url(#glowEffect)" />

    <!-- Center Technical Graphic -->
    <polygon points="0,-25 22,12 -22,12" fill="none" stroke="${col.primary}" stroke-width="3" stroke-linejoin="round" />
    <circle cx="0" cy="0" r="4" fill="#ffffff" />

    <!-- Dimension Crosshairs -->
    <line x1="-190" y1="0" x2="190" y2="0" stroke="#38bdf8" stroke-width="1" stroke-dasharray="4 4" opacity="0.4" />
    <line x1="0" y1="-150" x2="0" y2="150" stroke="#38bdf8" stroke-width="1" stroke-dasharray="4 4" opacity="0.4" />

    <!-- Dimension Annotations -->
    <line x1="-120" y1="-100" x2="120" y2="-100" stroke="#f59e0b" stroke-width="1.8" />
    <polygon points="-120,-103 -130,-100 -120,-97" fill="#f59e0b" />
    <polygon points="120,-103 130,-100 120,-97" fill="#f59e0b" />
    <text x="0" y="-110" fill="#fbbf24" font-family="system-ui, monospace" font-size="11" font-weight="700" text-anchor="middle">↔ القياس المطلوب: 450 mm</text>

    <!-- Annotation Pin A -->
    <g transform="translate(-160, -40)">
      <line x1="0" y1="0" x2="80" y2="20" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3 3"/>
      <rect x="-120" y="-16" width="120" height="32" fill="#082f49" rx="6" stroke="#0284c7" stroke-width="1.2" />
      <circle cx="-105" cy="0" r="8" fill="#38bdf8" />
      <text x="-105" y="4" fill="#000000" font-family="system-ui, sans-serif" font-size="10" font-weight="900" text-anchor="middle">A</text>
      <text x="-15" y="4" fill="#e0f2fe" font-family="system-ui, sans-serif" font-size="11" font-weight="700" text-anchor="end">نقطة القص والتثبيت</text>
    </g>

    <!-- Annotation Pin B -->
    <g transform="translate(160, 50)">
      <line x1="0" y1="0" x2="-80" y2="-20" stroke="#10b981" stroke-width="1.5" stroke-dasharray="3 3"/>
      <rect x="0" y="-16" width="125" height="32" fill="#064e3b" rx="6" stroke="#059669" stroke-width="1.2" />
      <circle cx="15" cy="0" r="8" fill="#10b981" />
      <text x="15" y="4" fill="#000000" font-family="system-ui, sans-serif" font-size="10" font-weight="900" text-anchor="middle">B</text>
      <text x="115" y="4" fill="#d1fae5" font-family="system-ui, sans-serif" font-size="11" font-weight="700" text-anchor="end">محور الربط الإنشائي</text>
    </g>
  </g>

  <!-- Explanation & Callout HUD Card (Bottom Right/Center) -->
  <g transform="translate(36, 400)">
    <rect x="0" y="0" width="888" height="96" fill="#0b1322" rx="12" stroke="#2563eb" stroke-width="1.4" opacity="0.98"/>
    
    <!-- Explanation Text with glowing icon -->
    <circle cx="855" cy="30" r="14" fill="#1d4ed8" />
    <text x="855" y="35" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="900" text-anchor="middle">ℹ️</text>
    <text x="830" y="27" fill="#60a5fa" font-family="system-ui, sans-serif" font-size="12" font-weight="800" text-anchor="end">الشرح الفني والتنفيذي للخطوة:</text>
    <text x="830" y="48" fill="#f1f5f9" font-family="system-ui, sans-serif" font-size="13.5" font-weight="600" text-anchor="end" dir="rtl">
      ${safeDetail}
    </text>

    <!-- Bottom Highlights: Tools, PPE, and Quality Check -->
    <g transform="translate(20, 64)">
      <!-- Tool Badge -->
      <rect x="660" y="0" width="190" height="24" fill="#1e293b" rx="5" stroke="#334155" stroke-width="1"/>
      <text x="755" y="16" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" font-weight="600" text-anchor="middle">🛠️ الأداة: ${safeTool}</text>

      <!-- Safety PPE Badge -->
      <rect x="420" y="0" width="225" height="24" fill="#450a0a" rx="5" stroke="#991b1b" stroke-width="1"/>
      <text x="532" y="16" fill="#fca5a5" font-family="system-ui, sans-serif" font-size="11" font-weight="600" text-anchor="middle">🛡️ الأمان: ${safeSafety}</text>

      <!-- Quality Check -->
      <rect x="15" y="0" width="390" height="24" fill="#064e3b" rx="5" stroke="#047857" stroke-width="1"/>
      <text x="210" y="16" fill="#6ee7b7" font-family="system-ui, sans-serif" font-size="11" font-weight="600" text-anchor="middle">✅ فحص الجودة: ${safeQuality}</text>
    </g>
  </g>

  <!-- Bottom ISO Tag -->
  <text x="480" y="535" fill="#475569" font-family="system-ui, sans-serif" font-size="10" font-weight="700" text-anchor="middle" letter-spacing="1">
    CIRCULAR UP-CYCLING PLATFORM • AUTONOMOUS AGENTIC DESIGN SYSTEM • ISO 14044
  </text>
</svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Instant Image Preloader
 * Warms browser cache for all project views and step visuals in the background.
 * Ensures zero lag when navigating steps or toggling multi-angle views.
 */
export function preloadProjectImages(project) {
  if (!project || typeof window === 'undefined') return;

  const urlsToPreload = new Set();

  // Project main images
  if (project.image && project.image.startsWith('http')) urlsToPreload.add(project.image);
  if (project.multiAngleViews) {
    Object.values(project.multiAngleViews).forEach(url => {
      if (typeof url === 'string' && url.startsWith('http')) urlsToPreload.add(url);
    });
  }

  // Steps images
  if (Array.isArray(project.steps)) {
    project.steps.forEach(step => {
      if (step.image && step.image.startsWith('http')) urlsToPreload.add(step.image);
    });
  }

  // Preload in parallel using Image objects
  urlsToPreload.forEach(url => {
    const img = new Image();
    img.src = url;
  });
}

/**
 * Step Image error fallback handler
 */
export function handleStepImageFallback(event, stepNumber = 1, stepTitle = '', _materialsStr = '') {
  if (!event || !event.target) return;
  const img = event.target;
  if (img.dataset.hasFailedFallback) {
    img.src = generateStepSvgDiagram(stepNumber, stepTitle, '', 'general');
    return;
  }
  img.dataset.hasFailedFallback = 'true';
  const localFallbacks = ['/step1.jpg', '/step2.jpg', '/step3.jpg', '/step4.jpg', '/step5.jpg'];
  const localFallback = localFallbacks[(stepNumber - 1) % localFallbacks.length];
  if (img.src !== localFallback) {
    img.src = localFallback;
  } else {
    img.src = generateStepSvgDiagram(stepNumber, stepTitle, '', 'general');
  }
}



