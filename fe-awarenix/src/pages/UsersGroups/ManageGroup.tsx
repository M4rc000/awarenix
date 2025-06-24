import { useState } from "react";
import Button from "../../components/ui/button/Button";
import NewGroupModal from "../../components/usersgroups/NewGroupModal";
import TableUsersGroups from "../../components/usersgroups/TableGroups";

type ManageGroupProps = {
  reloadTrigger: number;
  onReload: () => void;
};

export default function ManageGroup({onReload}: ManageGroupProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const fetchData = () => {
        onReload();
    }
    return (
        <div>
            <Button className="text-md mt-2 mb-3" onClick={()=> setModalOpen(true)}>New Group</Button>
            <TableUsersGroups/>
            <NewGroupModal
                onGroupAdded={fetchData}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
            />
        </div>
    );
}