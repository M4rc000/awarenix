import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw, Server, Clock } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  icon: React.ElementType;
  endpoint: string;
  category: string;
}

// Mengubah status menjadi 'running' atau 'stop'
interface ServiceStatus extends Service {
  status: 'running' | 'stop';
  responseTime?: number;
  lastChecked?: Date;
  message?: string;
}

// --- Komponen Utama ---
export default function EnvironmentCheck() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Service configuration tetap sama
  const serviceConfig: Service[] = [
    { 
      id: 'api-gateway', 
      name: 'API Gateway', 
      icon: Server, 
      endpoint: 'http://localhost:3000',
      category: 'Core Services'
    },
  ];

  // Fungsi untuk mengecek status layanan secara nyata dengan fetch
  const checkServiceHealth = async (service: Service): Promise<ServiceStatus> => {
    const startTime = performance.now();
    
    try {
      const response = await fetch(service.endpoint + "/health");
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      if (response.ok) {
        // Status 200-299 dianggap 'running'
        return {
          ...service,
          status: 'running',
          responseTime,
          lastChecked: new Date(),
          message: 'Service is running'
        };
      } else {
        // Status non-OK dianggap 'stop'
        return {
          ...service,
          status: 'stop',
          responseTime,
          lastChecked: new Date(),
          message: `Service responded with status ${response.status}`
        };
      }
    } catch (error) {
      console.error(error);
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      // Gagal melakukan fetch (misal: endpoint tidak bisa dijangkau)
      return {
        ...service,
        status: 'stop',
        responseTime,
        lastChecked: new Date(),
        message: 'Failed to connect to service'
      };
    }
  };

  const runHealthChecks = async () => {
    setIsLoading(true);
    try {
      const results = await Promise.all(
        serviceConfig.map(service => checkServiceHealth(service))
      );
      setServices(results);
      setLastChecked(new Date());
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

  // Mengubah logika untuk menangani status 'running' dan 'stop'
  const getStatusIcon = (status: 'running' | 'stop' | undefined) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'stop':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 bg-gray-400 rounded-full animate-pulse" />;
    }
  };

  // Mengubah logika untuk menangani status 'running' dan 'stop'
  const getStatusColor = (status: 'running' | 'stop' | undefined) => {
    switch (status) {
      case 'running':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'stop':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      default:
        return 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50';
    }
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
      acc[category].push(service as ServiceStatus);
    }
    
    return acc;
  }, {} as Record<string, ServiceStatus[]>);

  // Mengubah logika status keseluruhan
  const overallStatus = services.length > 0 ? 
    services.every(s => s.status === 'running') ? 'running' : 'stop' : 'unknown';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800/50 p-6 rounded-lg">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-gray-600 dark:text-gray-300">Monitor system services and infrastructure status</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(overallStatus as 'running' | 'stop')}
                  <span className="font-semibold text-lg text-gray-900 dark:text-white">
                    {overallStatus === 'running' ? 'All Systems Running' :
                     overallStatus === 'stop' ? 'Critical Issues Found' : 'Checking...'}
                  </span>
                </div>
                {lastChecked && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                    <Clock className="w-4 h-4 mr-1" />
                    Last checked: {lastChecked.toLocaleTimeString()}
                  </p>
                )}
              </div>
              <button
                onClick={runHealthChecks}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Checking...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>
<hr className='mb-10'/>
        {/* Service Groups */}
        {Object.entries(groupedServices).map(([category, categoryServices]) => (
          <div key={category} className="mb-8 px-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(categoryServices as ServiceStatus[]).map((service) => {
                const IconComponent = service.icon;
                return (
                  <div
                    key={service.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg border-l-4 shadow-sm p-4 ${getStatusColor(service.status)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{service.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{service.endpoint}</p>
                        </div>
                    </div>
                    {getStatusIcon(service.status)}
                  </div>

                  {service.status && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Status:</span>
                          <span className={`font-medium ${
                            service.status === 'running' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {service.status}
                          </span>
                        </div>
                        
                        {service.responseTime !== undefined && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Response Time:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{service.responseTime}ms</span>
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
                    </div>
                  )}

                  {isLoading && !service.status && (
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

        {/* Summary Stats */}
        {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 mx-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-8">System Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {services.filter(s => s.status === 'running').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Running Services</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {services.filter(s => s.status === 'stop').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Stopped Services</div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}