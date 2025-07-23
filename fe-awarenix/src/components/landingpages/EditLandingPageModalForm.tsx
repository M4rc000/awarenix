import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { FaPager } from "react-icons/fa6";
import Swal from "../utils/AlertContainer";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import LandingPageBodyEditor from "./LandingPageBodyEditor";
import LabelWithTooltip from "../ui/tooltip/Tooltip";
import Select from "../form/Select"; // Import komponen Select kustom Anda

interface LandingPage {
  id: number;
  name: string;
  body: string;
  isSystemTemplate: number;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
}

type LandingPageFormData = {
  id: number;
  name: string;
  body: string;
  isSystemTemplate: number;
};

export type EditLandingPageModalFormRef = {
  submitLandingPage: () => Promise<LandingPage | null>;
};

type EditLandingPageModalFormProps = {
  landingPage: LandingPage | null;
};

const EditLandingPageModalForm = forwardRef<
  EditLandingPageModalFormRef,
  EditLandingPageModalFormProps
>((props, ref) => {
  const { landingPage } = props;

  // State untuk menyimpan role_id pengguna
  const [userRoleId, setUserRoleId] = useState<number | null>(null);
  
  // Inisialisasi formData dengan nilai default yang aman dan sesuai role
  const initialFormData: LandingPageFormData = {
    id: landingPage?.id ?? 0,
    name: landingPage?.name ?? "",
    body: landingPage?.body ?? "",
    isSystemTemplate: landingPage?.isSystemTemplate ?? 0, // Akan disesuaikan di useEffect
  };
  const [formData, setFormData] = useState<LandingPageFormData>(initialFormData);
  
  const [errors, setErrors] = useState<Partial<LandingPageFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ambil role_id pengguna dari localStorage dan atur isSystemTemplate
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const roleId = userData?.role; // Pastikan ini properti yang benar
      if (typeof roleId === "number") {
        setUserRoleId(roleId);
        // Sesuaikan isSystemTemplate berdasarkan role saat komponen dimuat atau landingPage berubah
        setFormData(prev => ({
          ...prev,
          isSystemTemplate: roleId === 1 ? (landingPage?.isSystemTemplate ?? 0) : 0,
        }));
      } else {
        setUserRoleId(null);
        setFormData(prev => ({ ...prev, isSystemTemplate: 0 }));
      }
    } catch (e) {
      console.error("Failed to parse user data from localStorage", e);
      setUserRoleId(null);
      setFormData(prev => ({ ...prev, isSystemTemplate: 0 }));
    }
  }, [landingPage]); // Tambahkan landingPage sebagai dependency

  // Reset formData ketika prop landingPage berubah
  useEffect(() => {
    if (landingPage) {
      setFormData(prev => ({
        ...prev,
        id: landingPage.id,
        name: landingPage.name,
        body: landingPage.body,
        // Pastikan isSystemTemplate diinisialisasi dengan benar berdasarkan role
        isSystemTemplate: userRoleId === 1 ? (landingPage.isSystemTemplate ?? 0) : 0,
      }));
      setErrors({}); // Bersihkan error saat data baru dimuat
    }
  }, [landingPage, userRoleId]); // Tambahkan userRoleId sebagai dependency

  // Opsi untuk komponen Select
  const templateStatusOptions = [
    { value: "0", label: "Made In" },
    { value: "1", label: "Default" },
  ];

  // Form validation function
  const validateForm = (): boolean => {
    const newErrors: Partial<LandingPageFormData> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    }
    if (!formData.body.trim()) {
      newErrors.body = "Page content cannot be empty.";
      Swal.fire({
        text: "Page content cannot be empty. Please add content in the HTML Editor.",
        icon: 'warning',
        duration: 4000
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // The main submission function exposed to the parent modal
  const submitLandingPage = async (): Promise<LandingPage | null> => {
    if (!landingPage) { // Periksa landingPage lagi sebelum submit
        console.error("No landing page data provided for update.");
        return null;
    }

    if (!validateForm()) {
      return null;
    }

    setIsSubmitting(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedBy = userData?.id || 0; 

      // Pastikan isSystemTemplate selalu 0 jika userRoleId bukan 1
      const isSystemTemplateToSend = userRoleId === 1 ? formData.isSystemTemplate : 0;

      const response = await fetch(`${API_URL}/landing-page/${formData.id}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          body: formData.body,
          isSystemTemplate: isSystemTemplateToSend, // Kirim nilai yang disesuaikan
          updatedBy: updatedBy,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Server error: ${response.status}` }));
        throw new Error(errorData.message || 'Failed to update landing page');
      }

      const updatedLandingPage: LandingPage = await response.json();

      Swal.fire({
        text: "Landing Page successfully updated!",
        icon: "success",
        duration: 2500,
      });
      
      return updatedLandingPage;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      console.error("Error updating landing page:", error);
      Swal.fire({ // Tampilkan error menggunakan Swal
        icon: 'error',
        text: errorMessage,
        duration: 3000,
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Expose the submitLandingPage function via the ref
  useImperativeHandle(ref, () => ({ submitLandingPage }));

  // Handler for form input changes
  const handleInputChange = (field: keyof LandingPageFormData, value: string | number) => {
    // Abaikan perubahan jika sedang dalam proses submit
    if (isSubmitting) {
        return;
    }

    setFormData(prev => {
      // Untuk isSystemTemplate, pastikan hanya role 1 yang bisa mengubahnya
      if (field === 'isSystemTemplate' && userRoleId !== 1) {
        return prev; // Jangan ubah jika bukan role 1
      }
      // Konversi nilai ke number jika field adalah 'isSystemTemplate'
      const finalValue = field === 'isSystemTemplate' ? Number(value) : value;

      return {
        ...prev,
        [field]: finalValue,
      };
    });

    // Clear errors for the field being edited
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Jika landingPage null, tampilkan loading atau placeholder
  if (!landingPage) {
    return (
      <div className="flex justify-center items-center h-40 text-gray-500 dark:text-gray-400">
        Loading landing page data...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border dark:border-gray-700">
        <h3 className="flex items-center text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          <FaPager className="mr-2"/> Landing Page Configuration
        </h3>
        {/* Modifikasi grid berdasarkan userRoleId */}
        <div className={`grid grid-cols-1 gap-3 
            ${userRoleId === 1 ? 'sm:grid-cols-2' : 'sm:grid-cols-1'}`}>
          <div>
            <Label htmlFor="page-name">Name</Label>
            <Input
              id="page-name"
              placeholder="e.g., Microsoft Login Campaign"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full text-sm sm:text-base h-10 px-3 ${errors.name ? 'border-red-500': ''}`}
              disabled={isSubmitting}
              required
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          {/* Conditional rendering untuk Template Status */}
          {userRoleId === 1 && (
            <div>
              <LabelWithTooltip position="left" tooltip="Templates status means is default template by system or created from user">Template Status</LabelWithTooltip>
              <Select
                placeholder="Choose Template Type"
                options={templateStatusOptions}
                value={String(formData.isSystemTemplate)}
                onChange={(val: string) => handleInputChange('isSystemTemplate', val)}
                className={`w-full text-sm sm:text-base h-11 px-3 ${
                  errors.isSystemTemplate ? 'border-red-500' : ''
                }`}
              />
              {errors.isSystemTemplate && (
                <p className="text-red-500 text-sm mt-1">{errors.isSystemTemplate}</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
        <LandingPageBodyEditor
          initialContent={formData.body}
          onBodyChange={(newBody) => handleInputChange('body', newBody)}
        />
      </div>
    </div>
  );
});

export default EditLandingPageModalForm;