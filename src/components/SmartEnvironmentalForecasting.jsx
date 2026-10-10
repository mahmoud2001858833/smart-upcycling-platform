import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Zap,
  Droplets,
  Car,
  Plane,
  Trash2,
  Users,
  Home,
  Utensils,
  ShoppingBag,
  Airplay,
  MapPin,
  Sun,
  TrendingDown,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Globe2,
  ChevronRight,
  Activity,
  Layers,
  Award
} from 'lucide-react';
import {
  JORDAN_REGIONS,
  FUEL_TYPES,
  ENERGY_SOURCES,
  calculateEnvironmentalForecast
} from '../utils/environmentalForecastingEngine.js';

export default function SmartEnvironmentalForecasting({ onNavigateToExpertChat, onConsultInline }) {
  // Form State initialized to exact sample numbers in the user image
  const [inputs, setInputs] = useState({
    electricityKwh: 500,
    waterLiters: 15000,
    carDistanceKm: 1000,
    flightsPerYear: 2,
    wasteKg: 50,
    recyclingRatePercent: 30,
    householdSize: 4,
    homeAreaSqm: 150,
    meatMealsPerWeek: 3,
    clothingPurchases: 5,
    acHoursDaily: 6,
    fuelType: 'gasoline_90',
    region: 'amman',
    energySource: 'grid'
  });

  const [activeScenario, setActiveScenario] = useState('current'); // 'current' | 'optimized' | 'extreme'

  const handleChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // Run Calculations
  const forecast = useMemo(() => {
    return calculateEnvironmentalForecast(inputs);
  }, [inputs]);

  // Scaled max value for regional chart
  const maxRegionalPerCapita = Math.max(...forecast.regionalComparison.map(r => Math.max(r.baselinePerCapita, r.userPerCapita)), 5);

  // Scaled max value for monthly trend curve
  const maxMonthlyKg = Math.max(...forecast.monthlyTrend.map(m => m.currentKg), 100);

  return (
    <div className="environmental-forecasting-view">
      {/* Header Banner */}
      <div className="forecast-header-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>محرك النمذجة البيئية والتنبؤ المناخي المتطور (Jordan & Global Scope 3)</span>
          </div>
          <h2>أداة التنبؤ البيئي الذكية وتحليل البصمة الشاملة</h2>
          <p>
            نمذجة رياضية قائمة على معاملات الشبكة الكهربائية الوطنية الأردنية (NEPCO) وبروتوكول غازات الاحتباس الحراري، 
            لحساب الانبعاث السنوي والشهري، وتوقع سيناريوهات التخفيض، ومقارنة البصمة مع محافظات المملكة والمعدلات العالمية.
          </p>
        </div>
      </div>

      <div className="forecast-layout-grid">
        {/* ==========================================
            LEFT / INPUT PANEL: إدخال بيانات الاستهلاك المتقدمة
            ========================================== */}
        <div className="forecast-input-panel">
          <div className="panel-header-box">
            <div className="panel-title-row">
              <Zap size={20} className="text-emerald" />
              <h3>إدخال بيانات الاستهلاك المتقدمة</h3>
            </div>
            <p className="panel-subtitle">11+ مدخلاً للحصول على تحليل كمي دقيق وتنبؤ مستقبلي</p>
          </div>

          <form className="forecast-form-grid" onSubmit={e => e.preventDefault()}>
            {/* Row 1: Electricity & Water */}
            <div className="input-group-field">
              <label>
                <Zap size={14} className="input-icon" />
                <span>استهلاك الكهرباء</span>
                <span className="unit-label">(ك.و.س/شهر)</span>
              </label>
              <input
                type="number"
                min="0"
                value={inputs.electricityKwh}
                onChange={e => handleChange('electricityKwh', Number(e.target.value) || 0)}
              />
            </div>

            <div className="input-group-field">
              <label>
                <Droplets size={14} className="input-icon" />
                <span>استهلاك المياه</span>
                <span className="unit-label">(لتر/شهر)</span>
              </label>
              <input
                type="number"
                min="0"
                value={inputs.waterLiters}
                onChange={e => handleChange('waterLiters', Number(e.target.value) || 0)}
              />
            </div>

            {/* Row 2: Car Distance & Flights */}
            <div className="input-group-field">
              <label>
                <Car size={14} className="input-icon" />
                <span>المسافة بالسيارة</span>
                <span className="unit-label">(كم/شهر)</span>
              </label>
              <input
                type="number"
                min="0"
                value={inputs.carDistanceKm}
                onChange={e => handleChange('carDistanceKm', Number(e.target.value) || 0)}
              />
            </div>

            <div className="input-group-field">
              <label>
                <Plane size={14} className="input-icon" />
                <span>رحلات الطيران سنوياً</span>
                <span className="unit-label">(رحلة)</span>
              </label>
              <input
                type="number"
                min="0"
                value={inputs.flightsPerYear}
                onChange={e => handleChange('flightsPerYear', Number(e.target.value) || 0)}
              />
            </div>

            {/* Row 3: Waste & Recycling % */}
            <div className="input-group-field">
              <label>
                <Trash2 size={14} className="input-icon" />
                <span>النفايات الشهرية</span>
                <span className="unit-label">(كغ/شهر)</span>
              </label>
              <input
                type="number"
                min="0"
                value={inputs.wasteKg}
                onChange={e => handleChange('wasteKg', Number(e.target.value) || 0)}
              />
            </div>

            <div className="input-group-field">
              <label>
                <Layers size={14} className="input-icon" />
                <span>نسبة إعادة التدوير</span>
                <span className="unit-label">(0-100%)</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={inputs.recyclingRatePercent}
                onChange={e => handleChange('recyclingRatePercent', Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
              />
            </div>

            {/* Row 4: Household size & Home area */}
            <div className="input-group-field">
              <label>
                <Users size={14} className="input-icon" />
                <span>عدد أفراد المنزل</span>
                <span className="unit-label">(فرد)</span>
              </label>
              <input
                type="number"
                min="1"
                value={inputs.householdSize}
                onChange={e => handleChange('householdSize', Math.max(1, Number(e.target.value) || 1))}
              />
            </div>

            <div className="input-group-field">
              <label>
                <Home size={14} className="input-icon" />
                <span>مساحة المنزل</span>
                <span className="unit-label">(م²)</span>
              </label>
              <input
                type="number"
                min="10"
                value={inputs.homeAreaSqm}
                onChange={e => handleChange('homeAreaSqm', Number(e.target.value) || 0)}
              />
            </div>

            {/* Row 5: Meat & Shopping */}
            <div className="input-group-field">
              <label>
                <Utensils size={14} className="input-icon" />
                <span>وجبات اللحم الأحمر أسبوعياً</span>
                <span className="unit-label">(وجبة)</span>
              </label>
              <input
                type="number"
                min="0"
                value={inputs.meatMealsPerWeek}
                onChange={e => handleChange('meatMealsPerWeek', Number(e.target.value) || 0)}
              />
            </div>

            <div className="input-group-field">
              <label>
                <ShoppingBag size={14} className="input-icon" />
                <span>مشتريات جديدة شهرياً</span>
                <span className="unit-label">(ملابس/أجهزة)</span>
              </label>
              <input
                type="number"
                min="0"
                value={inputs.clothingPurchases}
                onChange={e => handleChange('clothingPurchases', Number(e.target.value) || 0)}
              />
            </div>

            {/* Row 6: AC Hours & Fuel Type */}
            <div className="input-group-field">
              <label>
                <Airplay size={14} className="input-icon" />
                <span>ساعات تشغيل التكييف</span>
                <span className="unit-label">(ساعة/يوم)</span>
              </label>
              <input
                type="number"
                min="0"
                max="24"
                value={inputs.acHoursDaily}
                onChange={e => handleChange('acHoursDaily', Number(e.target.value) || 0)}
              />
            </div>

            <div className="input-group-field">
              <label>
                <Car size={14} className="input-icon" />
                <span>نوع الوقود للسيارة</span>
              </label>
              <select
                value={inputs.fuelType}
                onChange={e => handleChange('fuelType', e.target.value)}
              >
                {FUEL_TYPES.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            {/* Row 7: Region & Energy Source */}
            <div className="input-group-field">
              <label>
                <MapPin size={14} className="input-icon" />
                <span>الموقع الجغرافي (محافظات الأردن)</span>
              </label>
              <select
                value={inputs.region}
                onChange={e => handleChange('region', e.target.value)}
              >
                {JORDAN_REGIONS.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="input-group-field">
              <label>
                <Sun size={14} className="input-icon" />
                <span>مصدر الطاقة الرئيسي</span>
              </label>
              <select
                value={inputs.energySource}
                onChange={e => handleChange('energySource', e.target.value)}
              >
                {ENERGY_SOURCES.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </form>

          <div className="panel-footer-tip">
            <ShieldCheck size={16} className="text-emerald" />
            <span>يتم التحديث الرياضي لحظياً فور تغيير أي قيمة بدون الحاجة لإعادة التحميل.</span>
          </div>
        </div>

        {/* ==========================================
            RIGHT / OUTPUT ANALYTICS: النتائج والتنبؤات
            ========================================== */}
        <div className="forecast-results-panel">
          {/* Key Metric Highlights (KPI Cards) */}
          <div className="forecast-kpi-grid">
            <div className="kpi-card highlight-emerald">
              <div className="kpi-top">
                <span className="kpi-title">الانبعاث السنوي للمنزل</span>
                <Activity size={18} />
              </div>
              <div className="kpi-value-row">
                <span className="kpi-number">{forecast.totalAnnualHouseholdCo2Tonnes}</span>
                <span className="kpi-unit">طن CO₂e / سنة</span>
              </div>
              <div className="kpi-sub">
                <span>متوسط شهري: </span>
                <strong>{forecast.totalMonthlyHouseholdCo2Kg} كغ CO₂e</strong>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <span className="kpi-title">بصمة الفرد السنوية</span>
                <Users size={18} />
              </div>
              <div className="kpi-value-row">
                <span className="kpi-number">{forecast.perCapitaAnnualTonnes}</span>
                <span className="kpi-unit">طن / فرد</span>
              </div>
              <div className="kpi-sub">
                <span>مقارنة بالأردن ({forecast.jordanAvgTonnes} طن): </span>
                <strong className={forecast.diffFromJordanPercent > 0 ? 'text-danger' : 'text-success'}>
                  {forecast.diffFromJordanPercent > 0 ? `+${forecast.diffFromJordanPercent}%` : `${forecast.diffFromJordanPercent}%`}
                </strong>
              </div>
            </div>

            <div className="kpi-card highlight-blue">
              <div className="kpi-top">
                <span className="kpi-title">إمكانية التخفيض القصوى</span>
                <TrendingDown size={18} />
              </div>
              <div className="kpi-value-row">
                <span className="kpi-number">{forecast.potentialReductionPercent}%</span>
                <span className="kpi-unit">وفر كربوني</span>
              </div>
              <div className="kpi-sub">
                <span>وفر سنوي محتمل: </span>
                <strong>{forecast.potentialSavingsAnnualTonnes} طن CO₂e</strong>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <span className="kpi-title">المعدل العالمي (4.7 طن)</span>
                <Globe2 size={18} />
              </div>
              <div className="kpi-value-row">
                <span className="kpi-number">
                  {forecast.diffFromGlobalPercent > 0 ? `+${forecast.diffFromGlobalPercent}%` : `${forecast.diffFromGlobalPercent}%`}
                </span>
                <span className="kpi-unit">عن المعدل</span>
              </div>
              <div className="kpi-sub">
                <span>هدف اتفاقية باريس: </span>
                <strong>2.0 طن / فرد</strong>
              </div>
            </div>
          </div>

          {/* Section 1: توزيع الانبعاثات حسب الفئات (Breakdown by Category) */}
          <div className="forecast-card-section">
            <div className="section-title-wrap">
              <BarChart3 size={18} className="text-emerald" />
              <h4>توزيع الانبعاثات حسب الفئات والأنشطة</h4>
            </div>

            <div className="category-bars-list">
              {forecast.categories.map(cat => (
                <div key={cat.key} className="category-bar-row">
                  <div className="cat-header">
                    <span className="cat-label">{cat.label}</span>
                    <span className="cat-values">
                      <strong>{cat.monthlyKg} كغ/شهر</strong> ({cat.percent}%)
                    </span>
                  </div>
                  <div className="cat-progress-track">
                    <div
                      className="cat-progress-fill"
                      style={{
                        width: `${Math.min(cat.percent, 100)}%`,
                        backgroundColor: cat.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: منحنى تطور وتوقع البصمة الكربونية خلال 12 شهراً (Seasonal Forecast Curve) */}
          <div className="forecast-card-section">
            <div className="section-title-wrap">
              <TrendingUp size={18} className="text-emerald" />
              <h4>منحنى التطور والتنبؤ الموسمي للبصمة الكربونية (12 شهراً)</h4>
            </div>
            <p className="section-desc">
              يوضح التحليل الموسمي ذروة الانبعاثات في أشهر الصيف (التكييف في الأردن) والشتاء (التدفئة)، مع مقارنة السيناريو الحالي مقابل السيناريو المُحسّن:
            </p>

            <div className="trend-chart-container">
              <div className="trend-bars-wrapper">
                {forecast.monthlyTrend.map(m => {
                  const currentH = (m.currentKg / maxMonthlyKg) * 100;
                  const optimizedH = (m.optimizedKg / maxMonthlyKg) * 100;

                  return (
                    <div key={m.month} className="trend-col">
                      <div className="col-bars">
                        <div
                          className="trend-bar bar-current"
                          style={{ height: `${Math.max(currentH, 8)}%` }}
                          title={`الوضع الحالي: ${m.currentKg} كغ CO₂e`}
                        />
                        <div
                          className="trend-bar bar-optimized"
                          style={{ height: `${Math.max(optimizedH, 6)}%` }}
                          title={`الوضع المحسن: ${m.optimizedKg} كغ CO₂e`}
                        />
                      </div>
                      <span className="month-tag">{m.month}</span>
                    </div>
                  );
                })}
              </div>

              <div className="chart-legend-row">
                <div className="legend-item">
                  <span className="legend-color-dot current" />
                  <span>السيناريو الحالي (معاملات الاستهلاك الراهنة)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color-dot optimized" />
                  <span>سيناريو الاستدامة المقترح (-{forecast.potentialReductionPercent}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: مقارنة الانبعاثات حسب مناطق ومحافظات الأردن */}
          <div className="forecast-card-section">
            <div className="section-title-wrap">
              <MapPin size={18} className="text-emerald" />
              <h4>مقارنة البصمة الكربونية الفردية عبر محافظات المملكة الأردنية الهاشمية</h4>
            </div>
            <p className="section-desc">
              مقارنة بصمتك الفردية الحالية ({forecast.perCapitaAnnualTonnes} طن) مع المتوسط الإحصائي الموثق لكل محافظة:
            </p>

            <div className="regional-grid">
              {forecast.regionalComparison.map(r => {
                const barPercent = (r.baselinePerCapita / maxRegionalPerCapita) * 100;
                return (
                  <div key={r.id} className={`regional-card ${r.isUserRegion ? 'active-region' : ''}`}>
                    <div className="reg-top">
                      <span className="reg-name">
                        {r.name}
                        {r.isUserRegion && <span className="active-tag">منطقتك</span>}
                      </span>
                      <strong className="reg-stat">{r.baselinePerCapita} طن</strong>
                    </div>
                    <div className="reg-progress-bg">
                      <div
                        className="reg-progress-bar"
                        style={{ width: `${barPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: رؤى وتوصيات الذكاء الاصطناعي الذكية (AI Insights & Direct Action Plan) */}
          <div className="forecast-card-section ai-insights-box">
            <div className="section-title-wrap">
              <Lightbulb size={20} className="text-amber" />
              <h4>رؤى الذكاء الاصطناعي وخارطة طريق العمل البيئي</h4>
            </div>

            <div className="insights-list">
              <div className="insight-item">
                <CheckCircle2 size={18} className="text-emerald shrink-0" />
                <div>
                  <strong>إعادة تدوير وإعادة استخدام النفايات المنزلية (Upcycling):</strong>
                  <p>
                    رفع نسبة التدوير من {inputs.recyclingRatePercent}% إلى 75% عبر مشاريع منصة مُدام يوفر قرابة{' '}
                    <strong>{Math.round(inputs.wasteKg * 0.45 * 12)} كغ من CO₂e سنوياً</strong>، ويمنع انبعاث غاز الميثان في المرادم البلدية.
                  </p>
                </div>
              </div>

              <div className="insight-item">
                <CheckCircle2 size={18} className="text-emerald shrink-0" />
                <div>
                  <strong>كفاءة التكييف والطاقة في {forecast.selectedRegion.name}:</strong>
                  <p>
                    ضبط درجة حرارة المكيف عند 24°C بدلاً من 20°C وتنظيف الفلاتر أسبوعياً يخفض استهلاك الكهرباء بنسبة{' '}
                    <strong>18% فورياً</strong> ويوفر نحو <strong>{Math.round(inputs.electricityKwh * 0.18 * 12 * 0.5)} كغ CO₂e</strong>.
                  </p>
                </div>
              </div>

              <div className="insight-item">
                <CheckCircle2 size={18} className="text-emerald shrink-0" />
                <div>
                  <strong>إدارة المياه وحصاد مياه الأمطار:</strong>
                  <p>
                    نظراً لأن ضخ المياه في الأردن يتطلب طاقة ضخ عالية من حوض الديسي، فإن خفض 3000 لتر شهرياً يقلل الانبعاثات ويوفر فاتورة المياه بنسبة 20%.
                  </p>
                </div>
              </div>
            </div>

            <div className="insights-cta-row">
              <button
                type="button"
                className="btn-consult-expert-action"
                onClick={() => {
                  const queryText = `أريد استشارة حول بصمتي الكربونية في ${forecast.selectedRegion.name}: إجمالي انبعاثاتي ${forecast.totalAnnualHouseholdCo2Tonnes} طن سنوياً، ونسبة التدوير لدي ${inputs.recyclingRatePercent}%. كيف أستفيد من منصة مُدام للوصول إلى خفض ${forecast.potentialReductionPercent}%؟`;
                  const forecastingContext = {
                    name: `خطة التنبؤ البيئي وخفض الانبعاثات (${forecast.selectedRegion.name})`,
                    title: `خطة التنبؤ البيئي وخفض الانبعاثات (${forecast.selectedRegion.name})`,
                    materials: `كهرباء ${inputs.electricityKwh} ك.و.س/شهر، ماء ${inputs.waterLiters} لتر/شهر، نفايات ${inputs.wasteKg} كغ/شهر، سيارة ${inputs.carDistanceKm} كم/شهر (${inputs.fuelType})، نسبة تدوير ${inputs.recyclingRatePercent}%`,
                    totalCo2: forecast.totalAnnualHouseholdCo2Tonnes,
                    reductionTarget: forecast.potentialReductionPercent,
                    region: forecast.selectedRegion.name
                  };
                  if (onConsultInline) {
                    onConsultInline(queryText, forecastingContext);
                  } else if (onNavigateToExpertChat) {
                    onNavigateToExpertChat(queryText);
                  }
                }}
              >
                <Sparkles size={16} />
                <span>استشارة خبير الاستدامة الذكي حول خطة التخفيض (فوري بنفس الصفحة)</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
