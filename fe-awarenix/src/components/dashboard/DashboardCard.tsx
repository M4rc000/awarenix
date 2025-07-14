const DashboardCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`bg-white dark:bg-gray-900 shadow-md rounded-lg border dark:border-gray-700 ${className}`}>
    <div className="px-6 py-4 border-b dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

export default DashboardCard;