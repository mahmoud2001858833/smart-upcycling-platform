import React, { useState } from 'react';
import { ImageIcon, RefreshCw, Sparkles } from 'lucide-react';
import { useAiHero } from '../hooks/useProjectAiImages.js';
import { generateSvgBlueprint, handleImageFallback } from '../utils/imageCatalog.js';

const VIEW_LABEL = {
  finished: 'المنتج النهائي',
  assembly: 'القطع والأدوات',
  inUse: 'في الاستخدام'
};

/**
 * Picture with a proper loading state.
 *  - loading: branded shimmer skeleton (never an unrelated stock photo)
 *  - ready:   fades in
 *  - error:   drawn blueprint fallback + retry
 */
export function AiImage({ src, alt = '', status = 'ready', fallback, onRetry, label, className = '', imgClassName = '' }) {
  const [loadedSrc, setLoadedSrc] = useState(null);
  const shown = Boolean(src) && loadedSrc === src;

  const loading = status === 'loading' && !src;
  const failed = status === 'error' && !src;

  return (
    <div className={`ai-img ${loading ? 'is-loading' : ''} ${failed ? 'is-failed' : ''} ${className}`}>
      {loading && (
        <div className="ai-img-skeleton" role="status" aria-label="جاري رسم الصورة">
          <span className="ai-img-skeleton-icon"><Sparkles size={22} /></span>
          <span className="ai-img-skeleton-text">{label || 'جاري رسم الصورة بالذكاء الاصطناعي…'}</span>
        </div>
      )}

      {(src || failed) && (
        <img
          src={src || fallback}
          alt={alt}
          className={`ai-img-el ${imgClassName} ${shown || failed ? 'is-shown' : ''}`}
          onLoad={() => setLoadedSrc(src)}
          decoding="async"
        />
      )}

      {failed && (
        <button type="button" className="ai-img-retry" onClick={onRetry}>
          <RefreshCw size={13} />
          <span>تعذر توليد الصورة — إعادة المحاولة</span>
        </button>
      )}
    </div>
  );
}

/**
 * Cover image for a project in list views. AI projects use the generated picture;
 * legacy/fallback projects keep their curated gallery.
 */
export function ProjectCover({ project, view = 'finished', className = '', imgClassName = '' }) {
  const hero = useAiHero(project, view);

  if (!hero.isAi || !hero.url) {
    // no AI picture yet (it is generated on demand from the project page): show the drawn blueprint, never a stock photo
    const url = hero.isAi ? null : (project?.gallery?.[view] || project?.generatedImage);
    return (
      <div className={`ai-img ${className}`}>
        <img
          src={url || generateSvgBlueprint(project?.name, project?.materials, view)}
          alt={project?.name || ''}
          className={`ai-img-el is-shown ${imgClassName}`}
          loading="lazy"
          onError={(e) => handleImageFallback(e, project?.name, project?.materials, view)}
        />
      </div>
    );
  }

  return (
    <AiImage
      src={hero.url}
      status={hero.status}
      alt={project.name}
      className={className}
      imgClassName={imgClassName}
      fallback={generateSvgBlueprint(project.name, project.materials, view)}
    />
  );
}

export function ViewThumb({ project, view, active, onClick }) {
  const hero = useAiHero(project, view);
  const legacy = !hero.isAi ? (project?.gallery?.[view] || project?.generatedImage) : null;
  const src = hero.url || legacy;
  return (
    <button type="button" className={`angle-thumb ${active ? 'active' : ''}`} onClick={onClick} aria-pressed={active}>
      <span className="angle-thumb-media">
        {src ? <img src={src} alt="" loading="lazy" /> : <span className="angle-thumb-ph"><ImageIcon size={16} /></span>}
      </span>
      <span className="angle-thumb-label">{VIEW_LABEL[view]}</span>
    </button>
  );
}
