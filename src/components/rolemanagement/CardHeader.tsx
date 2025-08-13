import { useState, useEffect, useCallback } from "react";
import { FaUser } from "react-icons/fa";

export type CardHeaderRoleManagementProps = {
  reloadTrigger: number
}

export default function CardHeader({reloadTrigger}: CardHeaderRoleManagementProps) {
  const [totalUsers, setTotalUsers] = useState(0);
  
  const fetchTotalRoles = useCallback(async () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/user-roles/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.status == "success") {
        setTotalUsers(data.total);
      }
    } catch (err) {
      console.error("Failed to fetch total user:", err);
    }
  }, []);
  
  useEffect(() => {
    fetchTotalRoles();

    const intervalId = setInterval(() => {
      fetchTotalRoles();
    }, 5000); 

    return () => clearInterval(intervalId);

  }, [reloadTrigger, fetchTotalRoles]); 


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 w-full">
      {/* Total Users */}
      <div className="flex flex-col justify-center rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-sm hover:shadow-gray-600 hover:-translate-y-2 transition duration-300 ease-in-out cursor-pointer">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg dark:bg-gray-800">
              <FaUser className="text-gray-800 text-xl dark:text-white/90" />
            </div>
            <span className="text-lg font-medium text-gray-500 dark:text-gray-400">
              Total Roles
            </span>
          </div>
          <h4 className="text-xl font-bold text-gray-800 dark:text-white">
            {totalUsers}
          </h4>
        </div>
      </div>
    </div>
  );
}