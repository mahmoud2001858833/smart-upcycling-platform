import React from 'react';
import { Activity, AlertTriangle, Info } from 'lucide-react';

/** Tells the student, before they press the button, how many projects they can get right now. */
export default function CapacityBanner({ capacity }) {
  if (!capacity || capacity.level === 'normal') return null;
  const closed = capacity.level === 'closed';
  const Icon = closed ? AlertTriangle : capacity.level === 'heavy' ? Activity : Info;
  return (
    <div className={`capacity-banner is-${capacity.level}`} role="status" data-testid="capacity-banner">
      <Icon size={18} />
      <div>
        <strong>
          {closed ? 'التوليد متوقف مؤقتاً' : `سننتج لك ${capacity.projects} ${capacity.projects === 1 ? 'مشروعاً' : 'مشاريع'} الآن بدل ${capacity.maxProjects}`}
        </strong>
        {capacity.message && <p>{capacity.message}</p>}
        {!closed && !capacity.imagesAllowed && <p>توليد الصور متوقف مؤقتاً، لكن المشروع وخطواته كاملة.</p>}
      </div>
    </div>
  );
}
