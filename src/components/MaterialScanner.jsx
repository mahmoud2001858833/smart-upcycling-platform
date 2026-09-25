import React, { useState } from 'react';
import { 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Sliders, 
  Camera
} from 'lucide-react';

export default function MaterialScanner({ 
  currentScenario, 
  materials, 
  onUpdateQuantity, 
  totalMassKg,
  onAnalyzeCustomText
}) {
  const [inputText, setInputText] = useState(currentScenario?.rawText || '');
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccessMsg, setScanSuccessMsg] = useState(null);

  // Simulated AI Image / Text Scanner
  const handleSimulateScan = (e) => {
    e?.preventDefault();
    setIsScanning(true);
    setScanSuccessMsg(null);

    setTimeout(() => {
      setIsScanning(false);
      setScanSuccessMsg("تم التعرف بنجاح على البوليمرات والألياف بنسبة تطابق 98.4% وفق المعايير الدولية.");
      onAnalyzeCustomText(inputText);
    }, 1200);
  };

  return (
    <div className="scanner-section">
      {/* Left Box: Input Channels & Image Drop */}
      <div className="glass-card glow-card scanner-input-box">
        <div className="section-heading">
          <h3>
            <Camera size={22} color="#10b981" />
            <span>وحدة مسح واستقبال الخامات (Multimodal Intake)</span>
          </h3>
          <span className="badge badge-emerald">AI Vision Ready</span>
        </div>

        <p style={{ fontSize: '0.88rem' }}>
          قم برفع صور للمخلفات المنزلية أو كتابة وصف حر بالمواد المتوفرة لديك (مثل: عبوات بلاستيكية، صناديق كرتون، أقمشة قديمة).
        </p>

        {/* Dropzone with AI Vision scan simulation */}
        <div 
          className={`dropzone-area ${isScanning ? 'drag-over' : ''}`}
          onClick={handleSimulateScan}
        >
          <div className="dropzone-icon">
            <UploadCloud size={28} />
          </div>
          <div>
            <h5 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
              اسحب وأفلت صور المخلفات هنا، أو انقر للتحليل الذكي
            </h5>
            <p style={{ fontSize: '0.78rem' }}>
              يدعم خوارزميات تصنيف البوليمرات والمعادن (PET, Cardboard, Cotton, Steel, Glass)
            </p>
          </div>
        </div>

        {/* Scanning Laser Animation */}
        {isScanning && (
          <div className="scanning-active-box">
            <div className="scanning-laser-line"></div>
            <p style={{ fontSize: '0.85rem', color: 'var(--cyan-400)', fontWeight: 700 }}>
              جاري مسح الطيف اللوني وتحليل كثافة المواد والتعرف على كود إعادة التدوير...
            </p>
          </div>
        )}

        {/* Free Text Input Form */}
        <form onSubmit={handleSimulateScan} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            أو اكتب وصفاً تفصيلياً للمخلفات:
          </label>
          <textarea 
            className="text-input-field"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="مثال: 3 plastic soda bottles (1.5L), 2 cardboard boxes, old denim jeans..."
            rows={2}
          />

          <button 
            type="submit" 
            className="btn-submit-action"
            disabled={isScanning}
          >
            <Sparkles size={18} />
            <span>تشغيل خبير التعرف على الخامات والأوزان</span>
          </button>
        </form>

        {scanSuccessMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald-400)', fontSize: '0.82rem' }}>
            <CheckCircle2 size={16} />
            <span>{scanSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Right Box: Classified Materials Breakdown Card */}
      <div className="glass-card glow-card materials-detected-box">
        <div className="section-heading">
          <h3>
            <Sliders size={22} color="#06b6d4" />
            <span>المواد المكتشفة وتأكيد الأوزان المعيارية</span>
          </h3>
          <span className="badge badge-cyan">{materials.length} خامات مفحوصة</span>
        </div>

        <p style={{ fontSize: '0.85rem' }}>
          يقوم المحرك بتقدير الكتلة التجريبية تلقائياً. يمكنك تعديل الكميات للتأكيد الدقيق:
        </p>

        {/* List of Detected Materials */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
          {materials.map((mat) => (
            <div key={mat.id} className="material-item-row">
              <div className="material-item-info">
                <span 
                  className="material-color-dot" 
                  style={{ backgroundColor: mat.color || '#10b981' }} 
                />
                <div className="material-item-details">
                  <h5>{mat.name}</h5>
                  <p>{mat.nameEn} • كود: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan-400)' }}>{mat.code}</span></p>
                </div>
              </div>

              <div className="material-item-adjuster">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <button 
                    type="button"
                    className="adjust-btn"
                    onClick={() => onUpdateQuantity(mat.id, Math.max(1, mat.quantity - 1))}
                    title="تقليل الكمية"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="quantity-display">{mat.quantity}</span>
                  <button 
                    type="button"
                    className="adjust-btn"
                    onClick={() => onUpdateQuantity(mat.id, mat.quantity + 1)}
                    title="زيادة الكمية"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <span className="mass-weight-badge">
                  {(mat.massKg * 1000).toFixed(0)} g
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Total Diverted Mass Summary Bar */}
        <div className="total-mass-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={18} color="#10b981" />
            <span className="label">إجمالي النفايات المحولة عن المطامر:</span>
          </div>
          <span className="val">{totalMassKg.toFixed(3)} kg ({Math.round(totalMassKg * 1000)} g)</span>
        </div>
      </div>
    </div>
  );
}
