import React from 'react';
import { Shield } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  PieChart as RechartsPieChart, // Rename to avoid conflict with local PieChart component
  Pie,
  Cell
} from 'recharts';
import DashboardCard from '../../components/dashboard/DashboardCard';
import MetricCard from '../../components/dashboard/MetricCard';
import CircularProgress from '../../components/dashboard/CircularProgress';

export default function Dashboard() {
  const totalSent = 100;

  const campaignResults = [
    { label: "Sent", value: totalSent, color: "#10B981", percentage: 100 },
    { label: "Opened", value: 80, color: "#F59E0B", percentage: 80 },
    { label: "Clicked", value: 40, color: "#EF4444", percentage: 40 },
    { label: "Submitted", value: 15, color: "#DC2626", percentage: 15 },
    { label: "Reported", value: 5, color: "#6B7280", percentage: 5 }
  ];

  // Data for Funnel Chart
  const funnelData = [
    { name: 'Email Sent', value: totalSent, fill: '#10B981' },
    { name: 'Email Opened', value: campaignResults[1].value, fill: '#F59E0B' },
    { name: 'Clicked Link', value: campaignResults[2].value, fill: '#EF4444' },
    { name: 'Submitted Data', value: campaignResults[3].value, fill: '#DC2626' },
  ];

  // Dummy data for CTR Over Time (misalnya per jam)
  const ctrOverTimeData = [
    { hour: '09:00', sent: 20, opened: 15, clicked: 5 },
    { hour: '10:00', sent: 30, opened: 25, clicked: 12 },
    { hour: '11:00', sent: 25, opened: 20, clicked: 10 },
    { hour: '12:00', sent: 15, opened: 10, clicked: 3 },
    { hour: '13:00', sent: 10, opened: 8, clicked: 2 },
  ];

  // Dummy data for Top Clickers/Submitters
  const topPerformers = [
    { name: 'John Doe (IT Dept.)', clicks: 12, submits: 3 },
    { name: 'Jane Smith (HR Dept.)', clicks: 8, submits: 2 },
    { name: 'Robert Johnson (Sales)', clicks: 6, submits: 1 },
    { name: 'Emily Davis (Marketing)', clicks: 5, submits: 1 },
  ];

  // Dummy data for Browser/OS Breakdown
  const browserData = [
    { name: 'Chrome', value: 70, color: '#3B82F6' }, // blue-500
    { name: 'Firefox', value: 15, color: '#F97316' }, // orange-500
    { name: 'Edge', value: 10, color: '#0EA5E9' }, // sky-500
    { name: 'Others', value: 5, color: '#9CA3AF' }, // gray-400
  ];
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


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Campaign Overview Metrics */}
        <DashboardCard title="Campaign Overview">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {campaignResults.map((result, index) => (
              <MetricCard 
                key={index} 
                label={result.label} 
                value={result.value} 
                percentage={result.percentage} 
                color={result.color} 
              />
            ))}
          </div>
        </DashboardCard>

        {/* Funnel Conversion & Circular Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DashboardCard title="Conversion Funnel">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={funnelData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" className="dark:stroke-gray-700" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={120} tick={{ fill: 'currentColor' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgb(31 41 55)', border: 'none', borderRadius: '0.5rem' }} 
                  labelStyle={{ color: '#E5E7EB' }} 
                  itemStyle={{ color: '#D1D5DB' }} 
                />
                <Bar dataKey="value" fill="#8884d8" barSize={30}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
              Visualisasi alur konversi dari email terkirim hingga data terkirim.
            </p>
          </DashboardCard>

          <DashboardCard title="Key Performance Gauges">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-8 mt-4">
              {/* Menggunakan CircularProgress dari data campaignResults yang relevan */}
              <CircularProgress value={campaignResults[0].value} total={totalSent} color={campaignResults[0].color} label="Email Sent" />
              <CircularProgress value={campaignResults[1].value} total={totalSent} color={campaignResults[1].color} label="Email Opened" />
              <CircularProgress value={campaignResults[2].value} total={totalSent} color={campaignResults[2].color} label="Clicked Link" />
              <CircularProgress value={campaignResults[3].value} total={totalSent} color={campaignResults[3].color} label="Submitted Data" />
              <CircularProgress value={campaignResults[4].value} total={totalSent} color={campaignResults[4].color} label="Email Reported" />
            </div>
          </DashboardCard>
        </div>

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
              Menunjukkan jumlah email terkirim, dibuka, dan diklik setiap jam.
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
          <DashboardCard title="Browser/OS Distribution">
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