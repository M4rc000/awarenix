import Input from "../form/input/InputField";
import Label from "../form/Label";
import {formatUserDate} from "../utils/DateFormatter";

type Role = {
  id: number;
  name: string;
  createdAt: string;
  createdBy: number;
  createdByName: string;
  updatedAt: string;
  updatedBy: number;
  updatedByName: string;
};

type ShowRoleDetailModalFormProps = {
  role: Role | null; 
};

const ShowRoleDetailModalForm = ({ role }: ShowRoleDetailModalFormProps) => {
  if (!role) return null;
  return (
    <div className="space-y-4">
      <div className="rounded-xl">
          <div className="space-y-3 grid grid-cols-1 xl:grid-cols-2 gap-3">
            <div>
              <Label>Name</Label>
              <Input
                placeholder="Name"
                value={role.name}
                readonly
              />
            </div>   
            <div>
              <Label htmlFor="created-at" className="text-sm font-medium">
                Created At
              </Label>
              <Input
                id="created-at"
                type="text"
                value={formatUserDate(role.createdAt)}
                className="w-full mt-1"
                readonly
              />
            </div>
            <div>
              <Label htmlFor="created-by" className="text-sm font-medium">
                Created By
              </Label>
              <Input
                id="created-by"
                type="text"
                value={role.createdByName}
                className="w-full mt-1"
                readonly
              />
            </div>
            <div>
              <Label htmlFor="updated-at" className="text-sm font-medium">
                Updated At
              </Label>
              <Input
                id="updated-at"
                type="text"
                value={formatUserDate(role.updatedAt)}
                className="w-full mt-1"
                readonly
              />
            </div>
            <div>
              <Label htmlFor="updated-by" className="text-sm font-medium">
                Updated By
              </Label>
              <Input
                id="updated-by"
                type="text"
                value={role.updatedByName}
                className="w-full mt-1"
                readonly
              />
            </div>
          </div>
      </div>
    </div>
)};

ShowRoleDetailModalForm.displayName = 'ShowRoleDetailModalForm';

export default ShowRoleDetailModalForm;