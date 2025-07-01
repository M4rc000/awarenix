import { useState } from "react";
import CardHeader from "../../components/sendingprofiles/CardHeader";
import Button from "../../components/ui/button/Button";
import NewSendingProfilesModal from "../../components/sendingprofiles/NewSendingProfilesModal";
import TableSendingProfiles from "../../components/sendingprofiles/TableSendingProfiles";

export default function SendingProfiles() {
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [newModalOpen, setNewModalOpen] = useState(false);

  const fetchData = () => {
    setReloadTrigger(prev => prev + 1);
  };
  return (
    <>
      <div className="grid grid-cols-12 gap-4 md:gap-6 mt-10">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <CardHeader reloadTrigger={reloadTrigger}/>
        </div>
      </div>
      <Button className="text-md mt-5 mb-3" onClick={()=> setNewModalOpen(true)}>New Sending Profile</Button>

      <TableSendingProfiles reloadTrigger={reloadTrigger} onReload={fetchData}/>

      <NewSendingProfilesModal
        onSendingProfileAdded={fetchData}
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
      />
    </>
  );
}