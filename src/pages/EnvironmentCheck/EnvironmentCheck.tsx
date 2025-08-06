import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw, Server, Clock, AlertTriangle, Activity } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  icon: React.ElementType;
  endpoint: string;
  category: string;
  timeout: number;
  criticalService: boolean;
}

interface ServiceStatus extends Service {
  status: 'Running' | 'Stop' | 'Checking';
  responseTime?: number;
  lastChecked?: Date;
  message?: string;
  checks?: {
    database?: {
      healthy: boolean;
      status: string;
      error?: string;
      connections?: string;
    };
  };
}

interface Alert {
  id: string;
  service: string;
  message: string;
  timestamp: Date;
  severity: 'critical' | 'warning' | 'info';
}

export default function EnvironmentCheck() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);

  // Enhanced service configuration
  const serviceConfig: Service[] = [
    { 
      id: 'api-gateway', 
      name: 'API Gateway', 
      icon: Server, 
      endpoint: 'http://localhost:3000',
      category: 'Core Services',
      timeout: 5000,
      criticalService: true
    },
  ];

  // Enhanced health check with timeout and better error handling
  const checkServiceHealth = async (service: Service): Promise<ServiceStatus> => {
    const startTime = performance.now();
    
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), service.timeout);
      
      const response = await fetch(`${service.endpoint}/health`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      const responseTime = Math.round(performance.now() - startTime);

      if (response.ok) {
        return {
          ...service,
          status: data.status || 'Running',
          responseTime,
          lastChecked: new Date(),
          message: data.message || 'Service is operational',
          checks: data.checks
        };
      } else {
        return {
          ...service,
          status: data.status || 'Stop',
          responseTime,
          lastChecked: new Date(),
          message: data.message || `HTTP ${response.status}: ${response.statusText}`,
          checks: data.checks
        };
      }
    } catch (error) {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      let message = 'Failed to connect to service';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          message = `Request timeout after ${service.timeout}ms`;
        } else {
          message = error.message;
        }
      }
      
      return {
        ...service,
        status: 'Stop',
        responseTime,
        lastChecked: new Date(),
        message
      };
    }
  };

  // Generate alerts based on service status
  const generateAlerts = (newServices: ServiceStatus[]) => {
    const newAlerts: Alert[] = [];
    
    newServices.forEach(service => {
      if (service.status === 'Stop') {
        const severity = service.criticalService ? 'critical' : 'warning';
        newAlerts.push({
          id: `${service.id}-${Date.now()}`,
          service: service.name,
          message: service.message || 'Service is down',
          timestamp: new Date(),
          severity
        });
      }
    });
    
    // Keep only last 10 alerts
    setAlerts(prev => [...newAlerts, ...prev].slice(0, 10));
  };

  const runHealthChecks = async () => {
    setIsLoading(true);
    
    // Set all services to checking state
    setServices(prev => prev.map(service => ({ ...service, status: 'Checking' as const })));
    
    try {
      const results = await Promise.all(
        serviceConfig.map(service => checkServiceHealth(service))
      );
      
      setServices(results);
      setLastChecked(new Date());
      generateAlerts(results);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runHealthChecks();
    // Auto-refresh every 30 seconds
    const interval = setInterval(runHealthChecks, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: 'Running' | 'Stop' | 'Checking' | undefined) => {
    switch (status) {
      case 'Running':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Stop':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'Checking':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <div className="w-5 h-5 bg-gray-400 rounded-full animate-pulse" />;
    }
  };

  const getStatusColor = (status: 'Running' | 'Stop' | 'Checking' | undefined) => {
    switch (status) {
      case 'Running':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'Stop':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'Checking':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50';
    }
  };

  const getResponseTimeColor = (responseTime?: number) => {
    if (!responseTime) return 'text-gray-500';
    if (responseTime < 200) return 'text-green-600 dark:text-green-400';
    if (responseTime < 1000) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const groupedServices = serviceConfig.reduce((acc, service) => {
    const category = service.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    
    const serviceWithStatus = services.find(s => s.id === service.id);
    if (serviceWithStatus) {
      acc[category].push(serviceWithStatus);
    } else {
      acc[category].push({ ...service, status: 'Checking' as const });
    }
    
    return acc;
  }, {} as Record<string, ServiceStatus[]>);

  // Calculate overall system status
  const getOverallStatus = () => {
    if (services.length === 0) return { status: 'Checking', text: 'Initializing...' };
    
    const criticalServices = services.filter(s => s.criticalService);
    const criticalDown = criticalServices.filter(s => s.status === 'Stop');
    const anyDown = services.filter(s => s.status === 'Stop');
    
    if (criticalDown.length > 0) {
      return { status: 'Stop', text: 'Critical Systems Down' };
    } else if (anyDown.length > 0) {
      return { status: 'Warning', text: 'Some Services Degraded' };
    } else if (services.every(s => s.status === 'Running')) {
      return { status: 'Running', text: 'All Systems Operational' };
    } else {
      return { status: 'Checking', text: 'Health Check in Progress' };
    }
  };

  const overallStatus = getOverallStatus();
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;

  return (
    <div className="min-h-screen bg-white/100 dark:bg-gray-800 p-6 rounded-lg">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                System Health Monitor
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Real-time monitoring of system services and infrastructure
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Alerts indicator */}
              {criticalAlerts > 0 && (
                <button
                  onClick={() => setShowAlerts(!showAlerts)}
                  className="relative bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>{criticalAlerts} Alert{criticalAlerts > 1 ? 's' : ''}</span>
                </button>
              )}
              
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  {overallStatus.status === 'Running' && <CheckCircle className="w-6 h-6 text-green-500" />}
                  {overallStatus.status === 'Stop' && <XCircle className="w-6 h-6 text-red-500" />}
                  {overallStatus.status === 'Warning' && <AlertTriangle className="w-6 h-6 text-yellow-500" />}
                  {overallStatus.status === 'Checking' && <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />}
                  <span className="font-semibold text-lg text-gray-900 dark:text-white">
                    {overallStatus.text}
                  </span>
                </div>
                {lastChecked && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-end mt-1">
                    <Clock className="w-4 h-4 mr-1" />
                    Last checked: {lastChecked.toLocaleTimeString()}
                  </p>
                )}
              </div>
              
              <button
                onClick={runHealthChecks}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Checking...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Alerts Panel */}
        {showAlerts && alerts.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Recent Alerts
              </h2>
              <button
                onClick={() => setAlerts([])}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.severity === 'critical'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : alert.severity === 'warning'
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {alert.service}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {alert.message}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {alert.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {services.filter(s => s.status === 'Running').length}
                </p>
                <p className="text-gray-600 dark:text-gray-400">Running</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {services.filter(s => s.status === 'Stop').length}
                </p>
                <p className="text-gray-600 dark:text-gray-400">Down</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <Activity className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {services.length > 0 
                    ? Math.round(services.reduce((acc, s) => acc + (s.responseTime || 0), 0) / services.length)
                    : 0}ms
                </p>
                <p className="text-gray-600 dark:text-gray-400">Avg Response</p>
              </div>
            </div>
          </div>
        </div>

        {/* Service Groups */}
        {Object.entries(groupedServices).map(([category, categoryServices]) => (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 px-1">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categoryServices.map((service) => {
                const IconComponent = service.icon;
                return (
                  <div
                    key={service.id}
                    className={`bg-white dark:bg-gray-800 rounded-xl border-l-4 shadow-sm p-6 transition-all hover:shadow-md ${getStatusColor(service.status)}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                          <IconComponent className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {service.name}
                          </h3>
                          {/* {service.criticalService && (
                            <span className="inline-block px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full mt-1">
                              Critical
                            </span>
                          )} */}
                        </div>
                      </div>
                      {getStatusIcon(service.status)}
                    </div>

                    {service.status !== 'Checking' && (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Status:</span>
                          <span className={`font-medium ${
                            service.status === 'Running' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {service.status}
                          </span>
                        </div>
                        
                        {service.responseTime !== undefined && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Response:</span>
                            <span className={`font-medium ${getResponseTimeColor(service.responseTime)}`}>
                              {service.responseTime}ms
                            </span>
                          </div>
                        )}
                        
                        {service.lastChecked && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Last Check:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {service.lastChecked.toLocaleTimeString()}
                            </span>
                          </div>
                        )}

                        {/* Database specific info */}
                        {service.checks?.database && (
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Database:</span>
                              <span className={`font-medium ${
                                service.checks.database.healthy 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {service.checks.database.status}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* {service.message && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                            {service.message}
                          </p>
                        )} */}
                      </div>
                    )}

                    {service.status === 'Checking' && (
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}