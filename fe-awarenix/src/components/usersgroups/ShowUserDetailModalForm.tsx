import Input from "../form/input/InputField";
import Label from "../form/Label";

// Define the ref methods that parent can call
export type ShowUserModalFormRef = {
  submitUsers: () => Promise<boolean>;
};

type UserData = {
  name: string;
  email: string;
  position: string;
  company: string;
  role: string;
  lastLogin: Date;
};

type ShowUserDetailModalFormProps = {
  user: UserData;
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