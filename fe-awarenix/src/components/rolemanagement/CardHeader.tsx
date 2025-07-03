import { useState, useEffect, useCallback } from "react";
import { FaUser } from "react-icons/fa";

export type CardHeaderRoleManagementProps = {
  reloadTrigger: number
}

export default function CardHeader({reloadTrigger}: CardHeaderRoleManagementProps) {
  const [totalUsers, setTotalUsers] = useState(0);
  // const [growthDataUser, setGrowthDataUser] = useState(null);
  
  const fetchTotalRoles = useCallback(async () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/user-roles/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.Success && typeof data.Total === "number") {
        setTotalUsers(data.Total);
      }
    } catch (err) {
      console.error("Failed to fetch total user:", err);
    }
  }, []);
  
  // const fetchGrowthData = useCallback(async () => {
  // const API_URL = import.meta.env.VITE_API_URL;
  // const token = localStorage.getItem("token");
  //   try {
  //     const res = await fetch(`${API_URL}/analytics/growth-percentage?type=users`, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`
  //       },
  //     });
  //     if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  //     const data = await res.json();
  //     if (data.success && data.data) {
  //       setGrowthDataUser(data.data);
  //     }
  //   } catch (error) {
  //     console.error("❌ Fetch error:", error);
  //   }
  // }, []);

  useEffect(() => {
    fetchTotalRoles();
    // fetchGrowthData();

    const intervalId = setInterval(() => {
      fetchTotalRoles();
      // fetchGrowthData();
    }, 5000); 

    return () => clearInterval(intervalId);

  }, [reloadTrigger, fetchTotalRoles]); 

  // const renderBadge = (growth: { growth_type: string; growth_percentage: number } | null) => {
  //   if (!growth) return null;

  //   const icon =
  //     growth.growth_type === "increase" ? (
  //       <TbArrowBigUpLine className="mr-1" />
  //     ) : growth.growth_type === "decrease" ? (
  //       <TbArrowBigDownLine className="mr-1" />
  //     ) : (
  //       <CgArrowsExchange className="mr-1 rotate-180" />
  //     );

  //   const color =
  //     growth.growth_type === "increase"
  //       ? "success"
  //       : growth.growth_type === "decrease"
  //       ? "error"
  //       : "warning";

  //   return (
  //     <Badge color={color} className="dark:text-gray-400">
  //       {icon}
  //       {growth.growth_percentage.toFixed(2)}%
  //     </Badge>
  //   );
  // };

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
        {/* <div className="mt-2 flex justify-end">{renderBadge(growthDataUser)}</div> */}
      </div>
    </div>
  );
}