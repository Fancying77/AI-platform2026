import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useApp } from '../store/AppContext';

const iconMap = {
  success: <CheckCircle className="text-green-500" size={16} aria-hidden="true" />,
  error: <XCircle className="text-red-500" size={16} aria-hidden="true" />,
  warning: <AlertTriangle className="text-yellow-500" size={16} aria-hidden="true" />,
  info: <Info className="text-blue-500" size={16} aria-hidden="true" />,
};

const bgMap = {
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  warning: 'bg-yellow-50 border-yellow-200',
  info: 'bg-blue-50 border-blue-200',
};

export default function Toast() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed top-4 right-4 z-50 flex flex-col gap-2"
      role="region"
      aria-label="通知消息"
      aria-live="polite"
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          role="alert"
          className={`flex items-center gap-3 px-4 py-3 rounded-card border shadow-lg animate-slide-in ${bgMap[toast.type]}`}
        >
          {iconMap[toast.type]}
          <span className="text-sm text-text-primary">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 text-text-tertiary hover:text-text-primary"
            aria-label="关闭通知"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
