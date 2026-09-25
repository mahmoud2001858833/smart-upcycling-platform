/**
 * Smart Upcycling Platform - Comprehensive Materials Library (60+ items)
 * Categorized, searchable, with bonding compatibility matrix & eco factors
 */

export const MATERIAL_CATEGORIES = [
  { id: 'all', label: 'كافة الخامات', icon: 'Sparkles', color: '#10b981' },
  { id: 'plastic', label: 'البلاستيك والعبوات', icon: 'Milk', color: '#0ea5e9' },
  { id: 'wood', label: 'الأخشاب والبالتات', icon: 'TreePine', color: '#b45309' },
  { id: 'metal', label: 'المعادن والألمنيوم', icon: 'Wrench', color: '#64748b' },
  { id: 'paper', label: 'الكرتون والورق', icon: 'Box', color: '#d97706' },
  { id: 'textile', label: 'الأقمشة والمنسوجات', icon: 'Scissors', color: '#8b5cf6' },
  { id: 'glass', label: 'الزجاج والمطاط', icon: 'Wine', color: '#14b8a6' },
  { id: 'electronic', label: 'الخردة الإلكترونية', icon: 'Cpu', color: '#ec4899' },
  { id: 'organic', label: 'المخلفات الطبيعية', icon: 'Leaf', color: '#84cc16' }
];

export const MATERIAL_CATEGORY_THUMBNAILS = {
  plastic: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&auto=format&fit=crop&q=80',
  wood: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=400&auto=format&fit=crop&q=80',
  metal: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&auto=format&fit=crop&q=80',
  paper: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&auto=format&fit=crop&q=80',
  textile: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=400&auto=format&fit=crop&q=80',
  glass: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&auto=format&fit=crop&q=80',
  electronic: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80',
  organic: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80',
  general: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=400&auto=format&fit=crop&q=80'
};

const SPECIFIC_MATERIAL_THUMBNAILS = {
  'mat-p1': 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&auto=format&fit=crop&q=80',
  'mat-p2': 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=400&auto=format&fit=crop&q=80',
  'mat-p3': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80',
  'mat-p4': 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=400&auto=format&fit=crop&q=80',
  'mat-p5': 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?w=400&auto=format&fit=crop&q=80',
  'mat-w1': 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=400&auto=format&fit=crop&q=80',
  'mat-w2': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&auto=format&fit=crop&q=80',
  'mat-w3': 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&auto=format&fit=crop&q=80',
  'mat-m1': 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&auto=format&fit=crop&q=80',
  'mat-m2': 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&auto=format&fit=crop&q=80',
  'mat-m3': 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=400&auto=format&fit=crop&q=80',
  'mat-pa1': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&auto=format&fit=crop&q=80',
  'mat-pa2': 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&auto=format&fit=crop&q=80',
  'mat-t1': 'https://images.unsplash.com/photo-1542272604-780c96856592?w=400&auto=format&fit=crop&q=80',
  'mat-t2': 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&auto=format&fit=crop&q=80',
  'mat-g1': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&auto=format&fit=crop&q=80',
  'mat-g2': 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&auto=format&fit=crop&q=80',
  'mat-g3': 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=400&auto=format&fit=crop&q=80',
  'mat-e1': 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=400&auto=format&fit=crop&q=80',
  'mat-e2': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop&q=80',
  'mat-e3': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80',
  'mat-o1': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80',
  'mat-o2': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80'
};

export function getMaterialThumbnail(material) {
  if (!material) return MATERIAL_CATEGORY_THUMBNAILS.general;
  if (material.thumbnail) return material.thumbnail;
  if (SPECIFIC_MATERIAL_THUMBNAILS[material.id]) return SPECIFIC_MATERIAL_THUMBNAILS[material.id];
  return MATERIAL_CATEGORY_THUMBNAILS[material.category] || MATERIAL_CATEGORY_THUMBNAILS.general;
}

