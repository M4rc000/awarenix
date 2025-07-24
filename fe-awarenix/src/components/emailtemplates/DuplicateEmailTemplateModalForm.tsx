import { useState, useEffect, useCallback } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Tabs from "../common/Tabs";
import { forwardRef, useImperativeHandle } from "react";
import { LuLayoutTemplate } from "react-icons/lu";
import EmailBodyEditorTemplate from "./EmailBodyEditorTemplate";
import LabelWithTooltip from "../ui/tooltip/Tooltip";
import Select from "../form/Select"; 
import Swal from "../utils/AlertContainer";

type EmailTemplate = {
  id: number;
  name: string;
  envelopeSender: string;
  subject: string;
  bodyEmail: string;
  isSystemTemplate: number;
  language: string; 
}

export type DuplicateEmailTemplateModalFormRef = {
  submitEmailTemplate: () => Promise<boolean>;
};

type DuplicateEmailTemplateModalFormProps = {
  onSuccess?: () => void;
  emailTemplate?: EmailTemplate | null;
};

type EmailTemplateData = {
  templateName: string;
  envelopeSender: string;
  subject: string;
  bodyEmail: string;
  isSystemTemplate: number;
  language: string; 
};

const DuplicateEmailTemplateModalForm = forwardRef<DuplicateEmailTemplateModalFormRef, DuplicateEmailTemplateModalFormProps>(
  ({ emailTemplate, onSuccess }, ref) => {
    // State untuk menyimpan role pengguna yang sedang login
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

    // Ambil role pengguna saat komponen dimuat
    useEffect(() => {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const roleFromLocalStorage = userData?.role; 
      if (roleFromLocalStorage !== undefined && roleFromLocalStorage !== null) {
        setCurrentUserRole(String(roleFromLocalStorage));
      }
    }, []);

    // Inisialisasi formData
    const [formData, setFormData] = useState<EmailTemplateData>(() => {
      // isSystemTemplate diatur berdasarkan role atau default ke 0
      const initialIsSystemTemplate = currentUserRole === "1" ? (emailTemplate?.isSystemTemplate || 0) : 0;
      return {
        templateName: "Copy of " + (emailTemplate?.name || ""),
        envelopeSender: emailTemplate?.envelopeSender || "",
        subject: emailTemplate?.subject || "",
        bodyEmail: emailTemplate?.bodyEmail || "",
        isSystemTemplate: initialIsSystemTemplate, // Diatur berdasarkan role
        language: emailTemplate?.language || "Indonesia", // Inisialisasi language
      };
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<EmailTemplateData>>({});

    // Opsi untuk language type
    const languageOptions = [
      { value: "indonesia", label: "Indonesia" },
      { value: "english", label: "English" },
    ];

    // Opsi untuk Email Template Status (untuk komponen Select)
    const systemTemplateOptions = [
      { value: "0", label: "Made In" },
      { value: "1", label: "Default" },
    ];

    // VALIDATION FUNCTION
    const validateForm = (): boolean => {
      const newErrors: Partial<EmailTemplateData> = {};

      if (!formData.templateName.trim()) {
        newErrors.templateName = "Name is required";
      }
      if (!formData.envelopeSender.trim()) {
        newErrors.envelopeSender = "Envelope Sender is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.envelopeSender)) {
        newErrors.envelopeSender = "Please enter a valid email";
      }
      if (!formData.subject.trim()) {
        newErrors.subject = "Subject Email is required";
      }
      if (!formData.language.trim()) { // Validasi untuk language
        newErrors.language = "Language is required";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const submitEmailTemplate = async (): Promise<boolean> => {
      // CEK VALIDASI
      if (!validateForm()) {
        let errorMessage = '';
        for (const key in errors) {
          if (errors[key as keyof EmailTemplateData]) {
            errorMessage += `${errors[key as keyof EmailTemplateData]}\n`;
          }
        }
        if (errorMessage) {
          Swal.fire({
            icon: 'error',
            text: errorMessage.replace(/\n/g, '<br/>'),
            duration: 3000,
          });
        }
        return false;
      }

      setIsSubmitting(true);

      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const createdby = userData?.id || 0;

        const payload = {
          templateName: formData.templateName,
          envelopeSender: formData.envelopeSender,
          subject: formData.subject,
          bodyEmail: formData.bodyEmail || "",
          isSystemTemplate: formData.isSystemTemplate, // Menggunakan nilai dari state formData
          language: formData.language, 
          createdBy: createdby,
        };

        const response = await fetch(`${API_URL}/email-template/create`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        
        const data = await response.json()
        if (!response.ok || data.status == "error"){
          Swal.fire({
            text: data.message,
            icon: 'error',
            duration: 3000,
          })
          return false;
        }
        
        if (onSuccess) onSuccess();

        setFormData({
          templateName: "Copy of " + (emailTemplate?.name || ""), 
          envelopeSender: emailTemplate?.envelopeSender || "",
          subject: emailTemplate?.subject || "",
          bodyEmail: emailTemplate?.bodyEmail || "",
          isSystemTemplate: currentUserRole === "1" ? (emailTemplate?.isSystemTemplate || 0) : 0, // Reset berdasarkan role
          language: emailTemplate?.language || "Indonesia", // Reset language
        });
        setErrors({});

        return true;

      } catch (error) {
        console.error('Error saving email template:', error);

        if (error instanceof Error) {
          if (error.message.includes('fetch')) {
            setErrors({ templateName: 'Connection error. Please check if server is running.' });
          } else if (error.message.toLowerCase().includes('sender')) {
            setErrors({ envelopeSender: error.message });
          } else if (error.message.toLowerCase().includes('subject')) {
            setErrors({ subject: error.message });
          } else if (error.message.toLowerCase().includes('language')) { // Penanganan error untuk language
            setErrors({ language: error.message });
          }
          else {
            setErrors({ templateName: error.message });
          }
        }

        return false;
      } finally {
        setIsSubmitting(false);
      }
    };

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({ submitEmailTemplate }));

    const handleInputChange = useCallback((field: keyof EmailTemplateData, value: string | number) => {
      if (isSubmitting) {
        return;
      }

      setFormData(prev => {
        // Cek jika nilai tidak berubah untuk mencegah re-render yang tidak perlu
        if (prev[field] === value) {
          return prev;
        }
        return {
          ...prev,
          [field]: value
        };
      });

      // Clear error when user starts typing/changing
      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: undefined
        }));
      }
    }, [isSubmitting, errors]);


    const emailTabs = [
      {
        label: (
          <div className="flex items-center justify-center gap-2">
            <LuLayoutTemplate />
            <span>Template</span>
          </div>
        ),
        content: <EmailBodyEditorTemplate
            templateName={formData.templateName}
            envelopeSender={formData.envelopeSender}
            subject={formData.subject}
            initialContent={formData.bodyEmail}
            onBodyChange={useCallback((html: string) => handleInputChange("bodyEmail", html), [handleInputChange])}
          />,
        },
    ];

    if (!emailTemplate) { // Pastikan emailTemplate ada sebelum render form
      return null;
    }

    return (
      <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            📧 Email Configuration
          </h3>
          {/* Mengubah grid-cols menjadi dinamis berdasarkan currentUserRole */}
          <div className={`grid grid-cols-1 gap-4 ${currentUserRole === "1" ? 'sm:grid-cols-5' : 'sm:grid-cols-4'}`}>
            <div>
              <Label>Template Name</Label>
              <Input
                placeholder="Welcome Email"
                type="text"
                value={formData.templateName}
                onChange={(e) => handleInputChange('templateName', e.target.value)}
                required
                disabled={isSubmitting}
                className={`w-full text-sm sm:text-base h-10 px-3 ${errors.templateName ? 'border-red-500': ''}`}
              />
              {errors.templateName && (
                <p className="text-red-500 text-sm mt-1">{errors.templateName}</p>
              )}
            </div>
            <div>
              <Label>Envelope Sender</Label>
              <Input
                placeholder="team@company.com"
                type="email"
                value={formData.envelopeSender}
                onChange={(e) => handleInputChange('envelopeSender', e.target.value)}
                required
                disabled={isSubmitting}
                className={`w-full text-sm sm:text-base h-10 px-3 ${errors.envelopeSender ? 'border-red-500' : ''}`}
              />
              {errors.envelopeSender && (
                <p className="text-red-500 text-sm mt-1">{errors.envelopeSender}</p>
              )}
            </div>
            <div>
              <Label>Subject Line</Label>
              <Input
                placeholder="Welcome to Our Platform!"
                type="text"
                required
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                disabled={isSubmitting}
                className={`w-full text-sm sm:text-base h-10 px-3 ${errors.subject ? 'border-red-500' : ''}`}
              />
              {errors.subject && (
                <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
              )}
            </div>
            {/* Template Status - Conditional rendering */}
            {currentUserRole === "1" ? (
                <div>
                    <LabelWithTooltip position="left" tooltip="Templates status means is default template by system or created from user">Template Status</LabelWithTooltip>
                    <Select
                        value={String(formData.isSystemTemplate)} // Convert number to string
                        options={systemTemplateOptions}
                        onChange={(val) => handleInputChange('isSystemTemplate', parseInt(val))}
                        placeholder={"Select Status"}
                        required={true}
                    />
                    {errors.isSystemTemplate && (
                        <p className="text-red-500 text-sm mt-1">{errors.isSystemTemplate}</p>
                    )}
                </div>
            ) : (
                // Jika bukan Super Admin, tampilkan teks non-editable "Made In"
                <div>
                    <LabelWithTooltip position="left" tooltip="This template is created by user">Template Status</LabelWithTooltip>
                    <Input
                        value="Made In" // Tampilkan default role "Made In"
                        disabled={true} // Tidak bisa diubah
                        className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed" // Styling untuk menunjukkan disabled
                    />
                    {/* Input hidden untuk memastikan nilai `isSystemTemplate` dikirimkan (0) */}
                    <input type="hidden" name="isSystemTemplate" value="0" />
                </div>
            )}
            {/* Select input for Language Type */}
            <div>
              <Label>Language Type</Label>
              <Select
                placeholder="Choose Language"
                options={languageOptions}
                value={formData.language}
                onChange={(val: string) => {
                  handleInputChange("language", val);
                }}
                className={`w-full text-sm sm:text-base h-11 px-3 ${
                  errors.language ? "border-red-500" : ""
                }`}
              />
              {errors.language && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.language}
                </p>
              )}
            </div>
          </div>
        </div>

        <Tabs tabs={emailTabs} />
      </div>
    );
  }
);

export default DuplicateEmailTemplateModalForm;
