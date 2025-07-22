import { useState, useEffect } from "react";
import Button from "../../components/ui/button/Button";
import NewUserModal from "../../components/usermanagement/NewUserModal";
import TableUsers from "../../components/usermanagement/TableUsers";
import CardHeader from "../../components/usermanagement/CardHeader";

export default function UserManagement() { // Sekarang UserManagement tidak menerima props lagi
  const [modalOpen, setModalOpen] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const fetchData = () => {
    setReloadTrigger(prev => prev + 1); 
  };

  useEffect(() => {
  }, [reloadTrigger]);


  return (
    <div className="p-4 min-h-screen">
      <div className="grid grid-cols-12 gap-4 md:gap-6 mb-5">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <CardHeader reloadTrigger={reloadTrigger}/>
        </div>
      </div>

      <Button
        className="text-md mt-3 mb-4 px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out text-white"
        onClick={() => {
          setModalOpen(true);
        }}
      >
        New User
      </Button>

      <TableUsers reloadTrigger={reloadTrigger} onReload={fetchData}/>

      <NewUserModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
        onUserAdded={() => {
          setModalOpen(false);
          fetchData();
        }}
      />
    </div>
  );
}