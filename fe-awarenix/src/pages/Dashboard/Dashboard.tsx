import MonthlySalesChart from "../../components/campaigns/MonthlySalesChart";
import StatisticsChart from "../../components/campaigns/StatisticsChart";
import MonthlyTarget from "../../components/campaigns/MonthlyTarget";
// import RecentOrders from "../../components/campaigns/RecentOrders";
// import DemographicCard from "../../components/campaigns/DemographicCard";

export default function Dashboard() {
  return (
    <>
      <div className="grid grid-cols-12 gap-4 md:gap-6 mt-10">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        {/* <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div> */}
      </div>
    </>
  );
}
