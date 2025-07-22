import { useState } from "react";
import CardHeader from "../../components/landingpages/CardHeader";
import Button from "../../components/ui/button/Button";
import NewLandingPageModal from "../../components/landingpages/NewLandingPageModal";
import TableLandingPages from "../../components/landingpages/TableLandingPages";

export default function LandingPages() {
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const fetchData = () => {
    setReloadTrigger(prev => prev + 1);
  };
  return (
    <>
      <div className="grid grid-cols-12 gap-4 md:gap-6 mt-10 px-4 mb-1">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <CardHeader reloadTrigger={reloadTrigger}/>
        </div>
      </div>
      <Button className="text-md mt-5 mb-3 mx-4" onClick={()=> setNewModalOpen(true)}>New Landing Page</Button>

      <TableLandingPages reloadTrigger={reloadTrigger} onReload={fetchData}/>

      <NewLandingPageModal
        onLandingPageAdded={fetchData}
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
      />
    </>
  );
}