import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
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

type UserData = {
  id: number;
  name: string;
  email: string;
  position: string;
  password?: string;
  role: number;
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

type RoleData = {
  id: number;
  name: string;
};

type EditUserModalFormProps = {
  user: UserData;
};

// --- Component ---
const EditUserModalForm = forwardRef<EditUserModalFormRef, EditUserModalFormProps>(({ user }, ref) => {
  const [formData, setFormData] = useState<UserFormData>(user ? {
    ...user,
    isActive: user.isActive ? "1" : "0",
    role: String(user.role || ""),
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
  const [roleOptions, setRoleOptions] = useState<{ value: string; label: string }[]>([]);

  // Fetch Roles
  const fetchRoles = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/user-roles/all`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch roles: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success' && result.data) { 
        // Transform API data to select options format
        const options = result.data.map((role: RoleData) => ({
          value: role.id,
          label: role.name,
        }));

        setRoleOptions(options);
      } else {
        console.error('Failed to fetch roles:', result.message || 'Unknown error'); 
        // Fallback to default options if API fails or response format is unexpected
        setRoleOptions([
          { value: "1", label: "Super Admin" },
          { value: "2", label: "Admin" },
          { value: "3", label: "Engineer" }
        ]);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      // Fallback to default options if API fails
      setRoleOptions([
        { value: "1", label: "Super Admin" },
        { value: "2", label: "Admin" },
        { value: "3", label: "Engineer" }
      ]);
    }
  };

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles();
  }, []);

  // Effect to update formData.role once roleOptions are loaded or user prop changes
  useEffect(() => {
    if (roleOptions.length > 0 && user) {
      // Check if the user's current role exists in the fetched options
      const userRoleExists = roleOptions.some(option => option.value === String(user.role));
      
      setFormData(prev => ({
        ...prev,
        // If user's role exists in options, use it. Otherwise, default to the first option.
        role: userRoleExists ? String(user.role) : (roleOptions[0]?.value || ""),
      }));
    } else if (roleOptions.length > 0 && !user) {
      // If no user is provided (e.g., for add user form), default to the first role option
      setFormData(prev => ({
        ...prev,
        role: roleOptions[0]?.value || "",
      }));
    }
  }, [roleOptions, user]); // Depend on roleOptions and user prop

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

    // Validasi role: pastikan role tidak kosong dan ada di dalam roleOptions yang tersedia
    if (!formData.role.trim() || !roleOptions.some(option => option.value === formData.role)) {
      newErrors.role = "Role is required and must be a valid option";
    }

    if (!formData.isActive.trim() || !["0", "1"].includes(formData.isActive)) {
      newErrors.isActive = "Status is required";
    }

    // Validasi password hanya jika diisi (tidak kosong)
    if (formData.password && formData.password.length > 0 && formData.password.length < 6) {
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
          role: number;
          company: string;
          isActive: number;
          updatedBy: number;
          password?: string;
        } = {
          name: formData.name,
          email: formData.email,
          position: formData.position,
          role: parseInt(formData.role),
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

        if (updatedBy === formData.id) {
          localStorage.setItem('user', JSON.stringify(data.data));
          setUser(data.data); 
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
  // Tampilkan form hanya jika roleOptions sudah dimuat
  if (!user) return null; // Tetap cek user prop
  if (roleOptions.length === 0 && !isSubmitting) { // Tambahkan kondisi loading untuk roleOptions
    return <div className="text-center py-4">Loading roles...</div>;
  }

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
              options={roleOptions}
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
