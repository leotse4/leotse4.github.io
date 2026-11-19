import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

export default function PlannerDialog({ title, onClose, children, wide = false }) {
  const ref = useRef(null), titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return <dialog ref={ref} className={`mp-dialog${wide ? ' mp-dialog-wide' : ''}`} aria-labelledby={titleId} onCancel={onClose}>
    <div className="mp-dialog-heading"><h2 id={titleId}>{title}</h2><button type="button" className="mp-icon" aria-label="Close dialog" onClick={onClose}><X size={20} /></button></div>
    {children}
  </dialog>;
}
