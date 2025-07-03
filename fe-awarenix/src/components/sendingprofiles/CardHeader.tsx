import { useState, useEffect } from "react";
// import { CgArrowsExchange } from "react-icons/cg";
import { TfiEmail } from "react-icons/tfi";
// import Badge from "../ui/badge/Badge";

export type CardHeaderSendingProfilesProps = {
  reloadTrigger: number
}

// type GrowthData = {
//   growth_type: 'increase' | 'decrease' | 'no_change';
//   growth_percentage: number;
// };

export default function CardHeader({reloadTrigger}: CardHeaderSendingProfilesProps) {
  const [totalSendingProfiles, setTotalSendingProfiles] = useState(0);
  // const [growthDataSendingProfiles, setGrowthDataSengrowthDataSendingProfiles] = useState<GrowthData | null>(null);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    const fetchTotalSendingProfiles = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/sending-profile/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.Success && typeof data.Total === "number") {
          setTotalSendingProfiles(data.Total);
        }
      } catch (err) {
        console.error("Failed to fetch total sending profile:", err);
      }
    };
    
    fetchTotalSendingProfiles();
  }, [reloadTrigger]);
  
  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   const API_URL = import.meta.env.VITE_API_URL;
  //   fetch(`${API_URL}/analytics/growth-percentage?type=sendingprofiles`, {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization': `Bearer ${token}`
  //     },
  //   })
  //     .then(res => {
  //       // Check if response is ok
  //       if (!res.ok) {
  //         throw new Error(`HTTP error! status: ${res.status}`);
  //       }
        
  //       return res.json();
  //     })
  //     .then(data => {
  //       if (data.success && data.data) {
  //         setGrowthDataSengrowthDataSendingProfiles(data.data);
  //       } else {
  //         console.warn("⚠️ No data received or success = false");
  //       }
  //     })
  //     .catch(error => {
  //       console.error("❌ Fetch error:", error);
  //       console.error("🔍 Error details:", error.message);
  //     });
  // }, []);

  return (
    <>
      <div className="grid xl:grid-cols-3 xl:gap-4 gap-4 sm:grid-cols-2 sm:gap-6">
        <div className="flex flex-col justify-center rounded-xl border border-gray-200 bg-white p-4 xl:h-20 xl:w-[310px] dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-sm hover:shadow-gray-600 hover:-translate-y-2 transition duration-300 ease-in-out cursor-pointer">
          
          {/* Header Section */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg dark:bg-gray-800">
                <TfiEmail className="text-gray-800 text-xl dark:text-white/90" />
              </div>
              <span className="text-md font-medium text-gray-500 dark:text-gray-400">
                Total Sending Profile
              </span>
            </div>
            <h4 className="text-xl font-bold text-gray-800 dark:text-white">
              {totalSendingProfiles}
            </h4>
          </div>

          {/* Badge Section */}
          {/* <div className="mt-2 flex justify-end">
            <Badge
              color={
                growthDataSendingProfiles?.growth_type === 'increase'
                  ? 'success'
                  : growthDataSendingProfiles?.growth_type === 'decrease'
                  ? 'error'
                  : 'warning'
              }
              className="dark:text-gray-400"
            >
              {growthDataSendingProfiles?.growth_type === 'increase' && (
                <TbArrowBigUpLine className="mr-1" />
              )}
              {growthDataSendingProfiles?.growth_type === 'decrease' && (
                <TbArrowBigDownLine className="mr-1" />
              )}
              {growthDataSendingProfiles?.growth_type === 'no_change' && (
                <CgArrowsExchange className="mr-1 rotate-180" />
              )}
              {growthDataSendingProfiles?.growth_percentage.toFixed(2)}%
            </Badge>
          </div> */}
        </div>
      </div>
    </>
  );
}