import { useState, useEffect, useRef } from 'react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import MetricCard from '../../components/dashboard/MetricCard';
import Swal from '../../components/utils/AlertContainer';

export interface TopPerformer {
  campaignName: string;
  name: string;
  clicks: number;
  submits: number;
}

export interface CampaignResult {
  label: string;
  value: number;
  percentage?: number;
  color: string;
}

export interface CTRData {
  hour: string;
  sent: number;
  opened: number;
  clicked: number;
}

export interface BrowserData {
  name: string;
  value: number;
  color: string;
}

export interface DashboardData {
  campaignResults: CampaignResult[];
  ctrOverTimeData: CTRData[];
  topPerformers: TopPerformer[];
  browserData: BrowserData[];
}

interface PieChartLabelProps {
  cx: number;
  cy: number;
  midAngle?: number;
  innerRadius: number;
  outerRadius: number;
  // Ubah percent menjadi opsional
  percent?: number;
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState(5);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDashboardData = async (isRefresh = false) => {
    // Only show loading state on initial load, not on refresh
    if (!isRefresh) {
      setLoading(true);
    }
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/analytics/dashboard-metrics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'failed to load data dashboard');
      }

      const result = await response.json();
      if (result.status === 'success') {
        setDashboardData(result.data as DashboardData);
      } else {
        throw new Error(result.message || 'API Response not successful');
      }
    } catch (err: unknown) {
      console.error("Error fetching dashboard data:", err);
      let errorMessage = "failed to load dashboard data";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError("failed to load dashboard data");

      // Only show alert on manual refresh or initial load, not on auto-refresh
      if (!isRefresh) {
        Swal.fire({
          text: errorMessage,
          icon: "error",
          duration: 3000,
        });
      }
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  };

  const startAutoRefresh = () => {
    setIsAutoRefresh(true);
    setRefreshCountdown(5);

    // Clear existing intervals
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    // Start countdown
    countdownRef.current = setInterval(() => {
      setRefreshCountdown(prev => {
        if (prev <= 1) {
          return 5; // Reset countdown
        }
        return prev - 1;
      });
    }, 1000);

    // Start auto refresh
    intervalRef.current = setInterval(() => {
      fetchDashboardData(true);
    }, 5000);
  };

  const stopAutoRefresh = () => {
    setIsAutoRefresh(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieChartLabelProps) => {
    // Tambahkan guard clause untuk midAngle dan percent
    if (midAngle === undefined || percent === undefined) return null;

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Main loading content */}
        <div className="relative z-10 text-center">
          {/* Animated spinner */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
              <div className="absolute top-2 left-2 w-12 h-12 border-4 border-transparent border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin animate-reverse"></div>
            </div>
          </div>

          {/* Loading text with animation */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 animate-pulse">
              Loading Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400 animate-pulse delay-300">
              Preparing your analytics data...
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center space-x-2 mt-8">
            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20 flex items-center justify-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-32 h-32 bg-red-100 dark:bg-red-900/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-orange-100 dark:bg-orange-900/10 rounded-full blur-2xl"></div>
        </div>

        {/* Main content */}
        <div className="relative z-10 text-center max-w-md mx-auto px-6">
          {/* Error icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>

          {/* Error message */}
          <div className="space-y-4 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
              {error}
            </p>
          </div>

          {/* Action button */}
          <button
            onClick={() => fetchDashboardData()}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 flex items-center justify-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-32 h-32 bg-blue-100 dark:bg-blue-900/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-purple-100 dark:bg-purple-900/10 rounded-full blur-2xl"></div>
        </div>

        {/* Main content */}
        <div className="relative z-10 text-center max-w-md mx-auto px-6">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>

          {/* Title and description */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              No Data Available
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
              Dashboard data is currently unavailable. Please check your connection or try refreshing the page.
            </p>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Refresh Page
            </button>
          </div>

          {/* Status indicator */}
          <div className="mt-8 flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>Data connection unavailable</span>
          </div>
        </div>
      </div>
    );
  }

  const {
    campaignResults,
    ctrOverTimeData,
    topPerformers,
    browserData
  } = dashboardData;

  return (
    <div className="min-h-screen">
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 space-y-8">

        <div className="flex items-center space-x-4">
          {/* Manual Refresh Button */}
          <button
            onClick={() => fetchDashboardData(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>

          {/* Auto Refresh Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={isAutoRefresh ? stopAutoRefresh : startAutoRefresh}
              className={`px-4 py-2 font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center space-x-2 ${
                isAutoRefresh
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
              }`}
            >
              {isAutoRefresh ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  <span>Stop Auto ({refreshCountdown}s)</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Auto Refresh</span>
                </>
              )}
            </button>
          </div>
        </div>
        {/* Campaign Overview Metrics */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6 transition-all duration-300 hover:shadow-2xl">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Campaign Overview</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Tambahkan nullish coalescing operator (?? []) untuk memastikan array tidak null/undefined */}
            {(campaignResults ?? []).map((result: CampaignResult, index: number) => (
              result.label === "Campaign" ? (
                <MetricCard
                  key={index}
                  label={`Total ${result.label}`}
                  value={result.value}
                  color={result.color}
                />
              ) : (
                <MetricCard
                  key={index}
                  label={result.label}
                  value={result.value}
                  percentage={result.percentage}
                  color={result.color}
                />
              )
            ))}
          </div>
        </div>

        {/* CTR Over Time & Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* CTR Chart */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Click-Through Rate Over Time</h2>
            </div>

            <div className="text-gray-900 dark:text-white">
              <ResponsiveContainer width="100%" height={300}>
                {/* Tambahkan nullish coalescing operator pada data prop */}
                <LineChart
                  data={ctrOverTimeData ?? []}
                  margin={{ top: 5, right: 25, left: -30, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-current text-gray-200 dark:text-gray-600"
                  />
                  <XAxis
                    dataKey="hour"
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                    axisLine={{ stroke: 'currentColor' }}
                    tickLine={{ stroke: 'currentColor' }}
                  />
                  <YAxis
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                    axisLine={{ stroke: 'currentColor' }}
                    tickLine={{ stroke: 'currentColor' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(31,41,55,0.95)',
                      border: 'none',
                      borderRadius: '0.75rem',
                      boxShadow:
                        '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    }}
                    labelStyle={{ color: '#E5E7EB' }}
                    itemStyle={{ color: '#D1D5DB' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sent"
                    stroke="#10B981"
                    name="Sent"
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="opened"
                    stroke="#F59E0B"
                    name="Opened"
                    strokeWidth={3}
                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="clicked"
                    stroke="#6366F1"
                    name="Clicked"
                    strokeWidth={3}
                    dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4 italic">
              Shows the number of emails sent, opened, and clicked per hour.
            </p>
          </div>

          {/* Top Performers */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Top Performing Targets</h2>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Campaign
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Target
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Clicks
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Submits
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                    {/* Tambahkan nullish coalescing operator (?? []) */}
                    {(topPerformers ?? []).map((performer: TopPerformer, index: number) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 text-center">
                          {performer.campaignName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 text-center">
                          {performer.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-center">
                          <span className="inline-flex justify-center items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                            {performer.clicks}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-center">
                          <span className="inline-flex justify-center items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                            {performer.submits}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Browser Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Browser Usage</h2>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-xl p-4">
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  {/* Tambahkan nullish coalescing operator pada data prop */}
                  <Pie
                    data={browserData ?? []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {/* Tambahkan nullish coalescing operator (?? []) */}
                    {(browserData ?? []).map((entry: BrowserData, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(31, 41, 55, 0.95)',
                      border: 'none',
                      borderRadius: '0.75rem',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
                    }}
                    labelStyle={{ color: '#E5E7EB' }}
                    itemStyle={{ color: '#D1D5DB' }}
                  />
                  <Legend wrapperStyle={{ color: 'currentColor' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Empty space for future content */}
        </div>
      </div>
    </div>
  );
}