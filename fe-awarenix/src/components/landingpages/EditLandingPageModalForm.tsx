import { useState, forwardRef, useImperativeHandle } from "react";
import { FaPager } from "react-icons/fa6";
import Swal from "../utils/AlertContainer";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import LandingPageBodyEditor from "./LandingPageBodyEditor";

interface LandingPage {
  id: number;
  name: string;
  body: string;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
}

type LandingPageFormData = {
  id: number;
  name: string;
  body: string;
};

export type EditLandingPageModalFormRef = {
  submitLandingPage: () => Promise<LandingPage | null>;
};

type EditLandingPageModalFormProps = {
    landingPage: LandingPage | null
};

const EditLandingPageModalForm = forwardRef<EditLandingPageModalFormRef, EditLandingPageModalFormProps>(
  (props, ref) => {
    const { landingPage } = props;
    const [formData, setFormData] = useState<LandingPageFormData>({
      id: landingPage?.id ?? 0,
      name: landingPage?.name ?? "",
      body: landingPage?.body ?? "",
    });

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

        const response = await fetch(`${API_URL}/landing-page/${formData.id}`, {
          method: 'PUT',
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            body: formData.body,
            updatedBy: createdBy,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `Server error: ${response.status}` }));
          throw new Error(errorData.message || 'Failed to create landing page');
        }

        const createdLandingPage: LandingPage = await response.json();

        Swal.fire({
          text: "Landing Page successfully added!",
          icon: "success",
          duration: 2500,
        });
        
        // Reset form state after successful submission
        setFormData({ id: 0, name: "", body: "" });
        setErrors({});

        // Return the successfully created object
        return createdLandingPage;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        setErrors({ name: errorMessage }); // Display error message near the relevant field
        return null; // Return null on failure
      } finally {
        setIsSubmitting(false);
      }
    };

    // Expose the submitLandingPage function via the ref
    useImperativeHandle(ref, () => ({ submitLandingPage }));

    // Handler for form input changes
    const handleInputChange = (field: keyof LandingPageFormData, value: string) => {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));

      // Clear errors for the field being edited
      if (errors[field]) {
        setErrors(prev => {
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
            <FaPager className="mr-2"/> Landing Page Configuration
          </h3>
          <div className="grid grid-cols-1">
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
  }
);

export default EditLandingPageModalForm;