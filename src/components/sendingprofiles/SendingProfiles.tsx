import { useState } from "react";
// import CardHeader from "../../components/sendingprofiles/CardHeader";
import Breadcrump from "../utils/Breacrump";
import {CalenderIcon} from "../../icons";
import Button from "../ui/button/Button";
import NewSendingProfilesModal from "./NewSendingProfilesModal";
import TableSendingProfiles from "./TableSendingProfiles";

export default function SendingProfiles() {
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const fetchData = () => {
    setReloadTrigger(prev => prev + 1);
  };
  return (
    <>
      <Breadcrump icon={<CalenderIcon/>} title="Sending Profiles" />
      <div className="grid grid-cols-12 gap-4 md:gap-6 mt-10">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          {/* <CardHeader /> */}
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