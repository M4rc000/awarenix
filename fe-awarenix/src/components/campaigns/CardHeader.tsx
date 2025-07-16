import { useState, useCallback, useEffect } from "react";
import {
} from "../../icons";
import { SiMinutemailer } from "react-icons/si";

export type CardHeaderCampaignProps = {
  reloadTrigger: number
}

export default function CardHeader({reloadTrigger}: CardHeaderCampaignProps) {
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  // const [daysSinceLastCampaign, setDaysSinceLastCampaign] = useState(0);
  // const [growthData, setGrowthData] = useState(null);

  const fetchTotalCampaign = useCallback(async () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/campaigns/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === "success") {
        setTotalCampaigns(data.total);
      }
    } catch (err) {
      console.error("Failed to fetch total campaign:", err);
    }
  }, []);

  useEffect(() => {
      fetchTotalCampaign();
      // fetchGrowthData();
  
      const intervalId = setInterval(() => {
        fetchTotalCampaign();
        // fetchGrowthData();
      }, 3000); 
  
      return () => clearInterval(intervalId);
  
    }, [reloadTrigger, fetchTotalCampaign]); 
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 w-full">
      {/* ─── Total Campaigns ─── */}
      <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-sm hover:shadow-gray-600 hover:-translate-y-2 transition duration-300 ease-in-out cursor-pointer">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg dark:bg-gray-800">
              <SiMinutemailer className="text-gray-800 text-xl dark:text-white/90" />
            </div>
            <span className="text-lg font-medium text-gray-500 dark:text-gray-400">
              Total Campaign
            </span>
          </div>
          <h4 className="text-xl font-bold text-gray-800 dark:text-white">
            {totalCampaigns}
          </h4>
        </div>
        {/* <div className="mt-2 flex justify-end">{renderBadge(growthDataUser)}</div> */}
      </div>

      {/* ─── Since Last Campaign ─── */}
      {/* <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 min-h-[120px] xl:w-[30rem] dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-md hover:-translate-y-2 transition duration-300 ease-in-out cursor-pointer">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg dark:bg-gray-800 flex-shrink-0">
              <BoxIconLine className="text-gray-800 text-xl dark:text-white/90" />
            </div>
            <span className="text-base font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Since Last Campaign
            </span>
          </div>
          <h4 className="text-2xl font-bold text-gray-800 dark:text-white ml-4">
            {loading ? "..." : `${daysSinceLastCampaign} Day(s)`}
          </h4>
        </div>
      </div> */}
    </div>
  );
}