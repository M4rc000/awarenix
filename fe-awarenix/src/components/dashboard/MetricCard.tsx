import React from 'react';

const MetricCard: React.FC<{ label: string; value: number; percentage?: number; color: string }> = ({ label, value, percentage, color }) => {
  // Jika label adalah "Campaign", kita ingin tampilan yang berbeda
  if (label === "Campaign" && percentage !== undefined) {
    return (
      <div className="text-center bg-gray-100 border border-gray-300 dark:border-gray-500 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="text-4xl font-bold mb-1" style={{ color }}>
          {percentage}% {/* Hanya menampilkan persentase */}
        </div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Campaign Progress</div> {/* Label yang lebih deskriptif */}
      </div>
    );
  }

  // Untuk label selain "Campaign", tampilkan seperti biasa
  return (
    <div className="text-center bg-gray-100 border border-gray-300 dark:border-gray-500 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
      <div className="text-4xl font-bold mb-1" style={{ color }}>
        {value}
      </div>
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</div>
      {/* Tampilkan percentage hanya jika ada dan bukan "Campaign" (atau bisa dihapus jika hanya untuk Campaign) */}
      {percentage !== undefined && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{percentage}%</div>
      )}
    </div>
  );
};

export default MetricCard;