import { forwardRef, useState, useImperativeHandle, useEffect } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Swal from "../utils/AlertContainer";
import LabelWithTooltip from "../ui/tooltip/Tooltip";
import Select from "../form/Select";

type User = {
  name: string;
  email: string;
  position: string;
  password: string;
  role: string;
  company: string;
  isActive: string;
}

export type NewUserModalFormRef = {
  // submitUsers: () => Promise<User | null>;
  submitUsers: () => Promise<boolean>;
  user: User | null;
};

type NewUserModalFormProps = {
  onSuccess?: () => void;
};

// Define user data structure
type UserData = {
  name: string;
  email: string;
  position: string;
  role: string;
  company: string;
  password: string;
  isActive: string;
};

const statusOption = [
  { value: "0", label: "Not Active"},
  { value: "1", label: "Active"}
];

type RoleData = {
  id: number;
  name: string;
};

const NewUserModalForm = forwardRef<NewUserModalFormRef, NewUserModalFormProps>(({ onSuccess }, ref) => {
  const [user, setUser] = useState<UserData>({
    name: "",
    email: "",
    position: "",
    password: "",
    role: "",
    company: "",
    isActive: "0",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UserData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      
      if (result.Success && result.Data) {
        // Transform API data to select options format
        const options = result.Data.map((role: RoleData) => ({
          value: String(role.id), 
          label: role.name,
        }));
        
        setRoleOptions(options);
      } else {
        console.error('Failed to fetch roles:', result.Message);
        setRoleOptions([
          { value: "1", label: "Super Admin"},
          { value: "2", label: "Admin"},
          { value: "3", label: "Engineer"}
        ]);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRoleOptions([
        { value: "1", label: "Super Admin"},
        { value: "2", label: "Admin"},
        { value: "3", label: "Engineer"}
      ]);
    }
  };

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles();
  }, []);


  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Partial<UserData> = {};

    if (!user.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!user.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!user.position.trim()) {
      newErrors.position = "Position is required";
    }

    if (!user.role.trim()) {
      newErrors.role = "Role is required";
    }

    if (!user.password) {
      newErrors.password = "Password is required";
    } else if (user.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit function dengan better error handling
  const submitUsers = async (): Promise<boolean> => {
    
    if (!validateForm()) {
      // console.log('Validation failed');
      return false;
    }

    setIsSubmitting(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const createdBy = userData?.id || 0; 
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          position: user.position,   
          role: parseInt(user.role),   
          isActive: user.isActive,   
          password: user.password,    
          createdBy: createdBy
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create user';
        
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
        text: "User successfully added!",
        icon: "success",
        duration: 3000
      });

      if (onSuccess) onSuccess(); 

      // Reset form on success
      setUser({
        name: "",
        email: "",
        position: "",
        password: "",
        role: "",
        company: "",
        isActive: "0",
      });
      setErrors({});
      
      return true;
      
    } catch (error) {
      console.error('Error creating user:', error);
      
      // Set error message untuk user
      if (error instanceof Error) {
        // Cek jika error terkait network
        if (error.message.includes('fetch')) {
          setErrors({
            name: 'Connection error. Please check if server is running.',
          });
        } else if (error.message.toLowerCase().includes('email')) {
          setErrors({
            email: error.message,
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
    submitUsers,
    user: user as User,
  }));

  // Handle input changes - dengan safety check
  const handleInputChange = (field: keyof UserData, value: string) => {
    // Prevent submit trigger dari input change
    if (isSubmitting) {
      return;
    }
    
    setUser(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
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
                value={user.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={isSubmitting}
                className={errors.name ? 'border-red-500' : ''}
                required
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label required>Email</Label>
              <Input
                placeholder="Email"
                type="email"
                value={user.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isSubmitting}
                className={errors.email ? 'border-red-500' : ''}
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <LabelWithTooltip tooltip="Position on user's company" required>Position</LabelWithTooltip>
              <Input
                placeholder="Position"
                value={user.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                disabled={isSubmitting}
                className={errors.position ? 'border-red-500' : ''}
                required
              />
              {errors.position && (
                <p className="text-red-500 text-sm mt-1">{errors.position}</p>
              )}
            </div>

            <div>
              <LabelWithTooltip tooltip="Role on this system" required>Role</LabelWithTooltip>
              <Select
                value={user.role}
                options={roleOptions}
                onChange={(val) => handleInputChange('role', val)} 
                placeholder={"Select role"}
                required
              />
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">{errors.role}</p>
              )}
            </div>
            
            <div>
              <Label required>Password</Label>
              <Input
                placeholder="Password"
                type="password"
                value={user.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={isSubmitting}
                className={errors.password ? 'border-red-500' : ''}
                required
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <LabelWithTooltip tooltip="Status means active or not for user" required>Status</LabelWithTooltip>
              <Select
                value={user.isActive}
                options={statusOption}
                onChange={(val) => handleInputChange('isActive', val)}
                required
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
});

NewUserModalForm.displayName = 'NewUserModalForm';

export default NewUserModalForm;