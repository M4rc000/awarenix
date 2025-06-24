import { useState, useEffect } from 'react';
import ModernAlert from './../ui/alert/ModernAlert';

let alertQueue: AlertConfig[] = [];
let setAlertsCallback: ((alerts: AlertConfig[]) => void) | null = null;

interface AlertConfig {
  id: number;
  title?: string;
  text?: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  duration?: number;
  showCloseButton?: boolean;
}

interface SwalConfig {
  title?: string;
  text?: string;
  icon?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  showCloseButton?: boolean;
}

const Swal = {
  fire: (config: SwalConfig | string) => {
    if (typeof config === 'string') {
      config = { text: config };
    }
    
    const iconMap: Record<string, 'info' | 'success' | 'warning' | 'danger'> = {
      'success': 'success',
      'error': 'danger',
      'warning': 'warning',
      'info': 'info'
    };
    
    const alertConfig: AlertConfig = {
      id: Date.now() + Math.random(),
      title: config.title,
      text: config.text,
      type: iconMap[config.icon || 'info'],
      duration: config.duration,
      showCloseButton: config.showCloseButton !== false
    };
    
    alertQueue.push(alertConfig);
    if (setAlertsCallback) {
      setAlertsCallback([...alertQueue]);
    }
  }
};

export const AlertContainer = () => {
  const [alerts, setAlerts] = useState<AlertConfig[]>([]);
  
  useEffect(() => {
    setAlertsCallback = setAlerts;
    return () => { 
      setAlertsCallback = null; 
    };
  }, []);
  
  const removeAlert = (id: number) => {
    alertQueue = alertQueue.filter(alert => alert.id !== id);
    setAlerts([...alertQueue]);
  };
  
  return (
    <div className="fixed top-20 right-5 z-[99999] space-y-2 w-full">
      {alerts.map((alert, index) => (
        <div key={alert.id} style={{ transform: `translateY(${index * 60}px)` }}>
          <ModernAlert
            type={alert.type}
            duration={alert.duration}
            onDismiss={() => removeAlert(alert.id)}
          >
            {alert.title && <div className="font-semibold mb-1">{alert.title}</div>}
            {alert.text}
          </ModernAlert>
        </div>
      ))}
    </div>
  );
};

export default Swal;