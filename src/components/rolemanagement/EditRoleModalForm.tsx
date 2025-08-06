import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import Swal from "../utils/AlertContainer";
import Label from "../form/Label";
import Input from "../form/input/InputField";

export type EditRoleModalFormRef = {
  submitRoles: () => Promise<boolean>;
};

type RoleData = {
  id: number;
  name: string;
};

type RoleFormData = {
  id: number;
  name: string;
};

type EditRoleModalFormProps = {
  role: RoleData;
};

const EditRoleModalForm = forwardRef<EditRoleModalFormRef, EditRoleModalFormProps>(({ role }, ref) => {
  const [formData, setFormData] = useState<RoleFormData>(role ? {
    ...role,
  } : {
    id: 0,
    name: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof RoleFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RoleFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof RoleFormData, value: string) => {
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
    async submitRoles() {
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
          updatedBy: number;
        } = {
          name: formData.name,
          updatedBy: updatedBy,
        };

        const res = await fetch(`${API_URL}/user-roles/${role.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if(!res.ok) {
          const errorData = await res.json();
          Swal.fire({
            icon: 'error',
            text: errorData.message || 'Failed to update role.',
          });
          return false;
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

  useEffect(() => {
    if (role) {
      setFormData({
        id: role.id,
        name: role.name,
      });
    }
  }, [role]);
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
        </div>
      </div>
    </div>
  );
});

EditRoleModalForm.displayName = 'EditRoleModalForm';

export default EditRoleModalForm;
