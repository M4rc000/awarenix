import { useState, useEffect, useCallback } from "react"; // Tambahkan useEffect, useCallback
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
  trackerImage: number;
  isSystemTemplate: number;
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
  trackerImage: number;
  isSystemTemplate: number;
};

const DuplicateEmailTemplateModalForm = forwardRef<DuplicateEmailTemplateModalFormRef, DuplicateEmailTemplateModalFormProps>(
  ({ emailTemplate, onSuccess }, ref) => {
    // ⭐ State untuk menyimpan role pengguna yang sedang login
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

    // ⭐ Ambil role pengguna saat komponen dimuat
    useEffect(() => {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const roleFromLocalStorage = userData?.role; 
      if (roleFromLocalStorage !== undefined && roleFromLocalStorage !== null) {
        setCurrentUserRole(String(roleFromLocalStorage));
      }
    }, []);

    // Inisialisasi formData
    const [formData, setFormData] = useState<EmailTemplateData>(() => {
      // Jika emailTemplate tidak ada, atau role bukan admin, set isSystemTemplate ke 0
      const initialIsSystemTemplate = currentUserRole === "1" ? (emailTemplate?.isSystemTemplate || 0) : 0;
      return {
        templateName: "Copy of " + (emailTemplate?.name || ""),
        envelopeSender: emailTemplate?.envelopeSender || "",
        subject: emailTemplate?.subject || "",
        bodyEmail: emailTemplate?.bodyEmail || "",
        trackerImage: emailTemplate?.trackerImage || 0,
        isSystemTemplate: initialIsSystemTemplate,
      };
    });

    // ⭐ Effect untuk menyesuaikan isSystemTemplate jika role berubah (misal saat komponen dimuat)
    useEffect(() => {
      // Jika currentUserRole sudah didapatkan dan bukan '1' (Super Admin)
      // dan isSystemTemplate belum '0', paksa menjadi '0'.
      // Ini juga berfungsi jika isSystemTemplate awal dari prop adalah '1'.
      if (currentUserRole !== null && currentUserRole !== "1" && formData.isSystemTemplate !== 0) {
        setFormData(prev => ({ ...prev, isSystemTemplate: 0 }));
      }
    }, [currentUserRole, formData.isSystemTemplate]); // Dependensi: currentUserRole dan isSystemTemplate

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<EmailTemplateData>>({});

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

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const submitEmailTemplate = async (): Promise<boolean> => {
      // CEK VALIDASI
      if (!validateForm()) {
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
          isSystemTemplate: formData.isSystemTemplate,
          trackerImage: formData.trackerImage,
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
          trackerImage: emailTemplate?.trackerImage || 0,
          isSystemTemplate: currentUserRole == "1" ? (emailTemplate?.isSystemTemplate || 0) : 0, 
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
          } else {
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

    // Gunakan useCallback untuk handleInputChange dan handleTrackerChange
    const handleTrackerChange = useCallback((trackerValue: number) => {
      setFormData(prev => ({ ...prev, trackerImage: trackerValue }));
      setErrors(prev => ({ ...prev, trackerImage: undefined })); // Clear error if applicable
    }, []);

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
    }, [isSubmitting, errors]); // Dependensi errors ditambahkan agar callback tidak usang


    // Opsi untuk Email Template Status (untuk komponen Select)
    const systemTemplateOptions = [
      { value: "0", label: "Made In" },
      { value: "1", label: "Default" },
    ];

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
            onTrackerChange={handleTrackerChange}
            initialTrackerValue={formData.trackerImage}
            initialContent={formData.bodyEmail}
            // ⭐ Pastikan onBodyChange juga menggunakan useCallback atau langsung fungsi inline
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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
            {/* ⭐ Conditional rendering untuk Template Status */}
            {currentUserRole == "1" ? ( 
                <div>
                    <LabelWithTooltip position="left" tooltip="Templates status means is default template by system or created from user">Template Status</LabelWithTooltip>
                    <Select
                        value={String(formData.isSystemTemplate)} // Convert number to string
                        options={systemTemplateOptions}
                        onChange={(val) => handleInputChange('isSystemTemplate', parseInt(val))}
                        placeholder={"Select Status"}
                        required={true}
                    />
                    {errors.isSystemTemplate && ( // Perbaikan: Gunakan errors.isSystemTemplate
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
          </div>
        </div>

        <Tabs tabs={emailTabs} />
      </div>
    );
  }
);

export default DuplicateEmailTemplateModalForm;