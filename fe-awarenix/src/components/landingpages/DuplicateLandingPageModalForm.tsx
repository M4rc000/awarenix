import { useState, forwardRef, useImperativeHandle, useEffect, useCallback } from "react"; // Tambahkan useEffect, useCallback
import { FaPager } from "react-icons/fa6";
import Swal from "../utils/AlertContainer";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import LandingPageBodyEditor from "./LandingPageBodyEditor";
import LabelWithTooltip from "../ui/tooltip/Tooltip";
import Select from "../form/Select"; // ⭐ Import komponen Select Anda

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

export type DuplicateLandingPageModalFormRef = {
  submitLandingPage: () => Promise<LandingPage | null>;
};

type DuplicateLandingPageModalFormProps = {
  landingPage: LandingPage | null;
};

// Opsi untuk status template
const templateStatusOptions = [
  { value: "0", label: "Made In" },
  { value: "1", label: "Default" },
];

const DuplicateLandingPageModalForm = forwardRef<DuplicateLandingPageModalFormRef, DuplicateLandingPageModalFormProps>(
  (props, ref) => {
    const { landingPage } = props;

    // ⭐ State untuk menyimpan role pengguna yang sedang login
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

    // ⭐ Ambil role pengguna saat komponen dimuat
    useEffect(() => {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const roleFromLocalStorage = userData?.role; // Asumsi 'role' ada di localStorage
      if (roleFromLocalStorage !== undefined && roleFromLocalStorage !== null) {
        setCurrentUserRole(String(roleFromLocalStorage));
      }
    }, []);


    const [formData, setFormData] = useState<LandingPageFormData>(() => {
      // Inisialisasi awal formData
      // Jika currentUserRole adalah '1', ambil isSystemTemplate dari landingPage, jika tidak, paksa ke 0
      const initialIsSystemTemplate = (currentUserRole === "1") ? (landingPage?.isSystemTemplate ?? 0) : 0;
      return {
        id: landingPage?.id ?? 0,
        name: "Copy of " + (landingPage?.name ?? ""),
        body: landingPage?.body ?? "",
        isSystemTemplate: initialIsSystemTemplate,
      };
    });

    // ⭐ Effect untuk menyesuaikan isSystemTemplate jika role pengguna diketahui (dan bukan admin)
    useEffect(() => {
      // Jika currentUserRole sudah dimuat dan bukan '1' (Super Admin)
      // dan isSystemTemplate belum '0', paksa menjadi '0'.
      if (currentUserRole !== null && currentUserRole !== "1" && formData.isSystemTemplate !== 0) {
        setFormData(prev => ({ ...prev, isSystemTemplate: 0 }));
      }
    }, [currentUserRole, formData.isSystemTemplate]); // Dependensi: currentUserRole dan formData.isSystemTemplate

    const [errors, setErrors] = useState<Partial<LandingPageFormData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

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
      if (!validateForm()) {
        return null;
      }

      setIsSubmitting(true);

      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const createdBy = userData?.id || 0;

        const response = await fetch(`${API_URL}/landing-page/create`, {
          method: 'POST', 
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            body: formData.body,
            isSystemTemplate: formData.isSystemTemplate || 0,
            createdBy: createdBy,
          }),
        });

        
        const newLandingPage = await response.json(); 
        
        if (!response.ok || newLandingPage.status == "error"){
          Swal.fire({
            text: newLandingPage.message,
            icon: 'error',
            duration: 3000,
          })
          return null
        }
        
        Swal.fire({
          text: "Landing Page created successfully!",
          icon: "success",
          duration: 2500,
        });

        return newLandingPage; 

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        console.error("Error duplicating landing page:", error); 
        console.error("Error duplicating landing page:", errorMessage); 
        return null;
      } finally {
        setIsSubmitting(false);
      }
    };

    // Expose the submitLandingPage function via the ref
    useImperativeHandle(ref, () => ({ submitLandingPage }));

    // Handler for form input changes
    const handleInputChange = useCallback((field: keyof LandingPageFormData, value: string | number) => {
      setFormData(prev => {
        // Hanya update jika nilai berubah
        if (prev[field] === value) {
          return prev;
        }
        // Konversi nilai hanya jika field adalah 'isSystemTemplate'
        const newValue = field === 'isSystemTemplate' ? parseInt(value as string, 10) : value;
        return {
          ...prev,
          [field]: newValue,
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
    }, [errors]); // Dependensi errors ditambahkan agar useCallback tidak usang

    return (
      <div className="space-y-6 p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border dark:border-gray-700">
          <h3 className="flex items-center text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            <FaPager className="mr-2"/> Landing Page Configuration
          </h3>
          <div className="grid grid-cols-2 gap-3">
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
            {/* ⭐ Conditional rendering untuk Template Status */}
            {currentUserRole === "1" ? ( 
                <div>
                    <LabelWithTooltip position="left" tooltip="Templates status means is default template by system or created from user">Template Status</LabelWithTooltip>
                    <Select
                        value={String(formData.isSystemTemplate)} 
                        options={templateStatusOptions}
                        onChange={(val) => handleInputChange('isSystemTemplate', val)} // Mengambil string value dari Select
                        placeholder={"Select Status"}
                        required={true}
                    />
                    {errors.isSystemTemplate && (
                        <p className="text-red-500 text-sm mt-1">{errors.isSystemTemplate}</p>
                    )}
                </div>
            ) : (
                <div>
                    <LabelWithTooltip position="left" tooltip="This template is created by user">Template Status</LabelWithTooltip>
                    <Input
                        value="Made In" // Tampilkan nilai "Made In"
                        disabled={true} // Tidak bisa diubah
                        className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    />
                    {/* Hidden input untuk memastikan nilai `isSystemTemplate` (0) dikirimkan */}
                    <input type="hidden" name="isSystemTemplate" value="0" />
                </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
          <LandingPageBodyEditor
            initialContent={formData.body}
            onBodyChange={useCallback((newBody) => handleInputChange('body', newBody), [handleInputChange])} // ⭐ wrap with useCallback
          />
        </div>
      </div>
    );
  }
);

export default DuplicateLandingPageModalForm;