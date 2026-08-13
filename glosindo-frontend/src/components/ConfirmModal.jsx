import { useEffect } from 'react';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import Button from './ui/Button';

const typeStyles = {
  danger: {
    icon: <AlertTriangle className="w-8 h-8 text-rose-600" />,
    bgColor: 'bg-rose-100',
    buttonVariant: 'danger',
  },
  warning: {
    icon: <AlertCircle className="w-8 h-8 text-amber-600" />,
    bgColor: 'bg-amber-100',
    buttonVariant: 'secondary',
  },
  info: {
    icon: <Info className="w-8 h-8 text-brand-navy" />,
    bgColor: 'bg-blue-100',
    buttonVariant: 'primary',
  },
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Ya', cancelText = 'Batal', type = 'danger' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const styles = typeStyles[type] || typeStyles.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full animate-scaleIn overflow-hidden border border-slate-200">
        <div className="flex justify-center pt-8 pb-4">
          <div className={`${styles.bgColor} rounded-2xl p-4 shadow-sm`}>
            {styles.icon}
          </div>
        </div>

        <div className="px-6 pb-6 text-center">
          <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
          <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">{message}</p>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <Button
            variant="outline"
            size="md"
            fullWidth
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            variant={styles.buttonVariant}
            size="md"
            fullWidth
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
