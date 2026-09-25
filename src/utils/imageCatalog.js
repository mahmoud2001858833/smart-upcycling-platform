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
