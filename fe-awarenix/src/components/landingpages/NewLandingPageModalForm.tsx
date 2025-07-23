import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { FaPager } from "react-icons/fa6";
import Swal from "../utils/AlertContainer";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import LandingPageBodyEditor from "./LandingPageBodyEditor";
import LabelWithTooltip from "../ui/tooltip/Tooltip";
import Select from "../form/Select";

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
  name: string;
  body: string;
  isSystemTemplate: number;
};

export type NewLandingPageModalFormRef = {
  submitLandingPage: () => Promise<LandingPage | null>;
};

const NewLandingPageModalForm = forwardRef<NewLandingPageModalFormRef>(
  (_props, ref) => {
    const [formData, setFormData] = useState<LandingPageFormData>({
      name: "",
      body: "",
      isSystemTemplate: 0,
    });

    const [errors, setErrors] = useState<Partial<LandingPageFormData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userRoleId, setUserRoleId] = useState<number | null>(null); // State untuk menyimpan role_id

    // Ambil role_id pengguna dari localStorage saat komponen dimuat
    useEffect(() => {
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const roleId = userData?.role; // Sesuaikan jika propertinya adalah 'role_id'
        if (typeof roleId === "number") {
          setUserRoleId(roleId);
          // Jika role_id bukan 1, set isSystemTemplate ke 0 di awal
          if (roleId !== 1) {
            setFormData((prev) => ({ ...prev, isSystemTemplate: 0 }));
          }
        } else {
          setUserRoleId(null);
          setFormData((prev) => ({ ...prev, isSystemTemplate: 0 }));
        }
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        setUserRoleId(null);
        setFormData((prev) => ({ ...prev, isSystemTemplate: 0 }));
      }
    }, []); // [] agar hanya berjalan sekali saat mount

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
          icon: "warning",
          duration: 4000,
        });
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    // The main submission function exposed to the parent modal
    const submitLandingPage = async (): Promise<LandingPage | null> => {
      if (!validateForm()) {
        return null; // Return null if validation fails
      }

      setIsSubmitting(true);

      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const createdBy = userData?.id || 0;

        // Pastikan isSystemTemplate selalu 0 jika userRoleId bukan 1
        const isSystemTemplateToSend = userRoleId === 1 ? formData.isSystemTemplate : 0;

        const response = await fetch(`${API_URL}/landing-page/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            body: formData.body,
            isSystemTemplate: isSystemTemplateToSend, // Kirim nilai yang disesuaikan
            createdBy: createdBy,
          }),
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: `Server error: ${response.status}` }));
          throw new Error(errorData.message || "Failed to create landing page");
        }

        const createdLandingPage: LandingPage = await response.json();

        Swal.fire({
          text: "Landing Page successfully added!",
          icon: "success",
          duration: 2500,
        });

        // Reset form state after successful submission
        setFormData({ name: "", body: "", isSystemTemplate: 0 });
        setErrors({});

        // Return the successfully created object
        return createdLandingPage;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred.";
        setErrors({ name: errorMessage }); // Display error message near the relevant field
        return null; // Return null on failure
      } finally {
        setIsSubmitting(false);
      }
    };

    // Expose the submitLandingPage function via the ref
    useImperativeHandle(ref, () => ({ submitLandingPage }));

    // Handler for form input changes
    const handleInputChange = (field: keyof LandingPageFormData, value: string | number) => { // Perbarui tipe value
      setFormData((prev) => {
        // Untuk isSystemTemplate, pastikan hanya role 1 yang bisa mengubahnya
        if (field === "isSystemTemplate" && userRoleId !== 1) {
          return prev; // Jangan ubah jika bukan role 1
        }
        // Konversi value ke number jika field adalah isSystemTemplate
        const finalValue = field === "isSystemTemplate" ? Number(value) : value;

        return {
          ...prev,
          [field]: finalValue,
        };
      });

      // Clear errors for the field being edited
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    };

    return (
      <div className="space-y-6 p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border dark:border-gray-700">
          <h3 className="flex items-center text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            <FaPager className="mr-2" /> Landing Page Configuration
          </h3>
          {/* Modifikasi di sini: gunakan kelas CSS kondisional */}
          <div className={`grid grid-cols-1 gap-3 
              ${userRoleId === 1 ? 'sm:grid-cols-2' : 'sm:grid-cols-1'}`}>
            <div>
              <Label htmlFor="page-name">Name</Label>
              <Input
                id="page-name"
                placeholder="e.g., Microsoft Login"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full text-sm sm:text-base h-10 px-3 ${
                  errors.name ? "border-red-500" : ""
                }`}
                disabled={isSubmitting}
                required
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>
            {/* Conditional rendering untuk Template Status */}
            {userRoleId === 1 && (
              <div>
                <LabelWithTooltip
                  position="left"
                  tooltip="Templates status means is default template by system or created from user"
                >
                  Template Status
                </LabelWithTooltip>
                <Select
                  placeholder="Choose Template Type"
                  options={templateStatusOptions}
                  value={String(formData.isSystemTemplate)}
                  onChange={(val: string) =>
                    handleInputChange("isSystemTemplate", val)
                  }
                  className={`w-full text-sm sm:text-base h-11 px-3 ${
                    errors.isSystemTemplate ? "border-red-500" : ""
                  }`}
                />
                {errors.isSystemTemplate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.isSystemTemplate}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
          <LandingPageBodyEditor
            initialContent={formData.body}
            onBodyChange={(newBody) => handleInputChange("body", newBody)}
          />
        </div>
      </div>
    );
  }
);

export default NewLandingPageModalForm;