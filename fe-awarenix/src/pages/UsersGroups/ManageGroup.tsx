import { useState } from "react";
import Button from "../../components/ui/button/Button";
import NewGroupModal from "../../components/usersgroups/NewGroupModal";
import TableUsersGroups from "../../components/usersgroups/TableGroups";

type ManageGroupProps = {
  reloadTrigger: number;
  onReload: () => void;
};

export default function ManageGroup({reloadTrigger, onReload}: ManageGroupProps) {
    const [modalOpen, setModalOpen] = useState(false);
    return (
        <div>
            <Button className="text-md mt-2 mb-3" onClick={()=> setModalOpen(true)}>New Group</Button>
            <TableUsersGroups/>
            <NewGroupModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
            />
        </div>
    );
}