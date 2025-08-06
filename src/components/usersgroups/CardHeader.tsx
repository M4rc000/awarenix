import { useState, useEffect, useCallback } from "react";
import { MdGroups } from "react-icons/md";
import { FaUserAlt } from "react-icons/fa";

// type GrowthData = {
//   growth_type: "increase" | "decrease" | "stagnant";
//   growth_percentage: number;
// };

type CardHeaderProps = {
  reloadTrigger: unknown; 
};

export default function CardHeader({ reloadTrigger }: CardHeaderProps) {
  const [totalGroups, setTotalGroups] = useState(0);
  // const [growthDataGroup, setGrowthDataGroup] = useState<GrowthData | null>(null);
  // const [growthDataMember, setGrowthDataMember] = useState<GrowthData | null>(null);
  const [totalMembers, setTotalMembers] = useState(0);

  const fetchTotalGroups = useCallback(async () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/groups/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.Success && typeof data.Total === "number") {
        setTotalGroups(data.Total);
      }
    } catch (err) {
      console.error("Failed to fetch total groups:", err);
    }
  }, []);
  
  const fetchTotalMembers = useCallback(async () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/groups/members/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.status === "success") {
        setTotalMembers(data.total);
      }
    } catch (err) {
      console.error("Failed to fetch total groups:", err);
    }
  }, []);

  // const fetchGrowthDataGroups = useCallback(async () => {
  //   const API_URL = import.meta.env.VITE_API_URL;
  //   const token = localStorage.getItem("token");
  //   try {
  //     const res = await fetch(`${API_URL}/analytics/growth-percentage?type=groups`, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`
  //       },
  //     });
  //     if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  //     const data = await res.json();
  //     if (data.success && data.data) {
  //       setGrowthDataGroup(data.data);
  //     }
  //   } catch (error) {
  //     console.error("❌ Fetch error:", error);
  //   }
  // }, []);
  
  // const fetchGrowthDataMembers = useCallback(async () => {
  //   const API_URL = import.meta.env.VITE_API_URL;
  //   const token = localStorage.getItem("token");
  //   try {
  //     const res = await fetch(`${API_URL}/analytics/growth-percentage?type=members`, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`
  //       },
  //     });
  //     if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  //     const data = await res.json();
  //     if (data.success && data.data) {
  //       setGrowthDataMember(data.data);
  //     }
  //   } catch (error) {
  //     console.error("❌ Fetch error:", error);
  //   }
  // }, []);

  useEffect(() => {
    fetchTotalGroups();
    fetchTotalMembers();
    // fetchGrowthDataGroups();
    // fetchGrowthDataMembers();

    const intervalId = setInterval(() => {
      fetchTotalGroups();
      fetchTotalMembers();
      // fetchGrowthDataGroups();
      // fetchGrowthDataMembers();
    }, 5000); 

    return () => clearInterval(intervalId);

  }, [reloadTrigger, fetchTotalGroups, fetchTotalMembers]); 
  
  // const renderBadge = (growth: GrowthData | null) => {
  //   if (!growth) return null;

  //   const icon =
  //     growth.growth_type === "increase" ? (
  //       <TbArrowBigUpLine className="mr-1" />
  //     ) : growth.growth_type === "decrease" ? (
  //       <TbArrowBigDownLine className="mr-1" />
  //     ) : (
  //       <CgArrowsExchange className="mr-1 rotate-180" />
  //     );

  //   const color: "success" | "error" | "warning" =
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
      {/* Total Groups */}
      <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-sm hover:shadow-gray-600 hover:-translate-y-2 transition duration-300 ease-in-out cursor-pointer">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg dark:bg-gray-800 flex-shrink-0">
              <MdGroups className="text-gray-800 text-xl dark:text-white/90" />
            </div>
            <span className="text-base font-medium text-gray-500 dark:text-gray-400 truncate">
              Total Groups
            </span>
          </div>
          <h4 className="text-xl font-bold text-gray-800 dark:text-white text-right whitespace-nowrap">
            {totalGroups}
          </h4>
        </div>
        {/* <div className="mt-2 flex justify-end"></div> */}
      </div>
      
      {/* Total Members */}
      <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-sm hover:shadow-gray-600 hover:-translate-y-2 transition duration-300 ease-in-out cursor-pointer">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg dark:bg-gray-800 flex-shrink-0">
              <FaUserAlt className="text-gray-800 text-xl dark:text-white/90" />
            </div>
            <span className="text-base font-medium text-gray-500 dark:text-gray-400 truncate">
              Total Members
            </span>
          </div>
          <h4 className="text-xl font-bold text-gray-800 dark:text-white text-right whitespace-nowrap">
            {totalMembers}
          </h4>
        </div>
        {/* <div className="mt-2 flex justify-end">{renderBadge(growthDataMember)}</div> */}
      </div>
    </div>
  );
}