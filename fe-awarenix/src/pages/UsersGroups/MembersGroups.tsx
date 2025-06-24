import { useState, useEffect } from "react";
import CardHeader from "../../components/usersgroups/CardHeader";
import Button from "../../components/ui/button/Button";
import NewGroupModal from "../../components/usersgroups/NewGroupModal";
import TableGroups from "../../components/usersgroups/TableGroups";

export default function MembersGroups() {
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = () => {
    setReloadTrigger(prev => prev + 1);
  };

  useEffect(() => {
  }, [reloadTrigger]);

  return (
    <>
      <div className="grid grid-cols-12 gap-4 md:gap-6 mt-10 px-3">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <CardHeader reloadTrigger={reloadTrigger} />
        </div>
      </div>

      <div className="px-4 mt-5">
        <Button className="text-md mt-2 mb-3" onClick={() => setModalOpen(true)}>New Group</Button>
        <TableGroups reloadTrigger={reloadTrigger} onReload={fetchData} />
        <NewGroupModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onGroupAdded={() => {
            setModalOpen(false);
            fetchData();
          }}
        />
      </div>
    </>
  );
}