import Input from "../form/input/InputField";
import Label from "../form/Label";
import { forwardRef, useImperativeHandle, useState } from "react";
import Swal from "../utils/AlertContainer";
import { useUserSession } from "../context/UserSessionContext";
import Select from "../form/Select";
import LabelWithTooltip from "../ui/tooltip/Tooltip";

export type EditUserModalFormRef = {
  submitUsers: () => Promise<boolean>;
};

const statusOption = [
  { value: "0", label: "Not Active"},
  { value: "1", label: "Active"}
];

const roleOption = [
  { value: "Admin", label: "Admin"},
  { value: "Member", label: "Member"}
];

type UserData = {
  id: number;
  name: string;
  email: string;
  position: string;
  password: string;
  role: string;
  company: string;
  isActive: boolean;
};

type EditUserModalFormProps = {
  user: UserData;
};

const EditUserModalForm = forwardRef<EditUserModalFormRef, EditUserModalFormProps>(({ user }, ref) => {
  if (!user) return null;

  const [formData, setFormData] = useState({
    ...user,
    isActive: user.isActive === true ? "1" : "0",
    role: user.role == "Admin" ? "Admin" : "Member",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setUser } = useUserSession(); 

  useImperativeHandle(ref, () => ({
    async submitUsers() {
      if (isSubmitting) return false;

      try {
        setIsSubmitting(true);

        // Validasi minimal sebelum kirim ke server
        if (!formData.name || !formData.email || !formData.position) {
          Swal.fire({
            icon: 'warning',
            text: 'Please fill all required fields (name, email, position).',
          });
          return false;
        }

        const API_URL = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedBy = userData?.id || 0;

        const res = await fetch(`${API_URL}/users/${user.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            position: formData.position,
            password: formData.password,
            role: formData.role,
            company: formData.company,
            isActive: parseInt(formData.isActive),
            updatedBy: updatedBy,
          }),
        });

        const data = await res.json();

        if (data.Success !== true) {
          Swal.fire({
            icon: 'error',
            text: data.message || data.error || 'Failed to update user.',
          });
          return false;
        }

        // SUCCESS
        if(updatedBy == formData.id){
          localStorage.setItem('user', JSON.stringify(data.Data));
          setUser(data.Data);
        }
        return true;

      } catch (err: any) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unexpected error occurred.';
        Swal.fire({
          icon: 'error',
          text: errorMessage,
        });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
  }));

  return (
    <div className="space-y-4">
      <div className="rounded-xl">
        <div className="space-y-3 grid grid-cols-1 xl:grid-cols-2 gap-3">
          <div>
            <Label required>Name</Label>
            <Input
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label required>Email</Label>
            <Input
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <LabelWithTooltip tooltip="Position on user's company" required>Position</LabelWithTooltip>
            <Input
              placeholder="Position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label>Company</Label>
            <Input
              type="text"
              placeholder="Company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              disabled={isSubmitting}
              />
          </div>

          <div>
            <LabelWithTooltip tooltip="Role on this system" required>Role</LabelWithTooltip>
            <Select
              value={formData.role}
              options={roleOption}
              onChange={(val) =>
                setFormData({
                  ...formData,
                  role: val,
                })
              }
              required
            />
          </div>

          <div>
            <LabelWithTooltip tooltip="Status means active or not for user" required>Status</LabelWithTooltip>
            <Select
              value={formData.isActive}
                options={statusOption}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    isActive: val,
                  })
                }
                required
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="****"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  )
});

EditUserModalForm.displayName = 'EditUserModalForm';

export default EditUserModalForm;