export const COMPREHENSIVE_MATERIALS = [

  // 1. Plastic (البلاستيك)
  {
    id: 'mat-p1',
    name: 'زجاجات ماء وعصير بلاستيكية (PET)',
    category: 'plastic',
    difficulty: 'سهل',
    ecoFactor: 1.8,
    tags: ['قارورة', 'قنينة', 'بلاستيك', 'شفاف', 'pet', 'ماء', 'مشروبات'],
    commonUses: 'أحواض زراعة ذاتية، أباجورات إضاءة، مشغولات ديكورية'
  },
  {
    id: 'mat-p2',
    name: 'أغطية زجاجات ملونة (HDPE)',
    category: 'plastic',
    difficulty: 'سهل جداً',
    ecoFactor: 1.5,
    tags: ['غطاء', 'أغطية', 'سدادات', 'ملون', 'hdpe'],
    commonUses: 'لوحات فسيفساء جدارية، قواعد كؤوس عازلة، ألعاب أطفال'
  },
  {
    id: 'mat-p3',
    name: 'عبوات منظفات وشامبو سميكة',
    category: 'plastic',
    difficulty: 'متوسط',
    ecoFactor: 2.1,
    tags: ['شامبو', 'صابون', 'منظفات', 'بلاستيك مقوى'],
    commonUses: 'حوامل هواتف ومفاتيح جدارية، مجارف يدوية للبستنة'
  },
  {
    id: 'mat-p4',
    name: 'أكياس بلاستيكية وأكياس تسوق',
    category: 'plastic',
    difficulty: 'سهل',
    ecoFactor: 1.4,
    tags: ['كيس', 'أكياس', 'تسوق', 'نايلون'],
    commonUses: 'صناعة حبال مقاومة للمياه، خيوط حياكة بلاستيكية (Plarn)'
  },
  {
    id: 'mat-p5',
    name: 'أنابيب بلاستيكية سباكة (PVC)',
    category: 'plastic',
    difficulty: 'متوسط',
    ecoFactor: 2.8,
    tags: ['مواسير', 'أنابيب', 'سباكة', 'pvc', 'بلاستيك صلب'],
    commonUses: 'أنظمة زراعة مائية عمودية (هيدروبونيك)، منظمات أدوات'
  },
  {
    id: 'mat-p6',
    name: 'علب طعام وأوعية زبادي (PP)',
    category: 'plastic',
    difficulty: 'سهل',
    ecoFactor: 1.6,
    tags: ['زبادي', 'طعام', 'أوعية', 'pp'],
    commonUses: 'أحواض شتلات وتجذير بذور، منظمات أدراج مكتبية'
  },
  {
    id: 'mat-p7',
    name: 'صناديق بلاستيكية شبكية (سحاحير)',
    category: 'plastic',
    difficulty: 'سهل',
    ecoFactor: 3.2,
    tags: ['صندوق', 'سحارة', 'سحاحير', 'خضار'],
    commonUses: 'وحدات رفوف تخزين نموذجية، مقاعد خفيفة، أحواض بستنة'
  },
  {
    id: 'mat-p8',
    name: 'ألواح فلين أبيض للتغليف (EPS)',
    category: 'plastic',
    difficulty: 'سهل',
    ecoFactor: 2.4,
    tags: ['فلين', 'بولسترين', 'عازل', 'تغليف'],
    commonUses: 'ألواح عزل حراري وصوتي منزلية، قوالب ديكور بارزة'
  },

  // 2. Wood (الأخشاب)
  {
    id: 'mat-w1',
    name: 'بالتات خشبية لشحن البضائع',
    category: 'wood',
    difficulty: 'متوسط',
    ecoFactor: 4.5,
    tags: ['بالتة', 'بالتات', 'طبالي', 'خشب شحن', 'مشتاح'],
    commonUses: 'طاولات قهوة ريفية، كراسي حديقة، أحواض نباتات عمودية'
  },
  {
    id: 'mat-w2',
    name: 'صناديق فواكه خشبية خفيفة',
    category: 'wood',
    difficulty: 'سهل',
    ecoFactor: 2.2,
    tags: ['صندوق فواكه', 'خشب رقيق', 'سحارة خشب'],
    commonUses: 'رفوف جدارية ديكورية، منظمات توابل وبهارات'
  },
  {
    id: 'mat-w3',
    name: 'بقايا ألواح خشب رقائقي (Plywood/MDF)',
    category: 'wood',
    difficulty: 'متوسط',
    ecoFactor: 2.9,
    tags: ['بليوود', 'mdf', 'أبلكاش', 'خشب مضغوط'],
    commonUses: 'حوامل لابتوب مريحة، فواصل كتب هندسية، إطارات صور'
  },
  {
    id: 'mat-w4',
    name: 'نشارة ونفايات خشب ناعمة',
    category: 'wood',
    difficulty: 'سهل جداً',
    ecoFactor: 1.8,
    tags: ['نشارة', 'برادة خشب', 'غبار خشب'],
    commonUses: 'عجينة خشبية للترميم، كتل فحم نباتي مضغوط، فرشة زراعية'
  },
  {
    id: 'mat-w5',
    name: 'أرجل وأجزاء أثاث قديم مهمل',
    category: 'wood',
    difficulty: 'متوسط',
    ecoFactor: 3.8,
    tags: ['أثاث', 'كراسي قديمة', 'أرجل خشب', 'طاولات'],
    commonUses: 'شماعات معاطف جدارية كلاسيكية، قواعد مصابيح إنارة'
  },
  {
    id: 'mat-w6',
    name: 'أغصان وفروع أشجار مقلمة',
    category: 'wood',
    difficulty: 'سهل',
    ecoFactor: 1.9,
    tags: ['أغصان', 'فروع', 'شجر', 'طبيعي'],
    commonUses: 'ثريات إضاءة بوهيمية، علاقات مفاتيح ريفية، إطارات مرايا'
  },
  {
    id: 'mat-w7',
    name: 'سدادات فلين طبيعية لزجاجات',
    category: 'wood',
    difficulty: 'سهل جداً',
    ecoFactor: 1.3,
    tags: ['فلين طبيعي', 'سدادة', 'كورك'],
    commonUses: 'لوحات تعليق مذكرات، قواعد أواني ساخنة، مقابض أدراج'
  },

  // 3. Metal (المعادن والألمنيوم)
  {
    id: 'mat-m1',
    name: 'علب مشروبات غازية ألمنيوم',
    category: 'metal',
    difficulty: 'سهل',
    ecoFactor: 9.1,
    tags: ['كانز', 'علب صودا', 'ألمنيوم', 'مشروبات'],
    commonUses: 'فوانيس إضاءة مخرمة، مجسمات هندسية، صفائح عواكس حرارية'
  },
  {
    id: 'mat-m2',
    name: 'علب صفيح للمأكولات المعلبة (فول/حمص)',
    category: 'metal',
    difficulty: 'سهل',
    ecoFactor: 4.2,
    tags: ['علب صفيح', 'تونة', 'حليب مكثف', 'معادن صلبة'],
    commonUses: 'حوامل شموع ديكورية، منظمات قرطاسية ومسامير، أحواض صبار'
  },
  {
    id: 'mat-m3',
    name: 'شماعات ملابس سلكية معدنية',
    category: 'metal',
    difficulty: 'سهل',
    ecoFactor: 2.5,
    tags: ['شماعة سلك', 'علاقة معدن', 'سلك صلب'],
    commonUses: 'حوامل كتب ومجلات جدارية، هياكل أباجورات إضاءة هندسية'
  },
  {
    id: 'mat-m4',
    name: 'أسلاك وكابلات نحاسية معطلة',
    category: 'metal',
    difficulty: 'متوسط',
    ecoFactor: 7.8,
    tags: ['نحاس', 'أسلاك كهرباء', 'كابلات'],
    commonUses: 'حليات وأشجار بونساي معدنية، خطاطيف وحلقات تعليق'
  },
  {
    id: 'mat-m5',
    name: 'براغي وصواميل ومسامير قديمة',
    category: 'metal',
    difficulty: 'سهل',
    ecoFactor: 3.5,
    tags: ['براغي', 'صواميل', 'مسامير', 'خردة'],
    commonUses: 'مجسمات فنية ميكانيكية، مقابض أدراج، حوامل مغناطيسية'
  },
  {
    id: 'mat-m6',
    name: 'أغطية علب الصودا (حلقات السحب Pull-Tabs)',
    category: 'metal',
    difficulty: 'سهل',
    ecoFactor: 5.5,
    tags: ['حلقات سحب', 'ألمنيوم صغير', 'pull tabs'],
    commonUses: 'حلقات تعليق لوحات، سلاسل دروع تزيينية، أساور معدنية'
  },
  {
    id: 'mat-m7',
    name: 'قطع صاج وشظايا معادن خردة',
    category: 'metal',
    difficulty: 'متقدم',
    ecoFactor: 6.2,
    tags: ['صاج', 'حديد خردة', 'شيت ميتال'],
    commonUses: 'حواجز حماية للمواقد، لافتات إرشادية خارجية ريفية'
  },

  // 4. Paper & Cardboard (الكرتون والورق)
  {
    id: 'mat-c1',
    name: 'صناديق كرتون شحن وتغليف مقوى',
    category: 'paper',
    difficulty: 'سهل',
    ecoFactor: 1.2,
    tags: ['كرتون', 'صناديق كرتونية', 'علب كرتون'],
    commonUses: 'وحدات تنظيم مكتبية مقسمة، بيوت ألعاب للأطفال، أباجورات مطوية'
  },
  {
    id: 'mat-c2',
    name: 'أطباق وكراتين كرتون البيض',
    category: 'paper',
    difficulty: 'سهل جداً',
    ecoFactor: 0.9,
    tags: ['كرتون بيض', 'أطباق بيض', 'عازل'],
    commonUses: 'ألواح عزل صوتي للجدران، أحواض تشتيل بذور قابلة للتحلل'
  },
  {
    id: 'mat-c3',
    name: 'أنابيب ورقية ورولات مناديل كرتونية',
    category: 'paper',
    difficulty: 'سهل جداً',
    ecoFactor: 0.8,
    tags: ['رول مناديل', 'أنابيب كرتون', 'بكرات'],
    commonUses: 'منظمات كابلات وأسلاك شواحن، أبراج تنظيم أقلام'
  },
  {
    id: 'mat-c4',
    name: 'صحف ومجلات دورية قديمة',
    category: 'paper',
    difficulty: 'سهل',
    ecoFactor: 1.1,
    tags: ['جرائد', 'صحف', 'مجلات', 'ورق ملون'],
    commonUses: 'سلال وقش مطوي بتقنية لف الورق، خرز ورقي، ورق تغليف أنيق'
  },
  {
    id: 'mat-c5',
    name: 'أكياس ورق كرافت بنية (Kraft Bags)',
    category: 'paper',
    difficulty: 'سهل',
    ecoFactor: 1.3,
    tags: ['أكياس ورق', 'كرافت', 'ورق بني'],
    commonUses: 'أغلفة أواني نباتات عصرية، منظمات أغذية جافة، فواصل رفوف'
  },
  {
    id: 'mat-c6',
    name: 'أوراق طباعة مستعملة ومسودات مكتبية',
    category: 'paper',
    difficulty: 'سهل',
    ecoFactor: 1.0,
    tags: ['ورق مكتبي', 'a4', 'مسودات'],
    commonUses: 'إعادة تدوير وصناعة ورق يدوي معاد التدوير، مذكرات مجلدة'
  },

  // 5. Textile & Denim (الأقمشة والمنسوجات)
  {
    id: 'mat-t1',
    name: 'بناطيل جينز قديمة (Denim)',
    category: 'textile',
    difficulty: 'متوسط',
    ecoFactor: 4.8,
    tags: ['جينز', 'دنيم', 'سراويل جينز', 'قماش متين'],
    commonUses: 'حقائب تسوق متينة (Tote Bags)، وسائد مقاعد عصرية، مآزر ورش'
  },
  {
    id: 'mat-t2',
    name: 'تيشيرتات وملابس قطنية مستهلكة',
    category: 'textile',
    difficulty: 'سهل',
    ecoFactor: 3.6,
    tags: ['تيشيرت', 'قطن', 'ملابس قطنية'],
    commonUses: 'خيوط حياكة قطنية (T-Shirt Yarn)، سجاد حمام مجدول، خرق تنظيف'
  },
  {
    id: 'mat-t3',
    name: 'سترات وملابس صوفية قديمة',
    category: 'textile',
    difficulty: 'متوسط',
    ecoFactor: 5.2,
    tags: ['صوف', 'كنزات', 'سترات شتوية'],
    commonUses: 'قبعات وقفازات شتوية، كرات تجفيف صديقة للبيئة، أغطية أكواب'
  },
  {
    id: 'mat-t4',
    name: 'قصاصات وأقمشة ستائر ومفارش قديمة',
    category: 'textile',
    difficulty: 'سهل',
    ecoFactor: 2.7,
    tags: ['ستائر', 'مفارش', 'أقمشة ملونة'],
    commonUses: 'أغطية وسائد بوهيمية، أكياس حفظ الخبز القماشية'
  },
  {
    id: 'mat-t5',
    name: 'أكياس خيش جوت (Jute Sacks)',
    category: 'textile',
    difficulty: 'سهل',
    ecoFactor: 2.1,
    tags: ['خيش', 'جوت', 'قماش قنب'],
    commonUses: 'مفارش طاولات ريفية، أحواض تعليق شتلات، سلال تخزين خيشية'
  },
  {
    id: 'mat-t6',
    name: 'حبال وأشرطة نايلون وقطن',
    category: 'textile',
    difficulty: 'سهل',
    ecoFactor: 1.7,
    tags: ['حبال', 'أشرطة', 'خيوط سميكة'],
    commonUses: 'علاقات مكرمية للنباتات المعلقة، مقود حيوانات أليفة'
  },

  // 6. Glass & Rubber (الزجاج والمطاط)
  {
    id: 'mat-g1',
    name: 'برطمانات زجاجية (مربى، صلصة، مخلل)',
    category: 'glass',
    difficulty: 'سهل',
    ecoFactor: 2.5,
    tags: ['برطمان', 'مرطبان', 'صلصة', 'زجاج شفاف'],
    commonUses: 'موزعات صابون بمضخة، وحدات إضاءة معلقة، مزارع نمنمة (Terrarium)'
  },
  {
    id: 'mat-g2',
    name: 'زجاجات عصير ومشروبات زجاجية طويلة',
    category: 'glass',
    difficulty: 'متوسط',
    ecoFactor: 3.1,
    tags: ['زجاجة طويلة', 'قوارير زجاج', 'زجاج ملون'],
    commonUses: 'مزهريات زهور أنيقة، قواطع شموع، مشغولات زجاج مقصوص'
  },
  {
    id: 'mat-g3',
    name: 'إطارات سيارات ودراجات مستعملة',
    category: 'glass',
    difficulty: 'متوسط',
    ecoFactor: 8.5,
    tags: ['إطار', 'عجلات', 'كوشوك', 'كاوتشوك', 'مطاط'],
    commonUses: 'مقاعد وبوفات حبلية ريفية، مراجيح حدائق آمنة، أحواض شجر'
  },
  {
    id: 'mat-g4',
    name: 'خراطيم مياه ومطاط قديمة',
    category: 'glass',
    difficulty: 'سهل',
    ecoFactor: 2.3,
    tags: ['خرطوم', 'مطاط مرن', 'بربيش'],
    commonUses: 'سلال غسيل منسوجة متينة، أغطية حماية لحواف الأدوات الحادة'
  },
  {
    id: 'mat-g5',
    name: 'شظايا وقرميد وأواني فخار مكسورة',
    category: 'glass',
    difficulty: 'سهل',
    ecoFactor: 1.6,
    tags: ['فخار', 'سيراميك', 'بلاط مكسور'],
    commonUses: 'طبقات تصريف مياه لأحواض النباتات، لوحات موزاييك أرضية'
  },

  // 7. Electronic Scrap (الخردة الإلكترونية)
  {
    id: 'mat-e1',
    name: 'أسلاك وشواحن هواتف معطلة',
    category: 'electronic',
    difficulty: 'سهل',
    ecoFactor: 4.1,
    tags: ['شواحن', 'كابلات usb', 'أسلاك معطلة'],
    commonUses: 'روابط ميكانيكية مرنة، حوامل أدوات، مشغولات فنية تكنولوجية'
  },
  {
    id: 'mat-e2',
    name: 'أقراص CD و DVD قديمة غير مستخدمة',
    category: 'electronic',
    difficulty: 'سهل',
    ecoFactor: 2.8,
    tags: ['سيدي', 'dvd', 'أقراص ليزرية', 'عاكس'],
    commonUses: 'فسيفساء عاكسة للضوء، طاردات طيور للحدائق، ساعات حائطية'
  },
  {
    id: 'mat-e3',
    name: 'لوحات دوائر إلكترونية مهملة (PCB)',
    category: 'electronic',
    difficulty: 'متوسط',
    ecoFactor: 6.5,
    tags: ['مذربورد', 'لوحة إلكترونية', 'pcb', 'شرائح'],
    commonUses: 'ميداليات مفاتيح سايبربانك، قواعد فناجين تقنية، لوحات فنية'
  },
  {
    id: 'mat-e4',
    name: 'صناديق حواسب وهياكل أجهزة قديمة',
    category: 'electronic',
    difficulty: 'متوسط',
    ecoFactor: 5.4,
    tags: ['كيسة كمبيوتر', 'هيكل جهاز', 'معدن كمبيوتر'],
    commonUses: 'صناديق بريد خارجية، خزائن أدوات ورشة، أحواض زهور صناعية'
  },

  // 8. Natural & Kitchen (المخلفات الطبيعية)
  {
    id: 'mat-o1',
    name: 'تفل قهوة ومخلفات بن مستهلكة',
    category: 'organic',
    difficulty: 'سهل جداً',
    ecoFactor: 1.1,
    tags: ['قهوة', 'تفل قهوة', 'بن', 'عضوي'],
    commonUses: 'سماد عضوي غني بالنيتروجين، مقشر طبيعي للبشرة، طارد للحشرات'
  },
  {
    id: 'mat-o2',
    name: 'قشور بيض نظيفة ومجففة',
    category: 'organic',
    difficulty: 'سهل جداً',
    ecoFactor: 0.9,
    tags: ['قشر بيض', 'كالسيوم', 'عضوي'],
    commonUses: 'مكمل كالسيوم للتربة الزراعية، أحواض تشتيل بذور ميكرو طبيعية'
  },
  {
    id: 'mat-o3',
    name: 'قشور حمضيات وموالح (برتقال، ليمون)',
    category: 'organic',
    difficulty: 'سهل',
    ecoFactor: 1.2,
    tags: ['برتقال', 'ليمون', 'حمضيات'],
    commonUses: 'منظف أسطح إنزيمي طبيعي، طارد قطط وحشرات، شموع قشرية عطرية'
  },

  // Additional Plastic Items
  {
    id: 'mat-p9',
    name: 'أشرطة وأحزمة تغليف بلاستيكية متينة (Strapping Bands)',
    category: 'plastic',
    difficulty: 'متوسط',
    ecoFactor: 1.9,
    tags: ['أشرطة', 'تغليف طرود', 'بلاستيك متين'],
    commonUses: 'نسج سلال تسوق خارقة المتانة، مقاعد كراسي مجدولة'
  },
  {
    id: 'mat-p10',
    name: 'دلاء وبراميل بلاستيكية كبيرة (سعة 20-50 لتر)',
    category: 'plastic',
    difficulty: 'متوسط',
    ecoFactor: 3.5,
    tags: ['سطل', 'برميل', 'سطل بويات', 'دلو بلاستيك'],
    commonUses: 'أنظمة فلترة مياه رمادية، حاويات تسميد عضوي دوارة (Composter)'
  },
  {
    id: 'mat-p11',
    name: 'أدوات مائدة وشوك وملاعق بلاستيكية مستعملة',
    category: 'plastic',
    difficulty: 'سهل جداً',
    ecoFactor: 1.2,
    tags: ['ملاعق بلاستيك', 'شوك', 'مائدة سريعة'],
    commonUses: 'علامات تسمية نباتات في التربة، ثريات أباجورات بتصميم زهرة اللوتس'
  },

  // Additional Wood Items
  {
    id: 'mat-w8',
    name: 'أعواد خشبية للآيس كريم والمثلجات (Popsicle Sticks)',
    category: 'wood',
    difficulty: 'سهل جداً',
    ecoFactor: 0.9,
    tags: ['أعواد مثلجات', 'عيدان خشب', 'خشب صغير'],
    commonUses: 'منظمات أقلام هندسية سداسية، أباجورات إضاءة هندسية دافئة'
  },
  {
    id: 'mat-w9',
    name: 'مشابك غسيل خشبية تقليدية',
    category: 'wood',
    difficulty: 'سهل',
    ecoFactor: 1.1,
    tags: ['مشابك خشب', 'ملقط غسيل', 'ملاقط'],
    commonUses: 'أواني وحوامل نباتات دائرية، حوامل صور وملاحظات مكتبية'
  },
  {
    id: 'mat-w10',
    name: 'بكرات خيوط وأخشاب غزل دائرية',
    category: 'wood',
    difficulty: 'سهل',
    ecoFactor: 1.4,
    tags: ['بكرة خشب', 'خشب دائري', 'مكوك'],
    commonUses: 'حوامل شواحن وأسلاك مكتبية، قواعد شمعدانات ديكور'
  },

  // Additional Metal Items
  {
    id: 'mat-m8',
    name: 'أغطية زجاجات معدنية مسننة (Crown Caps)',
    category: 'metal',
    difficulty: 'سهل جداً',
    ecoFactor: 2.2,
    tags: ['غطاء معدن', 'سدادة كراون', 'أغطية مسننة'],
    commonUses: 'أسطح طاولات فسيفسائية مغطاة بالإيبوكسي، حليات شموع عائمة'
  },
  {
    id: 'mat-m9',
    name: 'أواني وقدور طهي قديمة مخدوشة (ألمنيوم / تيفال)',
    category: 'metal',
    difficulty: 'متوسط',
    ecoFactor: 5.8,
    tags: ['طناجر', 'قدور قديمة', 'مقالي تالفة'],
    commonUses: 'أحواض زهور خارجية معمرة، أجراس ريح صوتية رنانة'
  },
  {
    id: 'mat-m10',
    name: 'سلاسل دراجات ومسننات تروس ميكانيكية تالفة',
    category: 'metal',
    difficulty: 'متقدم',
    ecoFactor: 6.9,
    tags: ['سلسلة دراجة', 'جنزير', 'تروس معدنية'],
    commonUses: 'ساعات حائط صناعية (Steampunk)، حوامل أواني ثقيلة'
  },

  // Additional Paper Items
  {
    id: 'mat-c7',
    name: 'كرتون تغليف الأجهزة الكهربائية السميك المضلع',
    category: 'paper',
    difficulty: 'متوسط',
    ecoFactor: 1.8,
    tags: ['كرتون ثلاجة', 'كرتون شاشات', 'كرتون مضلع ثقيل'],
    commonUses: 'أثاث خفيف من الكرتون المقوى (مقاعد وطاولات حمولة 80 كغ)'
  },
  {
    id: 'mat-c8',
    name: 'أكياس شاي مستعملة ومجففة',
    category: 'paper',
    difficulty: 'سهل جداً',
    ecoFactor: 0.7,
    tags: ['أكياس شاي', 'ورق شاي', 'عضوي مجفف'],
    commonUses: 'تعتيق الورق اليدوي بألوان عتيقة، أكياس روائح عطرية طبيعية'
  },

  // Additional Textile Items
  {
    id: 'mat-t7',
    name: 'أربطة أحذية رياضية ملونة ومستغنى عنها',
    category: 'textile',
    difficulty: 'سهل جداً',
    ecoFactor: 1.5,
    tags: ['أربطة أحذية', 'خيوط نايلون', 'حبال رفيعة'],
    commonUses: 'حلقات تعليق مفاتيح، أساور مضفرة للسلامة (Paracord style)'
  },
  {
    id: 'mat-t8',
    name: 'جوارب صوفية وقطنية فردية مفقود زوجها',
    category: 'textile',
    difficulty: 'سهل',
    ecoFactor: 1.8,
    tags: ['جوارب', 'شرابات صوف'],
    commonUses: 'دمى وألعاب تعليمية للأطفال، كفرات حماية للأكواب الساخنة'
  },

  // Additional Glass Items
  {
    id: 'mat-g6',
    name: 'مرايا قديمة مكسورة الحواف أو مشروخة',
    category: 'glass',
    difficulty: 'متقدم',
    ecoFactor: 3.8,
    tags: ['مرآة مكسورة', 'زجاج عاكس', 'مرايا'],
    commonUses: 'إطارات مرايا موزاييك مشعة، كرات عاكسة للضوء ديكورية'
  },
  {
    id: 'mat-g7',
    name: 'كرات زجاجية (بيل/كلول) وأواني زجاجية ملونة',
    category: 'glass',
    difficulty: 'سهل',
    ecoFactor: 2.1,
    tags: ['كرات زجاج', 'بيل', 'زجاج ملون'],
    commonUses: 'فواصل إضاءة زجاجية ملونة، قواعد نباتات مائية'
  }
];

