import { useState, useEffect } from "react";
import CardHeader from "../../components/campaigns/CardHeader";
import Button from "../../components/ui/button/Button";
import NewCampaignModal from "../../components/campaigns/NewCampaignModal";
import TableCampaigns from "../../components/campaigns/TableCampaigns";

export default function Campaigns() {
  const [modalOpen, setModalOpen] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const fetchData = () => {
    setReloadTrigger(prev => prev + 1); 
  };

  useEffect(() => {
  }, [reloadTrigger]);
  return (
    <>
      <div className="grid grid-cols-12 gap-4 md:gap-6 mt-10 mb-5 px-4">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <CardHeader reloadTrigger={reloadTrigger}/>
        </div>
      </div>
      <Button className="text-md mt-3 mb-3 mx-4" onClick={()=> setModalOpen(true)}>New Campaign</Button>

      <TableCampaigns reloadTrigger={reloadTrigger} onReload={fetchData}/>

      <NewCampaignModal
        isOpen={modalOpen}
        onUserAdded={() => {
          setModalOpen(false);
          fetchData();
        }}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}