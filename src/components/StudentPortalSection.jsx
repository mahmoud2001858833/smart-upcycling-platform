import React, { useState } from 'react';
import { 
  GraduationCap, BookOpen, Award, CheckCircle, Calculator, 
  Wrench, Shield, Sparkles, Clock, ArrowRight, FileText, 
  Star, Layers, Lightbulb, Users, Compass, ExternalLink,
  ChevronDown, Search, Filter, HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import StudentPortalGuideModal from './StudentPortalGuideModal.jsx';

export default function StudentPortalSection({ 
  onSelectProject, 
  onOpenLabReport, 
  onOpenRubric, 
  onOpenQuiz,
  user
}) {
  const [selectedGrade, setSelectedGrade] = useState('middle'); // 'elementary' | 'middle' | 'high' | 'university'
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'calculator' | 'tools' | 'volunteer'
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  
  // Cutting & Quantity Calculator State
  const [calcInput, setCalcInput] = useState({
    materialType: 'كرتون مقوى',
    sheetWidth: 60,
    sheetLength: 90,
    pieceWidth: 15,
    pieceLength: 20,
    requiredCount: 8
  });
  const [calcResult, setCalcResult] = useState(null);

  // Volunteer hours state
  const [loggedHours, setLoggedHours] = useState(6);

  // Grade levels definitions
  const gradeLevels = [
    { id: 'elementary', label: 'المرحلة الابتدائية (1 - 6)', age: '7 - 12 سنة', icon: '🌱', focus: 'أشغال يدوية آمنة، استكشاف الحواس، تشكيل كرتون وورق' },
    { id: 'middle', label: 'المرحلة المتوسطة (7 - 9)', age: '13 - 15 سنة', icon: '🌿', focus: 'تجارب علمية، مبادئ الميكانيكا، كيمياء التدوير واللواصق' },
    { id: 'high', label: 'المرحلة الثانوية (10 - 12)', age: '16 - 18 سنة', icon: '🌳', focus: 'هندسة STEM، معارض العلوم، دراسات تقييم دورة الحياة LCA' },
    { id: 'university', label: 'المرحلة الجامعية والباحثين', age: '18+ سنة', icon: '🎓', focus: 'تصميم منتجات دائرية، نماذج أولية متقدمة، استدامة بيئية' }
  ];

  // Science Fair & Classroom Ready Projects (16 Comprehensive Projects)
  const schoolProjects = [
    // --- ELEMENTARY (1 - 6) ---
    {
      id: 'sch-2',
      title: 'مكبر صوت هندسي صوتي بدون كهرباء (Acoustic Cardboard Amplifier)',
      grade: 'elementary',
      category: 'فيزياء الصوت والموجات',
      stemBadge: 'فيزياء الرنين والموجات الصوتية',
      difficulty: 'سهل جداً وآمن',
      timeMinutes: 30,
      volunteerHours: 1.5,
      co2SavedKg: 1.8,
      materials: ['أسطوانات كرتون المناديل', 'أكواب ورقية مستعملة', 'غراء مدرسي غير سام', 'ألوان مائية'],
      summary: 'بناء بوق صوتي فيزيائي يضاعف سعة الموجات الصوتية للهواتف الذكية بنسبة +15 ديسيبل بالاعتماد على التوجيه المخروطي الفيزيائي.',
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      hypothesis: 'يعمل التشكيل المخروطي للأكواب الورقية كعاكس موجي يزيد من ضغط الصوت دون الحاجة لأي تيار كهربائي.',
      steps: [
        { id: 1, title: 'تفريغ فتحة الهاتف في الأسطوانة الكرتونية', detail: 'حدد أبعاد قاعدة الهاتف بقلم رصاص ثم قص الشق بدقة ليدخل الهاتف بإحكام.', tip: 'استخدم مسطرة لدقة القياس وتفادي اتساع الفتحة.' },
        { id: 2, title: 'صناعة منافذ الأكواب الجانبية', detail: 'قص دائرة في جانب كل كوب ورقي مطابقة لقطر الأسطوانة الكرتونية وثبتها كأبواق تضخيم.', tip: 'استخدم الغراء الأبيض المدرسي لغلق الفراغات الهوائية تماماً.' },
        { id: 3, title: 'التزيين واختبار الترددات الصوتية', detail: 'لون المكبر بألوان البيئة المائية وقِس قوة الصوت بواسطة تطبيق مقياس الديسيبل المدرسي.', tip: 'قارن بين شدة الصوت قبل وضع الهاتف وبعده وسجل النتائج في التقرير.' }
      ]
    },
    {
      id: 'sch-elem-1',
      title: 'مرشح مياه فيزيائي تعليمي بطبقات الرمل والحصى (Multi-Layer Water Filter)',
      grade: 'elementary',
      category: 'علوم البيئة والمياه',
      stemBadge: 'فيزياء الترسيب والترشيح الطبيعي',
      difficulty: 'سهل وآمن للأطفال',
      timeMinutes: 35,
      volunteerHours: 2,
      co2SavedKg: 2.1,
      materials: ['قارورة بلاستيكية 1.5 لتر', 'رمل شاطئ ناعم ومغسول', 'حصى نهري صغير', 'فحم نباتي نشط مطحون', 'قطع قطن طبيعي'],
      summary: 'بناء عمود ترشيح يحاكي الطبقات الجيولوجية للأرض لتنقية المياه العكرة وفهم دورة الهيدرولوجيا الطبيعية.',
      coverImage: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
      hypothesis: 'التدرج الحجمي لطبقات الحصى والرمل والفحم يزيل 95% من العكارة والشوائب المرئية دون إضافة أي كيماويات.',
      steps: [
        { id: 1, title: 'قطع قاعدة القارورة لتشكيل القمع', detail: 'اقطع قاعدة القارورة وثبتها مقلوبة لتكون وعاء استقبال الماء مع وضع طبقة قطن في الفوهة.', tip: 'تأكد من ثبات القارورة فوق كوب شفاف لجمع الماء المصفى.' },
        { id: 2, title: 'رصف الطبقات الترشيحية بالتدرج', detail: 'ضع طبقة فحم نباتي أولاً، تليها طبقة رمل ناعم (5 سم)، ثم رمل خشن (3 سم)، وأخيراً طبقة حصى علوية.', tip: 'اغسل الحصى بالماء النقي أولاً لإزالة الأتربة العالقة قبل التجربة.' },
        { id: 3, title: 'سكب الماء العكر وملاحظة النقاء', detail: 'اسكب ماءً مخلوطاً بالطين ببطء، وراقب خروج الماء قطرة بقطرة صافياً تماماً في الأسفل.', tip: 'سجل زمن الترشيح ودرجة الشفافية في تقرير المختبر المدرسي.' }
      ]
    },
    {
      id: 'sch-elem-2',
      title: 'مسرح عرائس كرتوني تفاعلي للقصص البيئية (Eco Puppet Theater)',
      grade: 'elementary',
      category: 'فنون تطبيقية وتعبير بيئي',
      stemBadge: 'هندسة الهياكل وتصميم المسارح',
      difficulty: 'سهل وممتع',
      timeMinutes: 40,
      volunteerHours: 2,
      co2SavedKg: 1.9,
      materials: ['صندوق كرتون أجهزة أو أحذية كبير', 'أقمشة ملابس قديمة كستائر', 'أعواد خشبية للشخصيات', 'ألوان مائية غير سامة'],
      summary: 'صناعة مسرح دمى متكامل يعيد استخدام كرتون الشحن والأقمشة البالية لتمثيل مسرحيات صفية حول أهمية تدوير النفايات.',
      coverImage: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80',
      hypothesis: 'إعادة استخدام كرتون التغليف لتصنيع أدوات تعليمية يقلل استهلاك البلاستيك الجديد بنسبة 100% في الأنشطة التعبيرية.',
      steps: [
        { id: 1, title: 'قص نافذة المسرح الرئيسية', detail: 'فرّغ مستطيلاً في واجهة الصندوق مع ترك حواف بعرض 4 سم كإطار متين للمسرح.', tip: 'استخدم مقص أمان مدرسي تحت إشراف المعلم أو ولي الأمر.' },
        { id: 2, title: 'تركيب الستائر القماشية الجانبية', detail: 'قص الأقمشة القديمة وثبتها على سلك أو عود خشب أعلى الواجهة لتتحرك كستائر مسرح حقيقية.', tip: 'استخدم غراء النشا أو الغراء الأبيض لتثبيت الحواف القماشية.' },
        { id: 3, title: 'صناعة الشخصيات الكرتونية', detail: 'ارسم شخصيات أبطال البيئة على بقايا الكرتون وثبتها بأعواد لتحريكها من خلف الكواليس.', tip: 'قدم عرضاً قصيراً لزملائك يشرح كيفية فرز النفايات المنزلية.' }
      ]
    },
    {
      id: 'sch-elem-3',
      title: 'ساعة شمسية تعليمية للحديقة المدرسية (Backyard Solar Sundial)',
      grade: 'elementary',
      category: 'علوم الفلك والظلال',
      stemBadge: 'فلك وزوايا الإشعاع الشمسي',
      difficulty: 'سهل جداً',
      timeMinutes: 25,
      volunteerHours: 1.5,
      co2SavedKg: 1.4,
      materials: ['قرص كرتون سميك أو غطاء علبة حلوى', 'قلم رصاص قديم كعقرب ظل (Gnomon)', 'مسطرة وبوصلة', 'لاصق ورقي'],
      summary: 'تصميم أداة فلكية تراثية تحسب الوقت بحركة دوران الأرض حول محورها بزوايا الظل الساقطة على القرص.',
      coverImage: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80',
      hypothesis: 'يمكن قراءة التوقيت الشمسي المحلي بدقة تصل إلى ±10 دقائق بمراقبة زاوية استطالة وانحراف الظل.',
      steps: [
        { id: 1, title: 'تحديد مركز القرص ورسم الساعات', detail: 'قسّم محيط القرص الدائري إلى 12 قسماً متساوياً تمثل ساعات النهار من 6 صباحاً حتى 6 مساءً.', tip: 'استخدم المنقلة لتحديد زاوية 15 درجة لكل ساعة نهارية.' },
        { id: 2, title: 'تثبيت عمود الظل (الغنومون)', detail: 'اغرس قلم الرصاص عمودياً في المركز تماماً أو بميل يعادل خط عرض مدينتك نحو الشمال.', tip: 'استخدم البوصلة لتوجيه علامة الساعة 12 نحو الشمال الجغرافي الدقيق.' },
        { id: 3, title: 'معايرة الساعة تحت أشعة الشمس', detail: 'ضع الساعة في فناء المدرسة وقارن موقع الظل بالساعة الرقمية في أوقات متفرقة من النهار.', tip: 'دوّن الفارق بين التوقيت الشمسي الحقيقي وتوقيت الساعة الرسمية.' }
      ]
    },

    // --- MIDDLE SCHOOL (7 - 9) ---
    {
      id: 'sch-1',
      title: 'محطة إنبات وتكاثر مائي ذاتية الري (Self-Watering Eco Planter)',
      grade: 'middle',
      category: 'معرض العلوم والبيئة',
      stemBadge: 'علوم النبات والضغط الأسموزي',
      difficulty: 'سهل - متوسط',
      timeMinutes: 45,
      volunteerHours: 2,
      co2SavedKg: 3.2,
      materials: ['قوارير بلاستيك شفافة (PET)', 'خيوط قطن طبيعية', 'تربة سماد عضوي', 'مقص أمان'],
      summary: 'تصميم نظام ري أسموزي يعتمد على الخاصية الشعرية باستخدام قوارير المياه البلاستيكية المعاد تدويرها بدون أي استهلاك طاقة.',
      coverImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
      hypothesis: 'يمكن لتقنية الخاصية الشعرية عبر الفتائل القطنية الحفاظ على رطوبة تربة النبات لمدة 14 يوماً بنصف كمية المياه العادية.',
      steps: [
        { id: 1, title: 'قص قارورة المياه بنسبة 1:2', detail: 'قم بقطع القارورة إلى جزأين بحيث يكون الجزء العلوي (القمع) مقلوباً داخل الجزء السفلي (الخزان).', tip: 'ثقب الغطاء البلاستيكي بحذر ليمر منه الفتيل القطني.' },
        { id: 2, title: 'تثبيت الفتيل القطني الأسموزي', detail: 'مرر حبل القطن عبر ثقب الغطاء مع ترك 5 سم داخل خزان الماء السفلي و5 سم داخل التربة العلوية.', tip: 'بلل الحبل بالماء مسبقاً لبدء التدفق الأسموزي الفوري.' },
        { id: 3, title: 'إضافة التربة والبذور واختبار التدفق', detail: 'ضع طبقة حجرية صغيرة في القمع ثم التربة والشتلة واملأ الخزان بالماء المعالج.', tip: 'ضع علامات قياس على القارورة لمراقبة استهلاك الماء أسبوعياً.' }
      ]
    },
    {
      id: 'sch-mid-1',
      title: 'سيارة دفع هوائي نفاث وفق قانون نيوتن الثالث (Jet Balloon Racer)',
      grade: 'middle',
      category: 'فيزياء الميكانيكا والحركة',
      stemBadge: 'قوانين نيوتن وحفظ كمية الحركة',
      difficulty: 'متوسط',
      timeMinutes: 50,
      volunteerHours: 2.5,
      co2SavedKg: 2.8,
      materials: ['أسطوانات كرتون أو عبوات عصير كرتونية', 'أغطية قوارير بلاستيكية كعجلات', 'أعواد خشبية للشواء كمحاور', 'شفاطات ورقية', 'بالون مطاطي'],
      summary: 'نموذج سيارة خفيفة الوزن تثبت قانون الفعل ورد الفعل لنيوتن عبر تحويل الطاقة المرنة للهواء المضغوط إلى طاقة حركية.',
      coverImage: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
      hypothesis: 'كلما زاد حجم الهواء المحبوس في البالون، زادت المسافة المقطوعة خطياً بنسبة تتناسب مع مربع سرعة الخروج.',
      steps: [
        { id: 1, title: 'بناء شاسيه السيارة الكرتوني', detail: 'اصنع قاعدة مستطيلة متزنة من الكرتون المقوى مع تثبيت أنبوبتين ورقتين للمحاور في الأسفل.', tip: 'احرص على توازي المحاور لضمان سير العربة في خط مستقيم.' },
        { id: 2, title: 'تركيب العجلات والمحاور الحرة', detail: 'مرر الأعواد الخشبية داخل الشفاطات وثبت أغطية القوارير كعجلات متوازنة بأقل احتكاك ممكن.', tip: 'ضع قطرة صمغ على رأس المحور لمنع انزلاق العجلة أثناء الدوران.' },
        { id: 3, title: 'تثبيت فوهة الدفع النفاثة والبالون', detail: 'اربط البالون بفوهة شفاطة عريضة وثبتها أعلى السيارة موجهة للخلف، انفخ البالون وأطلقه.', tip: 'قس المسافة المقطوعة بواسطة شريط قياس وسجل زمن الانطلاق لحساب السرعة المتجهة.' }
      ]
    },
    {
      id: 'sch-mid-2',
      title: 'فرن شمسي صندوقي معزول حرارياً (Solar Cardboard Box Cooker)',
      grade: 'middle',
      category: 'طاقة شمسية وانحباس حراري',
      stemBadge: 'ديناميكا العزل وامتصاص الإشعاع',
      difficulty: 'متوسط',
      timeMinutes: 60,
      volunteerHours: 3,
      co2SavedKg: 4.2,
      materials: ['صندوقا كرتون بأحجام متداخلة', 'ورق ألمنيوم عاكس', 'لوح بلاستيك شفاف أو زجاج نافذة قديم', 'ورق أسود مقوى', 'جرائد وصوف للعزل'],
      summary: 'فرن بيئي يستخدم الكرتون المزدوج لعزل الحرارة والمرايا العاكسة لتركيز أشعة الشمس والوصول إلى درجات حرارة تطهو الخضار وتسخن الماء.',
      coverImage: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
      hypothesis: 'العزل المزدوج بالجرائد والمرايا العاكسة يرفع الحرارة الداخلية إلى أكثر من 85°C في يوم مشمس عادي.',
      steps: [
        { id: 1, title: 'إنشاء الغرفة الحرارية المعزولة', detail: 'ضع الصندوق الصغير داخل الكبير واملأ الفراغ بينهما (5 سم) بكرات الجرائد والصوف كمادة عازلة ممتازة.', tip: 'تجنب الفراغات الهوائية غير المعزولة لمنع تسرب الحرارة بالتوصيل.' },
        { id: 2, title: 'تبطين الجدران الداخلية بالعاكس والأسود', detail: 'بطن غطاء الصندوق بورق الألمنيوم العاكس ليعمل كمرآة، وبطن أرضية الصندوق بالورق الأسود الماص للإشعاع.', tip: 'اللون الأسود المطفي يمتص 95% من طيف الأشعة المرئية ويحولها إلى حرارة.' },
        { id: 3, title: 'تركيب الغطاء الشفاف وقياس الحرارة', detail: 'غطِ الفوهة العلوية بالبلاستيك الشفاف بإحكام، وجه العاكس نحو الشمس وضع ميزان حرارة داخلي.', tip: 'سجل درجة الحرارة كل ربع ساعة واختبر صهر قطعة شوكولاتة أو تسخين ماء الشاي.' }
      ]
    },
    {
      id: 'sch-mid-3',
      title: 'بارومتر ضغط جوي منزلي من مرطبان زجاجي (DIY Aneroid Barometer)',
      grade: 'middle',
      category: 'الأرصاد الجوية والضغط الجوي',
      stemBadge: 'قوانين الغازات وحساب الضغط',
      difficulty: 'سهل - متوسط',
      timeMinutes: 35,
      volunteerHours: 2,
      co2SavedKg: 2.4,
      materials: ['مرطبان زجاجي مستعمل ونظيف', 'بالون مطاطي كبير', 'شفاطة ورقية رفيعة كمؤشر', 'شريط مطاطي محكم', 'بطاقة تدريج ورقية'],
      summary: 'أداة رصد جوي حساسة تسجل تغيرات الضغط الجوي المحيط للتنبؤ بحالات الطقس من صفاء أو عواصف قبل حدوثها.',
      coverImage: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=800&q=80',
      hypothesis: 'ارتفاع الضغط الجوي الخارجي يضغط غشاء البالون للأسفل فيرتفع طرف المؤشر، بينما هبوطه يشير لاقتراب منخفض جوي.',
      steps: [
        { id: 1, title: 'شد الغشاء المطاطي على فوهة المرطبان', detail: 'قص عنق البالون وشد الغشاء المطاطي بإحكام شديد فوق فوهة المرطبان الزجاجي وثبته بالشريط المطاطي.', tip: 'تأكد من إحكام الغلق التام لمنع تسرب الهواء الداخلي نهائياً.' },
        { id: 2, title: 'تثبيت مؤشر القراءة الحساس', detail: 'ثبت طرف الشفاطة بنقطة صمغ خفيفة في منتصف الغشاء المطاطي بحيث يبرز الطرف الآخر حراً كعقرب قراءة.', tip: 'قص طرف الشفاطة الخارجي بشكل مدبب لزيادة دقة القراءة على التدريج.' },
        { id: 3, title: 'تثبيت لوحة التدريج والمراقبة اليومية', detail: 'ثبت بطاقة كرتونية خلف المؤشر وسجل موقعه كل صباح ومساء مع مقارنة الحالة الجوية الفعلية.', tip: 'سجل القراءات لمدة أسبوع في دفتر الرصد العلمي للمدرسة.' }
      ]
    },

    // --- HIGH SCHOOL STEM (10 - 12) ---
    {
      id: 'sch-3',
      title: 'فرّازة عملات ميكانيكية بالجاذبية (Gravity Coin Sorter)',
      grade: 'high',
      category: 'هندسة ميكانيكية وSTEM',
      stemBadge: 'ميكانيكا الميل وعزم الاحتكاك',
      difficulty: 'متوسط - متقدم',
      timeMinutes: 75,
      volunteerHours: 3,
      co2SavedKg: 4.5,
      materials: ['كرتون مقوى مموج (Corrugated)', 'مسطرة معدنية', 'صمغ خشب نباتي', 'مشرط أمان كرتون'],
      summary: 'مشروع هندسي يفرز العملات المعدنية المختلفة تلقائياً وفق أقطارها وسماكاتها بالاعتماد التام على الجاذبية وزاوية الانحدار المثلى.',
      coverImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80',
      hypothesis: 'يمكن ضبط زاوية ميلان المنحدر بدرجة 28° لتحقيق سرعة انزلاق تسمح بسقوط العملة في فتحتها بدقة 98%.',
      steps: [
        { id: 1, title: 'رسم وتفريغ ثقوب الأقطار المتدرجة', detail: 'على لوح مائل، ارسم فتحات تتدرج من الأصغر قطراً إلى الأكبر بحسابات دقيقة بالمليمتر.', tip: 'احرص على ترك مسافة 3 سم بين كل فتحة وأخرى لمنع التداخل.' },
        { id: 2, title: 'بناء الهيكل الحامل بزاوية 28 درجة', detail: 'قص دعامتين مثلثتين بزاوية 28 درجة وثبت المنحدر عليهما باستخدام غراء الخشب القوي.', tip: 'اختبر استواء الهيكل باستخدام ميزان ماء للتأكد من عدم ميلانه الجانبي.' },
        { id: 3, title: 'تركيب صناديق التجميع واختبار العزم', detail: 'اصنع أدراجاً كرتونية صغيرة أسفل كل فتحة وقم بتمرير 20 عملة متنوعة لاختبار دقة الفرز.', tip: 'إذا توقفت عملة في المنتصف، قم بصنفرة مسار الانزلاق بورق زجاج ناعم.' }
      ]
    },
    {
      id: 'sch-high-1',
      title: 'ذراع روبوتية هيدروليكية بالسوائل والكرتون (Fluid-Power Robotic Arm)',
      grade: 'high',
      category: 'هندسة الميكاترونكس ومبدأ باسكال',
      stemBadge: 'هيدروليكا الموائع ومبدأ باسكال',
      difficulty: 'متقدم',
      timeMinutes: 90,
      volunteerHours: 4,
      co2SavedKg: 5.6,
      materials: ['محاقن بلاستيكية طبية نظيفة 10 مل', 'أنابيب سيليكون مرنة رفيعة', 'كرتون مقوى مضغوط', 'أعواد ومحاور تثبيت خشبية', 'ماء ملون بالأزرق والأحمر'],
      summary: 'ذراع آلية ثلاثية المحاور تعمل بضغط السائل الهيدروليكي بدون أي محرك كهربائي، تمسك بالأجسام وتنقلها بدقة فائقة.',
      coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
      hypothesis: 'تطبيق مبدأ باسكال لنقل الضغط عبر الموائع غير القابلة للانضغاط يولد عزم رفع يصل إلى 250 جرام بكفاءة ميكانيكية تفوق 90%.',
      steps: [
        { id: 1, title: 'قص مفاصل وهيكل الذراع الميكانيكية', detail: 'قص عظام الذراع الثلاثية (القاعدة، العضد، والملقط) من الكرتون المقوى وثقب محاور الدوران بدقة.', tip: 'ثبت المحاور بواسطة مسامير برشام كرتونية أو أعواد خشبية لتتحرك بسلاسة.' },
        { id: 2, title: 'تجهيز الدوائر الهيدروليكية المغلقة', detail: 'املأ كل زوج من المحاقن بالماء الملون واوصلهما بأنبوب السيليكون مع تفريغ أي فقاعات هوائية تماماً.', tip: 'أي فقاعة هواء داخل الأنبوب تقلل من قوة العزم بسبب قابلية الهواء للانضغاط.' },
        { id: 3, title: 'ربط المحاقن بالمفاصل ووحدة التحكم', detail: 'ثبت المحاقن التنفيذية على مفاصل الذراع، والمحاقن المحركة على لوحة تحكم يدوي مستقلة.', tip: 'اختبر التقاط كرة صغيرة ونقلها إلى صندوق مجاور ووثق درجات الحرية في التقرير.' }
      ]
    },
    {
      id: 'sch-high-2',
      title: 'خلية جلفانية كهرومغناطيسية من صفائح الألمنيوم والملح (Galvanic Salt-Water Cell)',
      grade: 'high',
      category: 'كيمياء كهربية وطاقة نظيفة',
      stemBadge: 'تفاعلات الأكسدة والاختزال وفرق الجهد',
      difficulty: 'متوسط - متقدم',
      timeMinutes: 60,
      volunteerHours: 3.5,
      co2SavedKg: 4.8,
      materials: ['صفائح ألمنيوم من علب مشروبات مستعملة', 'أسلاك نحاسية قديمة مفرغة', 'ورق نشاف كرتوني سميك', 'ماء مذاب فيه ملح طعام بتركيز 10%', 'دايود ضوئي LED أحمر'],
      summary: 'توليد تيار كهربائي حقيقي من تفاعل كيميائي بين خردة الألمنيوم والأسلاك النحاسية ومحلول الملح المنزلي لإضاءة مصباح LED.',
      coverImage: 'https://images.unsplash.com/photo-1558441719-8b489c63f79b?auto=format&fit=crop&w=800&q=80',
      hypothesis: 'فرق الجهد الكهروكيميائي بين قطبي الألمنيوم (المصعد) والنحاس (المهبط) ينتج 0.6 فولت لكل خلية، وربط 4 خلايا يولد 2.4 فولت تكفي لتشغيل LED.',
      steps: [
        { id: 1, title: 'صنفرة وتجهيز شرائح الألمنيوم والنحاس', detail: 'صنفر سطح علب الألمنيوم لإزالة طبقة الطلاء والعزل الشفاف حتى يظهر المعدن اللامع تماماً.', tip: 'ارتد قفازات واقية ونظارات أمان عند التعامل مع حواف الألمنيوم.' },
        { id: 2, title: 'بناء الخلية الطبقية بواسطة ورق النشاف', detail: 'شبع ورق النشاف بمحلول الملح المركز وضعه بين شريحة الألمنيوم وسلك النحاس الملفوف كطبقات شطيرة.', tip: 'تأكد من عدم تلامس قطبي الألمنيوم والنحاس مباشرة لتفادي حدوث قصر دارة (Short Circuit).' },
        { id: 3, title: 'ربط الخلايا على التوالي وقياس الفولتية', detail: 'اربط 4 خلايا معاً على التوالي باستخدام مشابك تمساح، وقِس الجهد بواسطة ملتيميتر ثم أوصل الـ LED.', tip: 'سجل تغير الفولتية مع مرور الوقت ومقدار استهلاك الألمنيوم في تقرير المختبر.' }
      ]
    },
    {
      id: 'sch-high-3',
      title: 'مجس استشعار رطوبة تربة متصل لترشيد الري (Smart Kinetic Soil Sensor)',
      grade: 'high',
      category: 'هندسة الزراعة الذكية وإنترنت الأشياء',
      stemBadge: 'المقاومة الكهربائية وتوصيل الأيونات',
      difficulty: 'متقدم',
      timeMinutes: 80,
      volunteerHours: 4.5,
      co2SavedKg: 6.2,
      materials: ['مسماران فولاذيان مجلفنان قديمان', 'أسلاك كهربائية مسترجعة', 'مقاومة 10K أوم', 'مؤشر LED أو صفارة تنبيه صغيرة', 'بطارية 9V معاد تدويرها'],
      summary: 'مستشعر رطوبة حركي يقرأ المقاومة الكهربائية لحبيبات التربة ويطلق تنبيهاً مرئياً عند جفاف النبتة لتوفير 40% من مياه الري.',
      coverImage: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80',
      hypothesis: 'انخفاض رطوبة التربة دون 25% يرفع مقاومتها فوق 100 كيلو أوم، مما يقطع الإشارة ويضيء مصباح التحذير للري.',
      steps: [
        { id: 1, title: 'تثبيت مجسي القياس الفولاذيين', detail: 'ثبت المسمارين في كتلة خشبية أو كرتونية معزولة على مسافة 2 سم ثابتة بينهما.', tip: 'ثبات المسافة بين المجسين ضروري لمعايرة المقاومة بدقة متكررة.' },
        { id: 2, title: 'توصيل دائرة مجزئ الجهد (Voltage Divider)', detail: 'اربط أحد المجسين بالقطب الموجب والآخر بالمقاومة وقاعدة الترانزستور لتشغيل الدارة.', tip: 'استخدم ترانزستور BC547 كمفتاح إلكتروني مكبر للإشارة الضعيفة.' },
        { id: 3, title: 'المعايرة في التربة الجافة والرطبة', detail: 'اغرس المجسين في وعاء نباتي وقارن استجابة المؤشر بين التربة المروية حديثاً والتربة الجافة.', tip: 'ارسم منحنياً بيانياً يوضح العلاقة بين نسبة رطوبة التربة والجهد المقاس.' }
      ]
    },

    // --- UNIVERSITY & RESEARCHERS (18+) ---
    {
      id: 'sch-4',
      title: 'خلية تسخين شمسي حرارية مصغرة (Solar Thermal Air Collector)',
      grade: 'university',
      category: 'طاقة متجددة وديناميكا حرارية',
      stemBadge: 'ديناميكا حرارية وامتصاص الأشعة تحت الحمراء',
      difficulty: 'متقدم',
      timeMinutes: 90,
      volunteerHours: 4,
      co2SavedKg: 8.6,
      materials: ['علب ألمنيوم مشروبات (Soda cans)', 'صندوق خشبي قديم', 'لوح زجاج أو بولي كربونات', 'طلاء أسود مطفي حراري'],
      summary: 'نموذج أولي لمجمع حراري شمسي يرفع درجة حرارة الهواء المتدفق بمقدار 22 درجة مئوية باستخدام علب الألمنيوم كمبادل حراري فائق الموصلية.',
      coverImage: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
      hypothesis: 'استخدام ألمنيوم العلب المفرغ والمطلي بالأسود المطفي يرفع كفاءة التبادل الحراري بنسبة 40% مقارنة بالصناديق الخشبية المباشرة.',
      steps: [
        { id: 1, title: 'ثقب وتجهيز أسطوانات الألمنيوم', detail: 'قم بإزالة قيعان وقمم علب الألمنيوم لتشكيل أنابيب هوائية متصلة تسمح بمرور الهواء وتوليد دوامات حرارية.', tip: 'ارتد قفازات جلدية واقية عند التعامل مع حواف الألمنيوم المقصوصة.' },
        { id: 2, title: 'الطلاء الأسود الماص للحرارة والتجميع', detail: 'اطلي الأنابيب بطلاء أسود مطفي غير لامع لتعظيم امتصاص الإشعاع الشمسي، ثم ثبتها داخل الصندوق المعزول.', tip: 'تأكد من عزل حواف الصندوق بطبقة صوف أو كرتون لمنع تسرب الحرارة.' },
        { id: 3, title: 'تغطية السطح بالزجاج وقياس الفرق الحراري (Delta T)', detail: 'ثبت اللوح الشفاف وأدخل حساس حرارة في المدخل السفلي والمخرج العلوي وسجل قياسات الارتفاع الحراري تحت الشمس.', tip: 'قس درجة الحرارة كل 10 دقائق لتوثيق منحنى التسخين الشمسي في التقرير الأكاديمي.' }
      ]
    },
    {
      id: 'sch-univ-1',
      title: 'طابوق بناء بيئي خفيف من لب الورق والرماد (Papercrete Eco-Bricks)',
      grade: 'university',
      category: 'هندسة المواد والإنشاءات المستدامة',
      stemBadge: 'ميكانيكا الإجهاد والعزل الحراري R-Value',
      difficulty: 'أكاديمي متقدم',
      timeMinutes: 120,
      volunteerHours: 5,
      co2SavedKg: 12.4,
      materials: ['نفايات كرتون وأوراق تالفة مفرومة', 'رمل سيليكا ناعم', 'رماد متطاير أو كمية ضئيلة من الجير المطفأ', 'قوالب خشبية مكعبة 10x10x20 سم', 'ماء للمعالجة'],
      summary: 'تصنيع طوب بناء عازل للصوت والحرارة يعتمد على ألياف السيليلوز المسترجعة كبديل للركام الثقيل، مع قياس قوة التحمل الانضغاطي.',
      coverImage: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
      hypothesis: 'استبدال 60% من ركام الخرسانة بلب الورق يخفض الكثافة بنسبة 45% ويرفع معامل العزل الحراري (R-value) بمقدار 3 أضعاف مع تماسك إنشائي كافٍ للقواطع.',
      steps: [
        { id: 1, title: 'نقع وفرم الورق لإنتاج معجون السيليلوز', detail: 'انقع نفايات الورق والكرتون في الماء لمدة 24 ساعة ثم افرمه ميكانيكياً حتى يتحول إلى عجينة ألياف متجانسة.', tip: 'تأكد من تفكك ألياف الكرتون بالكامل لضمان تشابكها الميكانيكي في القالب.' },
        { id: 2, title: 'خلط الرمل والمواد الرابطة والضغط', detail: 'اخلط معجون الورق مع رمل السيليكا والجير بنسب وزنية مدروسة (60% ورق : 30% رمل : 10% رابط) واكبسها في القالب.', tip: 'استخدم ضغطاً هيدروليكياً أو ميكانيكياً لطرد الماء الزائد وتسريع التصلد.' },
        { id: 3, title: 'المعالجة والتجفيف واختبار قوة التحمل', detail: 'اترك الطوب ليجف في الهواء الطلق لمدة 7 أيام ثم أجرِ اختبار الحمل الانضغاطي ومقاومة الحريق.', tip: 'سجل الوزن الجاف ونسبة امتصاص الماء مقارنة بالطوب الإسمنتي التقليدي.' }
      ]
    },
    {
      id: 'sch-univ-2',
      title: 'مفاعل سماد عضوي دودي منزلي مع قياس الانبعاثات (Smart Vermicomposting Bioreactor)',
      grade: 'university',
      category: 'الهندسة البيئية والاقتصاد الدائري',
      stemBadge: 'التحلل الحيوي ومنع انبعاثات الميثان CH4',
      difficulty: 'أكاديمي متقدم',
      timeMinutes: 100,
      volunteerHours: 6,
      co2SavedKg: 15.8,
      materials: ['صناديق بلاستيكية مثقبة معاد تدويرها', 'كرتون مموج مبلل كفرشة', 'ديدان الأرض الحمراء (Eisenia fetida)', 'بقايا خضار وفواكه مطبخ', 'مجس رطوبة وحموضة pH'],
      summary: 'نظام بيولوجي مغلق يحول مخلفات المطبخ العضوية بنسبة 100% إلى سماد دودي فائق الخصوبة مع منع انبعاثات الميثان الناتجة عن التحلل اللاهوائي في المكبات.',
      coverImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
      hypothesis: 'المعالجة الدودية الهوائية لمخلفات المطبخ تمنع انبعاث 1.8 كجم من مكافئ غاز الميثان لكل 1 كجم مخلفات مقارنة بالطمر في مكبات النفايات.',
      steps: [
        { id: 1, title: 'تجهيز الصناديق الطبقية والتهوية', detail: 'اصنع ثقوب تهوية بقطر 3 مم في الغطاء وأسفل الصندوق العلوي للسماح بمرور الديدان وتصريف الشاي العضوي.', tip: 'احرص على تغطية فتحات التهوية بشاش ناعم لمنع دخول الحشرات.' },
        { id: 2, title: 'إعداد الفرشة الكربونية وإدخال الديدان', detail: 'قطع الكرتون المموج إلى شرائح وانقعه بالماء ليمثل مصدراً للكربون العضوي، ثم أضف مجتمع الديدان بحذر.', tip: 'حافظ على رطوبة الفرشة عند 70-80% بدرجة حرارة بين 18-25 مئوية.' },
        { id: 3, title: 'التغذية المنتظمة ومراقبة النتروجين والـ pH', detail: 'أضف بقايا الخضار مدفونة تحت الكرتون بكميات محسوبة، وقِس مستويات الـ pH ومعدل إنتاج السماد أسبوعياً.', tip: 'اجمع شاي الكومبوست السائل واستخدمه كمخصب نباتي سائل وقارن نمو النباتات المعالجة به.' }
      ]
    },
    {
      id: 'sch-univ-3',
      title: 'مبادل حراري سلبي للتبريد التبخيري الصحراوي (Zero-Energy Evaporative Cooling)',
      grade: 'university',
      category: 'هندسة الطاقة والديناميكا المائية',
      stemBadge: 'الحرارة الكامنة للتبخر وتبريد البيوت المحمية',
      difficulty: 'أكاديمي متقدم',
      timeMinutes: 90,
      volunteerHours: 5,
      co2SavedKg: 11.2,
      materials: ['وعاءان فخاريان متداخلان (Zeer Pot)', 'رمل صحراوي خشن', 'ماء معالج أو رمادي مصفى', 'غطاء خيش رطب', 'مستشعر حرارة ورطوبة رقمي'],
      summary: 'ثلاجة صحراوية سلبية تعتمد على الحرارة الكامنة لتبخر الماء من مسامات الفخار لحفظ الأدوية والمحاصيل الزراعية دون استهلاك أي كهرباء.',
      coverImage: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
      hypothesis: 'تبخر الماء من المسامات الدقيقة يخفض درجة الحرارة في الحجرة الداخلية بمقدار 8 إلى 14 درجة مئوية تحت درجة حرارة المحيط الجاف.',
      steps: [
        { id: 1, title: 'تجهيز وتوسيط الأوعية الفخارية', detail: 'ضع الوعاء الفخاري الصغير داخل الكبير واملأ الفراغ البالغ 4 سم بينهما بالرمل الخشن النظيف.', tip: 'تأكد من عدم طلاء الفخار بأي مادة شمعية أو ملمعة لضمان نفاذية المسامات للماء.' },
        { id: 2, title: 'ترطيب الرمل وتركيب الغطاء العازل', detail: 'صب الماء على الرمل حتى يتشبع بالكامل، وغطِ الفوهة بقطعة قماش خيش رطبة لمنع الحمل الحراري.', tip: 'بلل الرمل مرتين يومياً بالماء للحفاظ على استمرار عملية التبخر النشط.' },
        { id: 3, title: 'تسجيل المنحنى الحراري الداخلي والخارجي', detail: 'ضع مستشعرات الحرارة بالداخل والخارج وقِس الفارق في ذروة الظهيرة مع قياس سرعة الرياح المحيطة.', tip: 'سجل كفاءة حفظ عينات الطماطم أو اللقاحات مقارنة بالهواء الطلق.' }
      ]
    }
  ];

  // Tool substitution dictionary
  const toolSubstitutions = [
    {
      dangerTool: 'مشرط صناعي أو كاتر حاد (Utility Knife)',
      safeSub: 'مقص أمان مدرسي مدور الحواف أو مسطرة معدنية لطي وضغط الكرتون بدلاً من قصه العميق.',
      safetyLevel: 'آمن تماماً للغرفة الصفية',
      color: '#059669'
    },
    {
      dangerTool: 'مسدس الشمع الساخن (Hot Melt Glue Gun)',
      safeSub: 'غراء النشا المنزلي، غراء الخشب المائي الأبيض، أو الدبابيس الورقية المزدوجة (Split Pins).',
      safetyLevel: 'خالي من الحروق الكيميائية والحرارية',
      color: '#059669'
    },
    {
      dangerTool: 'دريل كهربائي أو مثقاب حاد (Power Drill)',
      safeSub: 'خرامة ورق مكتبية، مخرز يدوي خشبي مع إشراف المعلم، أو تشكيل الفتحة بالضغط التدريجي بقلم رصاص.',
      safetyLevel: 'تحكم يدوي بنسبة 100%',
      color: '#0284c7'
    },
    {
      dangerTool: 'دهانات ورنيش وسبراي كيماوي (Aerosol Spray Paint)',
      safeSub: 'ألوان أكريليك مائية صديقة للبيئة، صبغات طبيعية من الكركم والشمندر، أو تغليف بالأوراق الملونة.',
      safetyLevel: 'بدون أي روائح أو انبعاثات VOC',
      color: '#059669'
    },
    {
      dangerTool: 'منشار حديد أو خشب كهربائي (Power Saw)',
      safeSub: 'منشار يدوي دقيق مع ملزمة أمان، أو استخدام خامات الكرتون المقوى وخشب البالسا الذي يسهل تشكيله يدوياً.',
      safetyLevel: 'إشراف توجيهي مباشر',
      color: '#d97706'
    }
  ];

  // Calculate material cutting yield
  const handleCalculateCutting = (e) => {
    e.preventDefault();
    const sheetArea = Number(calcInput.sheetWidth) * Number(calcInput.sheetLength);
    const pieceArea = Number(calcInput.pieceWidth) * Number(calcInput.pieceLength);
    
    // Fit along length and width
    const fitA = Math.floor(calcInput.sheetLength / calcInput.pieceLength) * Math.floor(calcInput.sheetWidth / calcInput.pieceWidth);
    const fitB = Math.floor(calcInput.sheetLength / calcInput.pieceWidth) * Math.floor(calcInput.sheetWidth / calcInput.pieceLength);
    const bestYield = Math.max(fitA, fitB);
    const totalSheetsNeeded = Math.ceil(Number(calcInput.requiredCount) / (bestYield || 1));
    const totalPiecesProduced = totalSheetsNeeded * bestYield;
    const wastePercentage = Math.max(0, Math.round(((sheetArea * totalSheetsNeeded - pieceArea * Number(calcInput.requiredCount)) / (sheetArea * totalSheetsNeeded)) * 100));

    setCalcResult({
      bestYieldPerSheet: bestYield,
      totalSheetsNeeded,
      totalPiecesProduced,
      wastePercentage,
      efficiencyScore: 100 - wastePercentage
    });
  };

  const filteredProjects = schoolProjects.filter(p => p.grade === selectedGrade || selectedGrade === 'all');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8 animate-fade-in text-slate-800">
      
      {/* Hero Banner for Academic Portal */}
      <div className="relative rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900 text-white p-6 sm:p-10 overflow-hidden shadow-xl border border-emerald-700/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-200">
              <GraduationCap className="w-4 h-4 text-emerald-300" />
              <span>البوابة الأكاديمية والمدرسية الرسمية (Student & School STEM Hub)</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              أهلاً بكم في معمل الابتكار الأخضر ومعارض العلوم المدرسية
            </h1>
            
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              منصة متكاملة تدعم المعلمين والطلاب في تحويل المخلفات المنزلية إلى مشاريع بحثية وهندسية جاهزة للتحكيم العلمي، مع توثيق تقارير المختبر، ساعات التطوع، واستمارة التقييم بـ 100 درجة.
            </p>

            {/* Quick stats badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-white/15 border border-white/20 flex items-center gap-1.5 font-bold">
                <FileText className="w-4 h-4 text-amber-300" />
                تقارير بحثية قابلة للطباعة PDF
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/15 border border-white/20 flex items-center gap-1.5 font-bold">
                <Award className="w-4 h-4 text-emerald-300" />
                سلم تقييم المعلم (Rubric 100pt)
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/15 border border-white/20 flex items-center gap-1.5 font-bold">
                <Clock className="w-4 h-4 text-teal-300" />
                ساعات تطوع بيئي معتمدة
              </span>
            </div>
          </div>

          {/* Student Status Card */}
          <div className="w-full md:w-80 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">بطاقة الطالب البيئي:</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/30 text-emerald-200 text-xs font-bold border border-emerald-400/30">
                طالب موثق 🎓
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-emerald-500 flex items-center justify-center text-white font-black text-lg shadow-md">
                {user?.user_metadata?.full_name ? user.user_metadata.full_name[0] : 'ط'}
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">
                  {user?.user_metadata?.full_name || 'طالب الابتكار الأخضر'}
                </h4>
                <p className="text-xs text-slate-300">
                  {user?.user_metadata?.school || 'مدرسة التميز والاستدامة'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-center">
              <div className="p-2 rounded-xl bg-black/20">
                <div className="text-lg font-black text-amber-300">{loggedHours} ساعات</div>
                <div className="text-[10px] text-slate-300">خدمة مجتمع بيئية</div>
              </div>
              <div className="p-2 rounded-xl bg-black/20">
                <div className="text-lg font-black text-emerald-300">96.5%</div>
                <div className="text-[10px] text-slate-300">معدل التقييم الأكاديمي</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Feature Explainer Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>مشاريع معارض العلوم المدرسية</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>حاسبة القص والكميات الهندسية</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'tools'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>دليل البدائل الآمنة للأدوات الصفية</span>
          </button>

          <button
            onClick={() => setActiveTab('volunteer')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'volunteer'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>سجل ساعات التطوع البيئي</span>
          </button>
        </div>

        {/* Feature Explainer Button */}
        <button
          type="button"
          onClick={() => setIsGuideModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300 text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer shadow-xs transition-all"
        >
          <Lightbulb className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>دليل وشرح ميزات البوابة الأكاديمية 📖</span>
        </button>
      </div>

      {/* ============================================================
          TAB 1: PROJECTS FOR SCIENCE FAIRS & CURRICULUM
          ============================================================ */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {/* Feature Explainer Banner */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-600 text-white flex-shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-emerald-900 text-sm">مشاريع المناهج ومعارض العلوم المدرسية (STEM Ready)</strong>
                <span className="text-emerald-800">
                  مشاريع موثقة بفرضيات علمية (Hypotheses) وخطوات تطبيق دقيقة. تدعم توليد تقارير مختبر فورية وسلم تقييم رسمي بـ 100 درجة.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsGuideModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold whitespace-nowrap cursor-pointer shadow-2xs"
            >
              شرح الميزة والأهداف ℹ️
            </button>
          </div>

          {/* Grade level filter chips */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-emerald-700" />
                اختر المرحلة التعليمية لتخصيص صعوبة المعايير:
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {gradeLevels.map(grade => {
                const isSelected = selectedGrade === grade.id;
                return (
                  <button
                    key={grade.id}
                    onClick={() => setSelectedGrade(grade.id)}
                    className={`p-3 rounded-2xl text-right transition-all border cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{grade.icon}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {grade.age}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-xs sm:text-sm pt-1">
                      {grade.label}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      {grade.focus}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <div 
                key={project.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col"
              >
                {/* Image Cover with STEM Badge */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img 
                    src={project.coverImage} 
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {project.stemBadge}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white text-xs">
                    <span className="font-semibold px-2 py-0.5 rounded bg-black/40 backdrop-blur-xs">
                      ⏱️ {project.timeMinutes} دقيقة
                    </span>
                    <span className="font-bold text-amber-300 px-2 py-0.5 rounded bg-black/40 backdrop-blur-xs">
                      🏆 {project.volunteerHours} ساعات خدمة مجتمع
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-black text-slate-900 text-base sm:text-lg leading-snug">
                      {project.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {project.summary}
                    </p>

                    {/* Materials chips */}
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-slate-500 block mb-1">المواد المطلوبة:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {project.materials.map((mat, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                            {mat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <button
                      onClick={() => onSelectProject(project)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>فتح دليل التنفيذ الكامل</span>
                    </button>

                    <button
                      onClick={() => onOpenLabReport(project)}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-200"
                      title="تجهيز تقرير البحث العلمي المدرسي"
                    >
                      <FileText className="w-4 h-4 text-emerald-700" />
                      <span>تقرير البحث</span>
                    </button>

                    <button
                      onClick={() => onOpenRubric(project)}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-200"
                      title="تقييم المعلم (سلم الـ 100 نقطة)"
                    >
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>استمارة التقييم</span>
                    </button>

                    <button
                      onClick={() => onOpenQuiz(project)}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-200"
                      title="اختبار الاستيعاب البيئي"
                    >
                      <Lightbulb className="w-4 h-4 text-teal-600" />
                      <span>اختبار</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 2: MATERIAL QUANTITY & CUTTING CALCULATOR
          ============================================================ */}
      {activeTab === 'calculator' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="max-w-2xl space-y-1">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-emerald-700" />
              <span>حاسبة هندسة القص والحد من الهدر (Cutting & Yield Optimizer)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              أداة رياضية وهندسية تمكّن الطالب من حساب التوزيع الأمثل للقطع على ألواح الكرتون أو الخشب لتقليل الفاقد وتجنب استهلاك موارد زائدة.
            </p>
          </div>

          <form onSubmit={handleCalculateCutting} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Sheet Dimensions */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>أبعاد لوح المادة الخام المتوفر (Raw Sheet):</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">نوع المادة:</label>
                  <select 
                    value={calcInput.materialType}
                    onChange={(e) => setCalcInput({ ...calcInput, materialType: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-emerald-500 font-medium"
                  >
                    <option value="كرتون مقوى مموج">كرتون مقوى مموج</option>
                    <option value="خشب معاكس (Plywood)">خشب معاكس (Plywood)</option>
                    <option value="صفائح بلاستيك معاد تدويره">صفائح بلاستيك معاد تدويره</option>
                    <option value="لوح فلين مضغوط">لوح فلين مضغوط</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">العدد المطلوب من القطع:</label>
                  <input 
                    type="number"
                    min="1"
                    value={calcInput.requiredCount}
                    onChange={(e) => setCalcInput({ ...calcInput, requiredCount: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">طول اللوح (سم):</label>
                  <input 
                    type="number"
                    min="5"
                    value={calcInput.sheetLength}
                    onChange={(e) => setCalcInput({ ...calcInput, sheetLength: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">عرض اللوح (سم):</label>
                  <input 
                    type="number"
                    min="5"
                    value={calcInput.sheetWidth}
                    onChange={(e) => setCalcInput({ ...calcInput, sheetWidth: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-emerald-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Target Piece Dimensions */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-700" />
                <span>أبعاد القطعة الهندسية المستهدفة (Target Piece):</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">طول القطعة (سم):</label>
                  <input 
                    type="number"
                    min="1"
                    value={calcInput.pieceLength}
                    onChange={(e) => setCalcInput({ ...calcInput, pieceLength: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">عرض القطعة (سم):</label>
                  <input 
                    type="number"
                    min="1"
                    value={calcInput.pieceWidth}
                    onChange={(e) => setCalcInput({ ...calcInput, pieceWidth: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Calculator className="w-4 h-4" />
                  <span>احسب أفضل توزيع وخطة قص صفرية الهدر</span>
                </button>
              </div>
            </div>
          </form>

          {/* Calculation Results Card */}
          {calcResult && (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 animate-fade-in space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-emerald-950 text-base flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-700" />
                  <span>نتائج التحليل الهندسي لخطة القص:</span>
                </h4>
                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black">
                  كفاءة الاستغلال: {calcResult.efficiencyScore}%
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-white rounded-xl border border-emerald-200">
                  <div className="text-xs text-slate-500 font-semibold">إنتاجية اللوح الواحد</div>
                  <div className="text-xl font-black text-emerald-800">{calcResult.bestYieldPerSheet} قطع</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-200">
                  <div className="text-xs text-slate-500 font-semibold">عدد الألواح اللازمة</div>
                  <div className="text-xl font-black text-emerald-800">{calcResult.totalSheetsNeeded} لوح</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-200">
                  <div className="text-xs text-slate-500 font-semibold">إجمالي القطع المستخرجة</div>
                  <div className="text-xl font-black text-emerald-800">{calcResult.totalPiecesProduced} قطعة</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-200">
                  <div className="text-xs text-slate-500 font-semibold">نسبة الفاقد المتبقي</div>
                  <div className="text-xl font-black text-amber-600">{calcResult.wastePercentage}%</div>
                </div>
              </div>

              <p className="text-xs text-emerald-900 bg-white/70 p-3 rounded-xl border border-emerald-200 leading-relaxed">
                💡 <strong>نصيحة المعلم والهندسة المستدامة:</strong> استخدم القصاصات المتبقية ({calcResult.wastePercentage}%) لصناعة دعامات زاوية (Corner Brackets) أو عوازل تثبيت داخلية لرفع متانة المشروع دون أي تكلفة إضافية.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          TAB 3: SAFE CLASSROOM TOOL SUBSTITUTES
          ============================================================ */}
      {activeTab === 'tools' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="max-w-2xl space-y-1">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-700" />
              <span>دليل بدائل الأدوات المدرسية الآمنة والمجانية</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              دليل معتمد للسلامة في الغرفة الصفية والمنزل، يقدم بدائل آمنة وغير مكلفة تغني الطالب تماماً عن الأدوات الحادة أو الكيماوية الخطرة.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {toolSubstitutions.map((item, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-emerald-300 transition-all"
              >
                <div className="space-y-1 max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    <h4 className="font-bold text-slate-900 text-sm">
                      الأداة الخطرة الشائعة: <span className="text-rose-600">{item.dangerTool}</span>
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pr-4">
                    ✨ <strong>البديل المدرسي الآمن:</strong> {item.safeSub}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-700" />
                    {item.safetyLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>ميثاق السلامة والأمان الصفي:</strong> يوصى دائماً بوجود إشراف من معلم العلوم أو ولي الأمر عند قص الخامات الصلبة، مع ارتداء النظارات الواقية واستخدام سطح قص خشبي سميك لحماية الطاولات المدرسية.
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 4: STUDENT VOLUNTEER HOURS CARD
          ============================================================ */}
      {activeTab === 'volunteer' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-500" />
                <span>سجل ساعات العمل التطوعي وخدمة المجتمع المعتمدة</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                كل مشروع تدوير وتوعية بيئية تنجزه يمنحك ساعات تطوع رسمية معتمدة لملفك الأكاديمي والجامعي.
              </p>
            </div>

            <button
              onClick={() => {
                confetti({ particleCount: 80, spread: 60 });
                setLoggedHours(prev => prev + 2);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>تسجيل مشروع منجز (+2 ساعات)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
              <span className="text-xs font-semibold text-emerald-800">إجمالي الساعات المعتمدة</span>
              <div className="text-3xl font-black text-emerald-900">{loggedHours} ساعة</div>
              <span className="text-[11px] text-emerald-600 block">معادلة رسمية لمنهج الأنشطة</span>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-1">
              <span className="text-xs font-semibold text-amber-800">المشاريع المنجزة والموثقة</span>
              <div className="text-3xl font-black text-amber-900">{Math.floor(loggedHours / 2)} مشاريع</div>
              <span className="text-[11px] text-amber-600 block">بإشراف معلمي المادة</span>
            </div>

            <div className="p-5 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-1">
              <span className="text-xs font-semibold text-teal-800">الأثر الكربوني الإجمالي المتجنب</span>
              <div className="text-3xl font-black text-teal-900">{(loggedHours * 1.8).toFixed(1)} كغ CO₂</div>
              <span className="text-[11px] text-teal-600 block">مساهمة فعلية في حماية المناخ</span>
            </div>
          </div>

          {/* Volunteer Certificate Preview */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>شهادة الساعات التطوعية المدرسية (Student Eco-Volunteer Certificate)</span>
              </h4>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Award className="w-3.5 h-3.5 text-emerald-700" />
                <span>طباعة كشف الساعات</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 space-y-2">
              <p>
                تشهد المنصة بأن الطالب <strong>{user?.user_metadata?.full_name || 'طالب متميز'}</strong> قد أكمل بنجاح <strong>{loggedHours} ساعات</strong> من الأنشطة البيئية التطوعية الميدانية في إعادة التدوير التصاعدي والبحث العلمي المستدام، وساهم في تحويل النفايات وحفظ الموارد الطبيعية وفق متطلبات خدمة المجتمع المعتمدة.
              </p>
              <div className="flex items-center justify-between pt-3 text-[11px] text-slate-400 border-t border-slate-100">
                <span>الرقم المرجعي: ECO-VOL-{Math.floor(100000 + Math.random() * 900000)}</span>
                <span>تاريخ الاعتماد: {new Date().toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Feature Guide Modal */}
      <StudentPortalGuideModal 
        isOpen={isGuideModalOpen} 
        onClose={() => setIsGuideModalOpen(false)} 
      />

    </div>
  );
}