/**
 * Evaluate Material Compatibility & Chemical Synergy
 */
export function evaluateMaterialsCompatibility(selectedMaterials = []) {
  // Normalize input into an array of strings
  let list = [];
  if (Array.isArray(selectedMaterials)) {
    list = selectedMaterials;
  } else if (typeof selectedMaterials === 'string' && selectedMaterials.trim()) {
    list = selectedMaterials.split(/[،,\n+]+/).map(s => s.trim()).filter(Boolean);
  }

  if (list.length <= 1) {
    return {
      score: 100,
      level: 'جاهز للاختيار',
      rating: 'جاهز للاختيار',
      status: 'optimal',
      notes: 'اختر مادة ثانية لفحص مدى التوافق الكيميائي والميكانيكي للربط',
      bondingMethod: 'جاهز للاختيار',
      bondingRecommendations: ['اختر مواد متعددة لتحليل وسيلة الربط الفضلى'],
      hazardWarnings: []
    };
  }

  const selectedText = list.map(m => typeof m === 'object' ? (m.name || m.category || m.id || '') : String(m)).join(' ').toLowerCase();


  const warnings = [];
  let score = 92;
  let bondingMethod = 'تثبيت ميكانيكي ببراغي أو غراء إيبوكسي متعدد الاستخدامات';

  const hasGlass = selectedText.includes('زجاج') || selectedText.includes('برطمان');
  const hasMetal = selectedText.includes('معدن') || selectedText.includes('ألمنيوم') || selectedText.includes('صفيح');
  const hasWood = selectedText.includes('خشب') || selectedText.includes('بالت');
  const hasPlastic = selectedText.includes('بلاستيك') || selectedText.includes('pet') || selectedText.includes('pvc');

  if (hasGlass && hasMetal) {
    score = 88;
    bondingMethod = 'لاصق سيليكون إنشائي شفاف RTV أو إيبوكسي ثنائي المقاوم للصدمات';
    warnings.push('تجنب الشد المفرط للبراغي المباشرة على الزجاج لتفادي تشققه.');
  } else if (hasWood && hasMetal) {
    score = 96;
    bondingMethod = 'براغي صلب مجلفنة ذاتية الثقب مع حلقات إحكام مطاطية';
  } else if (hasPlastic && hasWood) {
    score = 90;
    bondingMethod = 'براغي خشب ناعمة مع غراء بولي يوريثان الرغوي المقاوم';
  }

  if (selectedText.includes('pvc') && (selectedText.includes('حرارة') || selectedText.includes('إشعال'))) {
    warnings.push('تحذير سلامة: تجنب تعريض أنابيب PVC للحرارة العالية المباشرة لمنع انبعاث غازات الكلور.');
  }

  const status = score >= 90 ? 'optimal' : score >= 75 ? 'warning' : 'danger';
  const ratingText = score >= 90 ? 'توافق هندسي عالي جداً' : 'توافق جيد يتطلب لاصقاً مخصصاً';

  return {
    score,
    level: ratingText,
    rating: ratingText,
    status,
    notes: bondingMethod,
    bondingMethod,
    bondingRecommendations: [bondingMethod, 'تنظيف وتجفيف الأسطح قبل أي تطبيق لاصق'],
    hazardWarnings: warnings
  };
}

