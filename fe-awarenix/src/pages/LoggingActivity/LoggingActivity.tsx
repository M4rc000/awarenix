import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Filter, Download, AlertCircle, CheckCircle, XCircle, Clock, User, Settings, Eye, RefreshCw, Database, Edit, Plus, Trash2, Globe, EyeOff } from 'lucide-react'; // Import EyeOff

const LoggingActivity = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Updated Activity type to match actual API response
  type Activity = {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    id: number;
    user_id: number;
    userName: string;
    module_name: string;
    action: string;
    record_id: string;
    old_value: string;
    new_value: string;
    ip_address: string;
    user_agent: string;
    timestamp: string;
    status: string;
    error_message: string;
    isExpanded?: boolean; // Tambahkan properti untuk mengontrol collapse
  };

  const [activityData, setActivityData] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalActivities, setTotalActivities] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Fetch activity logs from API
  const fetchActivityLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_URL}/activity-logs/all`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status === 'success') {
        const sanitizedData = (result.data || []).map((item: Activity) => ({
            ...item,
            module_name: item.module_name || 'N/A',
            action: item.action || 'Unknown',
            record_id: item.record_id || 'N/A',
            ip_address: item.ip_address || 'N/A',
            user_agent: item.user_agent || 'N/A',
            timestamp: item.timestamp || new Date().toISOString(),
            status: item.status || 'unknown',
            error_message: item.error_message || '',
            isExpanded: false,
        }));
        setActivityData(sanitizedData);
        setTotalActivities(result.total || result.data?.length || 0);
        setLastUpdated(new Date().toISOString());
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error("Failed to fetch activity logs:", err);
      setError("Failed to load activities. Please try again later.");
      
      setActivityData([]);
      setTotalActivities(0);
      setLastUpdated(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-reload every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchActivityLogs();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchActivityLogs]);

  // Initial load
  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  // Handle toggling error message visibility
  const toggleErrorMessage = useCallback((id: number) => {
    setActivityData(prevData =>
      prevData.map(activity =>
        activity.ID === id ? { ...activity, isExpanded: !activity.isExpanded } : activity
      )
    );
  }, []);

  // Get unique users for filter
  const uniqueUsers = useMemo(() => {
    const userIds = [...new Set(activityData.map(item => item.user_id))];
    return userIds.map(id => ({ id, name: `User ${id}` }));
  }, [activityData]);

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    return activityData.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        item.module_name?.toLowerCase().includes(searchLower) ||
        item.action?.toLowerCase().includes(searchLower) ||
        item.record_id?.toLowerCase().includes(searchLower) ||
        item.ip_address?.toLowerCase().includes(searchLower) ||
        item.error_message?.toLowerCase().includes(searchLower);
      
      const matchesFilter = selectedFilter === 'all' || item.action === selectedFilter;
      const matchesUser = selectedUser === 'all' || item.user_id.toString() === selectedUser;
      
      // Time range filter
      const now = new Date();
      const itemDate = new Date(item.timestamp);
      let matchesTime = true;
      
      if (selectedTimeRange === '24h') {
        matchesTime = (now.getTime() - itemDate.getTime()) <= 24 * 60 * 60 * 1000;
      } else if (selectedTimeRange === '7d') {
        matchesTime = (now.getTime() - itemDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
      } else if (selectedTimeRange === '30d') {
        matchesTime = (now.getTime() - itemDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
      }
      
      return matchesSearch && matchesFilter && matchesUser && matchesTime;
    });
  }, [searchTerm, selectedFilter, selectedUser, selectedTimeRange, activityData]);

  // Get icon based on action
  const getActionIcon = (action: string) => {
    const iconMap = {
      'Create': Plus,
      'Update': Edit,
      'Delete': Trash2,
      'View': Eye,
      'Login': User,
      'Logout': User,
      'Settings': Settings,
      'Config': Settings,
      'Refresh': RefreshCw,
    };
    
    const IconComponent = iconMap[action as keyof typeof iconMap] || Database;
    return <IconComponent size={16} />; // Ukuran ikon diperkecil
  };

  // Get status badge
  type StatusType = 'success' | 'error' | 'pending' | 'unknown';
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<StatusType, { icon: typeof CheckCircle | typeof XCircle | typeof Clock; color: string; label: string }> = {
      success: { icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', label: 'Success' },
      error: { icon: XCircle, color: 'text-red-600 bg-red-50 border-red-200', label: 'Failed' },
      pending: { icon: Clock, color: 'text-yellow-600 bg-yellow-50 border-yellow-200', label: 'Pending' },
      unknown: { icon: Clock, color: 'text-gray-600 bg-gray-50 border-gray-200', label: 'Unknown' }
    };

    const config = statusConfig[status as StatusType] || statusConfig.unknown;
    const StatusIcon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-xs font-medium ${config.color}`}> 
        <StatusIcon size={9} /> 
        {config.label}
      </span>
    );
  };

  // Get action color for left border and icon background
  const getActionColor = (action: string) => {
    const colors = {
      'Create': 'border-l-emerald-400',
      'Update': 'border-l-blue-400',
      'Delete': 'border-l-red-400',
      'View': 'border-l-purple-400',
      'Login': 'border-l-green-400',
      'Logout': 'border-l-orange-400',
      'Settings': 'border-l-gray-400',
      'Config': 'border-l-gray-400',
      'Refresh': 'border-l-blue-400',
    };
    return colors[action as keyof typeof colors] || 'border-l-gray-400';
  };

  const getIconBackgroundColor = (action: string) => {
    const colors = {
      'Create': 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
      'Update': 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      'Delete': 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
      'View': 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      'Login': 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      'Logout': 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
      'Settings': 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400',
      'Config': 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400',
      'Refresh': 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    };
    return colors[action as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400';
  };


  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Jakarta',
        // timeStyle: 'short'
      }).format(date);
    } catch (e) {
      console.error('Error', e);
      return 'Invalid Date';
    }
  };

  // Export functionality
  const handleExport = () => {
    const exportData = filteredData.map(item => ({
      timestamp: item.timestamp,
      user_id: item.user_id,
      module: item.module_name,
      action: item.action,
      record_id: item.record_id,
      status: item.status,
      ip_address: item.ip_address,
      error_message: item.error_message
    }));
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `activity-log-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-white rounded-md shadow-xl dark:bg-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-6"> 
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Activity Monitoring</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Real-time system activity tracking and audit logs</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"> 
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Auto-refresh: 30s</span>
              </div>
            </div>
          </div>
        </div>

        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between"> 
            
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by module, action, record ID, or IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
              />
            </div>

            
            <div className="flex gap-2"> 
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm" // Padding & ukuran teks diperkecil
              >
                <Filter size={14} /> 
                Filters
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors text-sm" // Padding & ukuran teks diperkecil
              >
                <Download size={14} /> 
                Export
              </button>
              <button
                onClick={fetchActivityLogs}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm" // Padding & ukuran teks diperkecil
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> 
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"> 
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3"> 
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Action</label> 
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                  >
                    <option value="all">All Actions</option>
                    <option value="Create">Create</option>
                    <option value="Update">Update</option>
                    <option value="Delete">Delete</option>
                    <option value="View">View</option>
                    <option value="Login">Login</option>
                    <option value="Logout">Logout</option>
                  </select>
                </div>

                
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">User</label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                  >
                    <option value="all">All Users</option>
                    {uniqueUsers.map(user => (
                      <option key={user.id} value={user.id.toString()}>{user.name}</option>
                    ))}
                  </select>
                </div>

                
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Time Range</label>
                  <select
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" // Padding & ukuran teks diperkecil
                  >
                    <option value="all">All Time</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center"> 
            <RefreshCw size={40} className="mx-auto animate-spin text-blue-500 dark:text-blue-400" /> 
            <h3 className="text-base font-medium text-gray-900 dark:text-white mt-3">Loading activity logs...</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Fetching the latest system activities...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl shadow-sm border border-red-200 dark:border-red-700 p-8 text-center"> 
            <AlertCircle size={40} className="mx-auto text-red-500 dark:text-red-400" /> 
            <h3 className="text-base font-medium text-red-700 dark:text-red-400 mt-3">Error Loading Data</h3>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1.5">{error}</p> 
            <button
              onClick={fetchActivityLogs}
              className="mt-3 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            
            <div className="mb-4 flex items-center justify-between"> 
              <div className="flex items-center gap-3">
                <p className="text-xs text-gray-600 dark:text-gray-400"> 
                  Showing <span className="font-medium">{filteredData.length}</span> of <span className="font-medium">{totalActivities}</span> activities
                </p>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"> 
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5"> 
                <Clock size={14} className="text-gray-400 dark:text-gray-500" /> 
                <span className="text-xs text-gray-600 dark:text-gray-400"> 
                  Last updated: {lastUpdated ? formatTimestamp(lastUpdated) : 'Never'}
                </span>
              </div>
            </div>

            
            <div className="space-y-2"> 
              {filteredData.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center"> 
                  <Search size={40} className="mx-auto text-gray-400 dark:text-gray-500" /> 
                  <h3 className="text-base font-medium text-gray-900 dark:text-white mt-3">No activities found</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Try adjusting your search criteria or filters</p>
                </div>
              ) : (
                filteredData.map((activity) => (
                  <div
                    key={activity.ID}
                    className={`group bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 overflow-hidden border-l-4 ${getActionColor(activity.action)}`}
                  >
                    <div className="p-3"> 
                      <div className="flex items-start justify-between gap-3"> 
                        
                        <div className="flex items-start gap-3 flex-1 min-w-0"> 
                          
                          <div className={`flex-shrink-0 p-2 rounded-lg ${getIconBackgroundColor(activity.action)}`}>
                            {getActionIcon(activity.action)}
                          </div>
                          
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-sm text-gray-900 dark:text-white"> 
                                {activity.action} {activity.module_name}
                              </h3>
                              {getStatusBadge(activity.status)}
                            </div>
                            
                            <div className="space-y-1.5"> 
                              <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400"> 
                                <span>Record ID: <span className="font-medium">{activity.record_id}</span></span>
                                <span>User: <span className="font-medium">{activity.userName}</span></span>
                                <div className="flex items-center text-right gap-1">
                                  <Clock size={11} /> 
                                  <span>{formatTimestamp(activity.timestamp)}</span>
                                </div>
                                <div className="flex items-center gap-1"> 
                                  <Globe size={11} /> 
                                  <span>{activity.ip_address}</span>
                                </div>
                              </div>
                              
                              
                              
                              {activity.error_message && (
                                <>
                                  <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                      activity.isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                                  >
                                    <div className="mt-1.5 p-2 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-700"> 
                                      <p className="text-xs text-red-700 dark:text-red-400"> 
                                        <span className="font-semibold">Error Details:</span> {activity.error_message}
                                      </p>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        
                        <div className="flex items-center gap-2 flex-shrink-0"> 
                          <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium"> 
                            {activity.module_name}
                          </span>
                          {activity.error_message && (
                            <button
                              onClick={() => toggleErrorMessage(activity.ID)}
                              className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" 
                              aria-expanded={activity.isExpanded}
                              aria-controls={`error-details-${activity.ID}`}
                            >
                              {activity.isExpanded ? <EyeOff size={14} /> : <Eye size={14} />} 
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoggingActivity;