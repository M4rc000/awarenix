import { useState } from "react";
import CardHeader from "../../components/emailtemplates/CardHeader";
import Button from "../../components/ui/button/Button";
import NewEmailTemplateModal from "../../components/emailtemplates/NewEmailTemplateModal";
import TableEmailTemplates from "../../components/emailtemplates/TableEmailTemplates";

export default function EmailTemplates() {
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const fetchData = () => {
    setReloadTrigger(prev => prev + 1);
  };

  return (
    <>
      <div className="grid grid-cols-12 gap-4 md:gap-6 mt-10 mb-2 px-4">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <CardHeader reloadTrigger={reloadTrigger} />
        </div>
      </div>
      <Button className="text-md mt-5 mb-3 mx-4" onClick={()=> setNewModalOpen(true)}>New Email Template</Button>

      <TableEmailTemplates reloadTrigger={reloadTrigger} onReload={fetchData}/>

      <NewEmailTemplateModal
        isOpen={newModalOpen}
        onEmailTemplateAdded={fetchData} 
        onClose={() => setNewModalOpen(false)}
      />
    </>
  );
}