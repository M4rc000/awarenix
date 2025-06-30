import { forwardRef, useImperativeHandle, useState } from "react";
import Swal from "../utils/AlertContainer";
import { useUserSession } from "../context/UserSessionContext";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import LabelWithTooltip from "../ui/tooltip/Tooltip";

// --- Type Definitions ---
export type EditUserModalFormRef = {
  submitUsers: () => Promise<boolean>;
};

const statusOption = [
  { value: "0", label: "Not Active" },
  { value: "1", label: "Active" },
];

const roleOption = [
  { value: "Admin", label: "Admin" },
  { value: "User", label: "User" },
];

type UserData = {
  id: number;
  name: string;
  email: string;
  position: string;
  password?: string;
  role: string;
  company: string;
  isActive: string;
};

type UserFormData = {
  id: number;
  name: string;
  email: string;
  position: string;
  password: string;
  role: string; 
  company: string;
  isActive: string; 
};

type EditUserModalFormProps = {
  user: UserData;
};

// --- Component ---
const EditUserModalForm = forwardRef<EditUserModalFormRef, EditUserModalFormProps>(({ user }, ref) => {
  const [formData, setFormData] = useState<UserFormData>(user ? {
    ...user,
    isActive: user.isActive ? "1" : "0",
    role: user.role === "Admin" ? "Admin" : "User",
    password: "", 
  } : {
    id: 0,
    name: "",
    email: "",
    position: "",
    password: "",
    role: "",
    company: "",
    isActive: "0",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUser } = useUserSession();
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.position.trim()) {
      newErrors.position = "Position is required";
    }

    if (!formData.role.trim() || !["Admin", "Member"].includes(formData.role)) {
      newErrors.role = "Role is required";
    }

    if (!formData.isActive.trim() || !["0", "1"].includes(formData.isActive)) {
      newErrors.isActive = "Status is required";
    }

    // Validasi password hanya jika diisi (tidak kosong)
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  useImperativeHandle(ref, () => ({
    async submitUsers() {
      if (isSubmitting) return false;

      if (!validateForm()) {
        return false;
      }

      setIsSubmitting(true);

      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");
        const currentUserData = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedBy = currentUserData?.id || 0;

        const payload: {
          name: string;
          email: string;
          position: string;
          role: string;
          company: string;
          isActive: number;
          updatedBy: number;
          password?: string;
        } = {
          name: formData.name,
          email: formData.email,
          position: formData.position,
          role: formData.role,
          company: formData.company,
          isActive: parseInt(formData.isActive),
          updatedBy: updatedBy,
        };

        // Hanya kirim password jika diisi
        if (formData.password.trim()) {
          payload.password = formData.password;
        }

        const res = await fetch(`${API_URL}/users/${user.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) { 
          Swal.fire({
            icon: 'error',
            text: data.message || data.error || 'Failed to update user.',
          });
          return false;
        }

        if (updatedBy === formData.id) {
          localStorage.setItem('user', JSON.stringify(data.Data));
          setUser(data.Data);
        }

        return true;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'an unexpected error occurred.';
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

  // --- Render Form ---
  if (!user) return null;
  return (
    <div className="space-y-4">
      <div className="rounded-xl">
        <div className="space-y-3 grid grid-cols-1 xl:grid-cols-2 gap-3">
          {/* Name Input */}
          <div>
            <Label required>Name</Label>
            <Input
              placeholder="Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={isSubmitting}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Email Input */}
          <div>
            <Label required>Email</Label>
            <Input
              placeholder="example@domain.com"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={isSubmitting}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Position Input */}
          <div>
            <LabelWithTooltip tooltip="Position in user company" required>Position</LabelWithTooltip>
            <Input
              placeholder="Project Management"
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              disabled={isSubmitting}
              className={errors.position ? 'border-red-500' : ''}
            />
            {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
          </div>

          {/* Company Input */}
          <div>
            <Label>Company</Label>
            <Input
              type="text"
              placeholder="Company Name"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Role Select */}
          <div>
            <LabelWithTooltip tooltip="Role in this system" required>Role</LabelWithTooltip>
            <Select
              value={formData.role}
              options={roleOption}
              onChange={(val) => handleInputChange('role', val)}
              required
              className={errors.role ? 'border-red-500' : ''}
            />
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
          </div>

          {/* Status Select */}
          <div>
            <LabelWithTooltip tooltip="Active or inactive status for a user" required>Status</LabelWithTooltip>
            <Select
              value={formData.isActive}
              options={statusOption}
              onChange={(val) => handleInputChange('isActive', val)}
              required
              className={errors.isActive ? 'border-red-500' : ''}
            />
            {errors.isActive && <p className="text-red-500 text-sm mt-1">{errors.isActive}</p>}
          </div>

          {/* Password Input */}
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Leave blank if you do not want to change the password."
              value={formData.password} 
              onChange={(e) => handleInputChange('password', e.target.value)}
              disabled={isSubmitting}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
        </div>
      </div>
    </div>
  );
});

EditUserModalForm.displayName = 'EditUserModalForm';

export default EditUserModalForm;