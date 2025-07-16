import { useState, useEffect } from 'react';
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
import DashboardCard from '../../components/dashboard/DashboardCard';
import MetricCard from '../../components/dashboard/MetricCard';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
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
        setDashboardData(result.data);
      } else {
        throw new Error(result.message || 'API Response not successful');
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []); // [] agar fetch hanya berjalan sekali saat komponen dimuat

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center">
        <p className="text-lg">Memuat data dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center">
        <p className="text-lg text-red-500">Error: {error}</p>
        <button
          onClick={fetchDashboardData}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  // Pastikan dashboardData tidak null sebelum diakses
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center">
        <p className="text-lg">Tidak ada data dashboard yang tersedia.</p>
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-3 py-3 space-y-8">
        {/* Campaign Overview Metrics */}
        <DashboardCard title="Campaign Overview">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {campaignResults.map((result, index) => (
              result.label !== "Campaign" ? (
                <MetricCard
                  key={index}
                  label={`Total ${result.label}`}
                  value={result.value}
                  percentage={result.percentage}
                  color={result.color}
                />
              ) : (
                <MetricCard
                  key={index}
                  label={result.label} 
                  value={result.value}
                  color={result.color}
                />
              )
            ))}
          </div>
        </DashboardCard>

        {/* CTR Over Time & Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DashboardCard title="Click-Through Rate Over Time">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={ctrOverTimeData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-gray-700" />
                <XAxis dataKey="hour" tick={{ fill: 'currentColor' }} />
                <YAxis tick={{ fill: 'currentColor' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgb(31 41 55)', border: 'none', borderRadius: '0.5rem' }}
                  labelStyle={{ color: '#E5E7EB' }}
                  itemStyle={{ color: '#D1D5DB' }}
                />
                <Legend />
                <Line type="monotone" dataKey="sent" stroke="#10B981" name="Sent" />
                <Line type="monotone" dataKey="opened" stroke="#F59E0B" name="Opened" />
                <Line type="monotone" dataKey="clicked" stroke="#EF4444" name="Clicked" />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
              Shows the number of emails sent, opened, and typed per hour.
            </p>
          </DashboardCard>

          <DashboardCard title="Top Performing Targets">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Target
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Submits
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {topPerformers.map((performer, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {performer.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {performer.clicks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {performer.submits}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </div>

        {/* Browser/OS Breakdown & Campaign Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DashboardCard title="Browser Used">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={browserData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {browserData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgb(31 41 55)', border: 'none', borderRadius: '0.5rem' }}
                  labelStyle={{ color: '#E5E7EB' }}
                  itemStyle={{ color: '#D1D5DB' }}
                />
                <Legend wrapperStyle={{ color: 'currentColor' }} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}