
import { useState, useEffect } from 'react';
import { Info, AlertTriangle, CheckCircle } from 'lucide-react';

type ModernAlertProps = {
  type?: 'info' | 'danger' | 'success' | 'warning';
  children: React.ReactNode;
  onDismiss?: () => void;
  duration?: number | null;
  className?: string;
};

const ModernAlert = ({ 
  type = 'info', 
  children, 
  onDismiss,
  duration = null,
  className = '' 
}: ModernAlertProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  useEffect(() => {
    if (duration && duration > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  if (!isVisible) return null;

  const alertConfig = {
    info: {
      bgColor: 'bg-slate-800',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-400',
      icon: Info
    },
    danger: {
      bgColor: 'bg-slate-800',
      borderColor: 'border-red-500',
      textColor: 'text-red-400',
      icon: AlertTriangle
    },
    success: {
      bgColor: 'bg-slate-800',
      borderColor: 'border-green-500',
      textColor: 'text-green-400',
      icon: CheckCircle
    },
    warning: {
      bgColor: 'bg-slate-800',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-400',
      icon: AlertTriangle
    }
  };

  const config = alertConfig[type];
  const IconComponent = config.icon;

  return (
    <div className={`
      ${config.bgColor} 
      ${config.borderColor} 
      p-3
      lg:p-3
      xl:p-3
      xl:ml-[15rem]
      flex 
      items-center 
      justify-between 
      rounded-md
      overflow-hidden
      fixed
      top-4
      right-5
      z-50
      dark:bg-white
      w-auto
      min-w-52
      max-w-full
      pr-8
      shadow-lg 
      ${className}
    `}>
      {/* Animated top border */}
      {duration && isAnimating && (
        <div 
          className={`absolute top-0 left-0 h-1 ${config.borderColor.replace('border-', 'bg-')} transition-all ease-linear`}
          style={{
            width: '100%',
            animation: `shrinkBorder ${duration}ms linear forwards`
          }}
        />
      )}
      
      <div className="flex items-center space-x-2 sm:space-x-3 max-w-[100vw]">
        <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${config.textColor} flex-shrink-0`} />
        <div className={`${config.textColor} text-xs sm:text-sm break-words`}>
          {children}
        </div>
      </div>
      
      
      {/* CSS Animation */}
      <style>{`
        @keyframes shrinkBorder {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default ModernAlert;