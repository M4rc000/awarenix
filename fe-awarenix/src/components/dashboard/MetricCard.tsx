import React from 'react';

const MetricCard: React.FC<{ label: string; value: number; percentage?: number; color: string }> = ({ label, value, percentage, color }) => {
  if (label === "Campaign" && percentage !== undefined) {
    return (
      <div className="text-center bg-gray-100 border border-gray-300 dark:border-gray-500 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="text-4xl font-bold mb-1" style={{ color }}>
          {percentage}%
        </div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Campaign Progress</div> 
      </div>
    );
  }

  return (
    <div className="text-center bg-gray-100 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <div className="text-4xl font-bold mb-1" style={{ color }}>
        {value}
      </div>
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</div>
      {percentage !== undefined && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{percentage}%</div>
      )}
    </div>
  );
};

export default MetricCard;