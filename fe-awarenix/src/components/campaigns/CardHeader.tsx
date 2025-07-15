import { useState, useEffect } from "react";
import {
} from "../../icons";
import { SiMinutemailer } from "react-icons/si";

export type CardHeaderEmailTemplatesProps = {
  reloadTrigger: number
}

export default function CardHeader({ reloadTrigger }: CardHeaderEmailTemplatesProps) {
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  // const [daysSinceLastCampaign, setDaysSinceLastCampaign] = useState(0);
  // const [growthData, setGrowthData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");

      try {
        // Fetch total campaigns
        const campaignsRes = await fetch(`${API_URL}/campaigns/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const campaignsData = await campaignsRes.json();
        if (campaignsData.Success && typeof campaignsData.Total === "number") {
          setTotalCampaigns(campaignsData.Total);
        }

        // Fetch days since last campaign
        // const lastCampaignRes = await fetch(`${API_URL}/campaigns/last-campaign-date`, {
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //   },
        // });
        // const lastCampaignData = await lastCampaignRes.json();
        // if (lastCampaignData.Success && lastCampaignData.data) {
        //   const lastDate = new Date(lastCampaignData.data.last_campaign_date);
        //   const today = new Date();
        //   const diffTime = Math.abs(today.getTime() - lastDate.getTime());
        //   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        //   setDaysSinceLastCampaign(diffDays);
        // }

        // Fetch growth data
        // const growthRes = await fetch(`${API_URL}/analytics/growth-percentage?type=campaigns`, {
        //   method: 'GET',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${token}`
        //   },
        // });
        // const growthData = await growthRes.json();
        // if (growthData.success && growthData.data) {
          // setGrowthData(growthData.data);
        // }

      } catch (error) {
        console.error("Failed to fetch campaign data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reloadTrigger]);

  // const renderBadge = (growth: { growth_type: string; growth_percentage: number } | null) => {
  //   if (!growth) return (
  //     <Badge color="success" className="text-sm dark:text-gray-300">
  //       <ArrowUpIcon className="size-4 mr-1" />
  //       11.01%
  //     </Badge>
  //   );

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
  //     <Badge color={color} className="text-sm dark:text-gray-300">
  //       {icon}
  //       {growth.growth_percentage.toFixed(2)}%
  //     </Badge>
  //   );
  // };

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