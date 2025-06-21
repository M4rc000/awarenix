import { useState } from "react";
import CardHeader from "../../components/usersgroups/CardHeader";
import ManageGroup from "./ManageGroup";

export default function UsersGroups() {
  const [reloadTrigger, setReloadTrigger] = useState(0);
  return (
    <>
      <div className="grid grid-cols-12 gap-4 md:gap-6 mt-10 px-3">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <CardHeader reloadTrigger={reloadTrigger}/>
        </div>
      </div>
      {/* Navigation */}

      {/* Content */}
      <main className="px-3 py-8">
        <div className="max-w-4xl">
          <ManageGroup reloadTrigger={reloadTrigger} onReload={() => setReloadTrigger(r => r + 1)}/>;
        </div>
      </main>
    </>
  );
}