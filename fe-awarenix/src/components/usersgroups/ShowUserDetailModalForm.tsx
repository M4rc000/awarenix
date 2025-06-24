import Input from "../form/input/InputField";
import Label from "../form/Label";

// Define the ref methods that parent can call
export type ShowUserModalFormRef = {
  submitUsers: () => Promise<boolean>;
};

type User = {
  id: number;
  name: string;
  email: string;
  position: string;
  company: string;
  role: string;
  lastLogin: Date;
  createdAt: Date;
  createddBy: number;
  updatedAt: Date;
  updatedBy: number;
};

type ShowUserDetailModalFormProps = {
  isOpen: boolean
  onClose: () => void
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
                value={user.role}
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
                value={
                  user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'long',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                      timeZoneName: 'short',  
                      })
                    : ''
                }
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
                value={user.createdBy}
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
                value={
                  user.updatedAt
                    ? new Date(user.updatedAt).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'long',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                      timeZoneName: 'short',  
                      })
                    : ''
                }
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
                value={user.updatedBy}
                className="w-full mt-1"
                readonly
              />
            </div>

            <div>
              <Label>Last Login</Label>
              <Input
                placeholder="1 Jan 1970"
                value={
                  user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: 'long',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                        timeZoneName: 'short',  
                      })
                    : ''
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