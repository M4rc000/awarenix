import Input from "../form/input/InputField";
import Label from "../form/Label";
import {formatUserDate} from "../utils/DateFormatter";

type User = {
  id: number;
  name: string;
  email: string;
  position: string;
  company: string;
  isActive: string;
  role: string;
  roleName: string;
  lastLogin: string;
  createdAt: string;
  createdBy: number;
  createdByName: string;
  updatedAt: string;
  updatedBy: number;
  updatedByName: string;
};

type ShowUserDetailModalFormProps = {
  // isOpen: boolean
  // onClose: () => void
  user: User | null; 
};

const ShowUserDetailModalForm = ({ user }: ShowUserDetailModalFormProps) => {
  if (!user) return null;
  return (
    <div className="space-y-4">
      <div className="rounded-xl">
          <div className="space-y-3 grid grid-cols-1 xl:grid-cols-2 gap-3">
            <div>
              <Label>Name</Label>
              <Input
                placeholder="Name"
                value={user.name}
                readonly
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                placeholder="Email"
                type="email"
                value={user.email}
                readonly
              />
            </div>

            <div>
              <Label>Position</Label>
              <Input
                placeholder="Position"
                value={user.position}
                readonly
              />
            </div>

            <div>
              <Label>Company</Label>
              <Input
                placeholder="Company"
                value={user.company}
                readonly
              />
            </div>

            <div>
              <Label>Role</Label>
              <Input
                placeholder="Role"
                value={user.roleName}
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
                value={formatUserDate(user.createdAt)}
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
                value={user.createdByName}
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
                value={formatUserDate(user.updatedAt)}
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
                value={user.updatedByName}
                className="w-full mt-1"
                readonly
              />
            </div>

            <div>
              <Label>Last Login</Label>
                <Input
                  placeholder="Never logged in"
                  value={
                    !user.lastLogin ||
                    user.lastLogin === "0000-00-00 00:00:00" ||
                    isNaN(Date.parse(user.lastLogin)) ||
                    new Date(user.lastLogin).getFullYear() === 1 ||
                    new Date(user.lastLogin).getTime() === 0
                      ? 'Never logged in'
                      : new Date(user.lastLogin).toLocaleString('en-GB', {
                          year: 'numeric',
                          month: 'long',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                          timeZoneName: 'short',  
                        })
                  }
                  readonly
                />
            </div>
          </div>
      </div>
    </div>
)};

ShowUserDetailModalForm.displayName = 'ShowUserDetailModalForm';

export default ShowUserDetailModalForm;