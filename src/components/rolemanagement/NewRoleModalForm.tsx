import { forwardRef, useState, useImperativeHandle } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Swal from "../utils/AlertContainer";

type Role = {
  name: string;
}

export type NewRoleModalFormRef = {
  submitRoles: () => Promise<boolean>;
  role: Role | null;
};

type NewRoleModalFormProps = {
  onSuccess?: () => void;
};


type RoleData = {
  name: string;
};

const NewRoleModalForm = forwardRef<NewRoleModalFormRef, NewRoleModalFormProps>(({ onSuccess }, ref) => {
  const [role, setRole] = useState<RoleData>({
    name: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RoleData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Partial<RoleData> = {};

    if (!role.name.trim()) {
      newErrors.name = "Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit function dengan better error handling
  const submitRoles = async (): Promise<boolean> => {

    if (!validateForm()) {
      return false;
    }

    setIsSubmitting(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const createdBy = userData?.id || 0; 
      const response = await fetch(`${API_URL}/user-roles/create`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: role.name,
          createdBy: createdBy
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create role';
        
        // Cek content type sebelum parsing
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
              if (errorData.status === "error") {
                // SET ERRORS KE FORM FIELD JIKA ADA
                if (errorData.fields && typeof errorData.fields === "object") {
                  setErrors(errorData.fields);
                }
                errorMessage = errorData.message || "Something went wrong";
              }
          } catch (jsonError) {
            console.error('Failed to parse JSON error:', jsonError);
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
        } else {
          // Jika bukan JSON, jangan coba parse sebagai JSON
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      Swal.fire({
        text: "Role successfully added!",
        icon: "success",
        duration: 3000
      });

      if (onSuccess) onSuccess(); 

      // Reset form on success
      setRole({
        name: "",
      });
      setErrors({});
      
      return true;
      
    } catch (error) {
      console.error('Error creating role:', error);

      // Set error message untuk role
      if (error instanceof Error) {
        // Cek jika error terkait network
        if (error.message.includes('fetch')) {
          setErrors({
            name: 'Connection error. Please check if server is running.',
          });
        } else {
          setErrors({
            name: error.message,
          });
        }
      }
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    submitRoles,
    role: role as RoleData,
  }));

  // Handle input changes - dengan safety check
  const handleInputChange = (field: keyof RoleData, value: string) => {
    // Prevent submit trigger dari input change
    if (isSubmitting) {
      return;
    }
    
    setRole(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when role starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Handle form submit (untuk prevent default jika ada)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="rounded-xl">
          <div className="space-y-3 grid grid-cols-1 xl:grid-cols-2 gap-3">
            <div>
              <Label required>Name</Label>
              <Input
                placeholder="Name"
                value={role.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={isSubmitting}
                className={errors.name ? 'border-red-500' : ''}
                required
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
});

NewRoleModalForm.displayName = 'NewRoleModalForm';

export default NewRoleModalForm;