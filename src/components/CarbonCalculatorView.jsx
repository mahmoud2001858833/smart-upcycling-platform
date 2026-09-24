import React from 'react';
import { 
  Calculator, 
  Smartphone, 
  Car, 
  TreePine, 
  Lightbulb, 
  Award, 
  Info, 
  ArrowUpRight,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

export default function CarbonCalculatorView({ lcaResults, onOpenCertificate }) {
  if (!lcaResults) return null;

  const {
    totalMassKg,
    totalMassGrams,
    totalVirginAvoided,
    totalLandfillAvoided,
    totalProcessEmissions,
    totalNetOffsetKg,
    equivalences,
    itemizedResults,
  } = lcaResults;

  // Max value for comparative bar scaling
  const maxBarVal = Math.max(totalVirginAvoided, totalLandfillAvoided, totalNetOffsetKg, 1);

  return (
    <div className="calculator-section">
      <div className="glass-card glow-card calculator-box">
        {/* Section Header */}
        <div className="section-heading" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem' }}>
              <Calculator size={24} color="#10b981" />
              <span>حاسبة الأثر الكربوني العلمية (LCA Carbon Calculator)</span>
            </h3>
            <p style={{ fontSize: '0.88rem' }}>
              حسابات رياضية دقيقة معتمدة على مبادئ تقييم دورة الحياة القياسية (ISO 14040/14044) ومصادر الانبعاثات الدولية:
            </p>
          </div>

          <button 
            type="button" 
            className="btn-submit-action"
            onClick={onOpenCertificate}
          >
            <Award size={18} />
            <span>استخراج شهادة الأثر البيئي</span>
          </button>
        </div>

        {/* LCA Mathematical Formula Banner */}
        <div className="lca-formula-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem' }}>
            <Info size={16} color="#10b981" />
            <span>معادلة تقييم الأثر المباشر لدورة الحياة (Net Greenhouse Gas Abatement):</span>
          </div>
          <div className="formula-math">
            ΔCO₂e = (Emissions_virgin + Emissions_landfill_avoided) - Emissions_process
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            تحتسب المعادلة بصمة استخراج وتصنيع المواد البكرة مضافاً إليها انبعاثات الميثان اللاهوائي في مكبات النفايات، مطروحاً منها الطاقة اليدوية المحدودة للتدوير المنزلي.
          </p>
        </div>

        {/* Big Counter Stat Cards */}
        <div className="carbon-counters-grid">
          <div className="counter-stat-card highlight">
            <div className="stat-card-top">
              <span>صافي الكربون المتفادى</span>
              <span className="badge badge-emerald">Net Abated</span>
            </div>
            <div className="stat-big-number">
              +{totalNetOffsetKg.toFixed(3)}
              <span className="stat-unit">kg CO₂e</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--emerald-400)' }}>
              إجمالي الانبعاثات المحمية من الغلاف الجوي
            </p>
          </div>

          <div className="counter-stat-card">
            <div className="stat-card-top">
              <span>كتلة النفايات المُحوّلة</span>
              <span className="badge badge-cyan">Diverted Waste</span>
            </div>
            <div className="stat-big-number">
              {totalMassKg.toFixed(3)}
              <span className="stat-unit">kg</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              ما يعادل {totalMassGrams} جرام من المكبات
            </p>
          </div>

          <div className="counter-stat-card">
            <div className="stat-card-top">
              <span>انبعاثات الإنتاج البكر</span>
              <span className="badge badge-cyan">Virgin Avoided</span>
            </div>
            <div className="stat-big-number" style={{ color: '#60a5fa' }}>
              +{totalVirginAvoided.toFixed(3)}
              <span className="stat-unit">kg CO₂e</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              وفر استخراج وتكرير المواد الخام الجديدة
            </p>
          </div>

          <div className="counter-stat-card">
            <div className="stat-card-top">
              <span>انبعاثات المطامر والميثان</span>
              <span className="badge badge-amber">Landfill Avoided</span>
            </div>
            <div className="stat-big-number" style={{ color: 'var(--amber-400)' }}>
              +{totalLandfillAvoided.toFixed(3)}
              <span className="stat-unit">kg CO₂e</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              منع تولد غاز الميثان (CH₄) عالي الاحترار
            </p>
          </div>
        </div>

        {/* Real World Equivalencies Grid */}
        <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={20} color="#06b6d4" />
          <span>المكافئ الواقعي للأثر البيئي (Empirical Real-World Equivalencies):</span>
        </h4>

        <div className="equivalencies-grid">
          <div className="equiv-card">
            <div className="equiv-icon">
              <Smartphone size={22} />
            </div>
            <div className="equiv-info">
              <h5>{equivalences.smartphoneCharges.toLocaleString()} مرة</h5>
              <p>شحن كامل لهاتف ذكي حديث (EPA WARM)</p>
            </div>
          </div>

          <div className="equiv-card">
            <div className="equiv-icon" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa' }}>
              <Car size={22} />
            </div>
            <div className="equiv-info">
              <h5>{equivalences.carKmAvoided} كم</h5>
              <p>قيادة سيارة بنزين متوسطة (DEFRA GHG)</p>
            </div>
          </div>

          <div className="equiv-card">
            <div className="equiv-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#34d399' }}>
              <TreePine size={22} />
            </div>
            <div className="equiv-info">
              <h5>{equivalences.treeDaysEquivalent} يوم</h5>
              <p>امتصاص شجرة حضرية كاملة للغازات</p>
            </div>
          </div>

          <div className="equiv-card">
            <div className="equiv-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24' }}>
              <Lightbulb size={22} />
            </div>
            <div className="equiv-info">
              <h5>{equivalences.ledHoursEquivalent.toLocaleString()} ساعة</h5>
              <p>إنارة مصباح LED بقوة 10 وات</p>
            </div>
          </div>
        </div>

        {/* Emissions Breakdown Comparative Bar */}
        <div className="breakdown-chart-box">
          <h4>مقارنة تدفق الانبعاثات لدورة الحياة (Lifecycle Carbon Balance)</h4>
          <div className="bar-breakdown-wrapper">
            <div className="breakdown-bar-row">
              <div className="bar-label-group">
                <span>توفير الإنتاج البكر (Virgin Material Footprint)</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#60a5fa' }}>+{totalVirginAvoided.toFixed(3)} kg CO₂e</span>
              </div>
              <div className="bar-track">
                <div 
                  className="bar-fill fill-virgin" 
                  style={{ width: `${Math.min(100, (totalVirginAvoided / maxBarVal) * 100)}%` }}
                />
              </div>
            </div>

            <div className="breakdown-bar-row">
              <div className="bar-label-group">
                <span>توفير التحلل في المدافن (Landfill Avoidance)</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>+{totalLandfillAvoided.toFixed(3)} kg CO₂e</span>
              </div>
              <div className="bar-track">
                <div 
                  className="bar-fill fill-landfill" 
                  style={{ width: `${Math.min(100, (totalLandfillAvoided / maxBarVal) * 100)}%` }}
                />
              </div>
            </div>

            <div className="breakdown-bar-row">
              <div className="bar-label-group">
                <span>انبعاثات المعالجة اليدوية (DIY Processing Energy)</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#f87171' }}>-{totalProcessEmissions.toFixed(3)} kg CO₂e</span>
              </div>
              <div className="bar-track">
                <div 
                  className="bar-fill fill-process" 
                  style={{ width: `${Math.min(100, Math.max(2, (totalProcessEmissions / maxBarVal) * 100))}%` }}
                />
              </div>
            </div>

            <div className="breakdown-bar-row">
              <div className="bar-label-group" style={{ fontWeight: 700 }}>
                <span style={{ color: 'var(--emerald-400)' }}>صافي الانبعاثات المتفاداة الإجمالي (Net Abated)</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)' }}>+{totalNetOffsetKg.toFixed(3)} kg CO₂e</span>
              </div>
              <div className="bar-track">
                <div 
                  className="bar-fill fill-net" 
                  style={{ width: `${Math.min(100, (totalNetOffsetKg / maxBarVal) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Table Breakdown */}
        <h4 style={{ fontSize: '1.05rem', marginBottom: '0.8rem' }}>تفصيل الحسابات والمعايير لكل خامة مفحوصة:</h4>
        <div className="lca-table-responsive">
          <table className="lca-table">
            <thead>
              <tr>
                <th>المادة المصنفة</th>
                <th>كود المصدر (البكر)</th>
                <th>معامل الانبعاث (البكر)</th>
                <th>كود المصدر (المرادم)</th>
                <th>معامل المرادم</th>
                <th>الكتلة</th>
                <th>صافي الوفر الكربوني</th>
              </tr>
            </thead>
            <tbody>
              {itemizedResults.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.authority}</div>
                  </td>
                  <td>
                    <span className="src-id-badge">{item.sourceId}</span>
                  </td>
                  <td>
                    <span className="emission-factor-val">{item.virginFactor.toFixed(2)} kg CO₂e/kg</span>
                  </td>
                  <td>
                    <span className="src-id-badge">{item.landfillSourceId}</span>
                  </td>
                  <td>
                    <span className="emission-factor-val">{item.landfillFactor.toFixed(2)} kg CO₂e/kg</span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {item.massKg.toFixed(3)} kg
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)', fontWeight: 800 }}>
                      +{item.netOffsetKg.toFixed(3)} kg CO₂e
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
