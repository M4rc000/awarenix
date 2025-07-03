import { useState } from "react";
import Button from "../../components/ui/button/Button";
import NewUserModal from "../../components/usersgroups/NewUserModal";
import TableUsers from "../../components/usermanagement/TableUsers";

type Props = {
  reloadTrigger: number;
  onReload: () => void;
};

export default function ManageUser({ reloadTrigger, onReload }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = () => {
    // Trigger re-fetch via parent handler
    onReload();
  };

  return (
    <div className="">
      <Button className="text-md mt-2 mb-3" onClick={() => setModalOpen(true)}>
        New User
      </Button>

      <TableUsers reloadTrigger={reloadTrigger} onReload={fetchData}/>

      <NewUserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onUserAdded={fetchData}
      />
    </div>
  );
}