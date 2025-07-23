import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Tabs from "../common/Tabs";
import { LuLayoutTemplate } from "react-icons/lu";
import EmailBodyEditorTemplate from "./EmailBodyEditorTemplate";
import LabelWithTooltip from "../ui/tooltip/Tooltip";
import Swal from "../utils/AlertContainer"; // Pastikan Swal diimpor
import Select from "../form/Select"; // Import komponen Select kustom Anda

type EmailTemplate = {
  id: number;
  name: string;
  envelopeSender: string;
  subject: string;
  bodyEmail: string;
  trackerImage: number;
  isSystemTemplate: number;
};

export type EditEmailTemplateModalFormRef = {
  submitEmailTemplate: () => Promise<boolean>;
};

type EditEmailTemplateModalFormProps = {
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

const EditEmailTemplateModalForm = forwardRef<
  EditEmailTemplateModalFormRef,
  EditEmailTemplateModalFormProps
>(({ emailTemplate, onSuccess }, ref) => {
  // Pastikan emailTemplate ada sebelum melanjutkan
  const initialData: EmailTemplateData = {
    templateName: emailTemplate?.name || "",
    envelopeSender: emailTemplate?.envelopeSender || "",
    subject: emailTemplate?.subject || "",
    bodyEmail: emailTemplate?.bodyEmail || "",
    trackerImage: emailTemplate?.trackerImage || 1, // Default ke 1 jika null/undefined
    isSystemTemplate: emailTemplate?.isSystemTemplate || 0, // Default ke 0 jika null/undefined
  };

  const [formData, setFormData] = useState<EmailTemplateData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<EmailTemplateData>>({});
  const [userRoleId, setUserRoleId] = useState<number | null>(null); // State untuk menyimpan role_id

  // Ambil role_id pengguna dari localStorage saat komponen dimuat
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const roleId = userData?.role; // Sesuaikan jika propertinya adalah 'role_id'
      if (typeof roleId === "number") {
        setUserRoleId(roleId);
      } else {
        setUserRoleId(null);
      }
    } catch (e) {
      console.error("Failed to parse user data from localStorage", e);
      setUserRoleId(null);
    }
  }, []); // [] agar hanya berjalan sekali saat mount

  // Reset form data ketika emailTemplate berubah (misalnya, saat modal dibuka dengan data template lain)
  useEffect(() => {
    if (emailTemplate) {
      setFormData({
        templateName: emailTemplate.name || "",
        envelopeSender: emailTemplate.envelopeSender || "",
        subject: emailTemplate.subject || "",
        bodyEmail: emailTemplate.bodyEmail || "",
        trackerImage: emailTemplate.trackerImage || 1,
        // Pastikan isSystemTemplate diinisialisasi dengan benar berdasarkan role
        isSystemTemplate: userRoleId === 1 ? (emailTemplate.isSystemTemplate || 0) : 0, 
      });
      setErrors({}); // Bersihkan error saat data baru dimuat
    }
  }, [emailTemplate, userRoleId]); // Tambahkan userRoleId sebagai dependency

  // Opsi untuk komponen Select
  const templateStatusOptions = [
    { value: "0", label: "Made In" }, // Label diubah sesuai permintaan di komentar kode lama
    { value: "1", label: "Default" }, // Label diubah sesuai permintaan di komentar kode lama
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitEmailTemplate = async (): Promise<boolean> => {
    if (!emailTemplate) {
      console.error("No email template data provided for update.");
      return false;
    }

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
      const updatedBy = userData?.id || 0;

      // Pastikan isSystemTemplate selalu 0 jika userRoleId bukan 1
      const isSystemTemplateToSend = userRoleId === 1 ? formData.isSystemTemplate : 0;

      const response = await fetch(`${API_URL}/email-template/${emailTemplate.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          templateName: formData.templateName,
          envelopeSender: formData.envelopeSender,
          subject: formData.subject,
          bodyEmail: formData.bodyEmail || "",
          trackerImage: formData.trackerImage,
          isSystemTemplate: isSystemTemplateToSend, // Kirim nilai yang disesuaikan
          updatedBy: updatedBy,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Failed to update email template`;

        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (jsonError) {
            console.error("Failed to parse JSON error:", jsonError);
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
        } else {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      Swal.fire({
        text: "Email Template successfully updated!",
        icon: "success",
        duration: 2500,
      });

      if (onSuccess) onSuccess();

      setErrors({});

      return true;
    } catch (error) {
      console.error("Error saving email template:", error);

      if (error instanceof Error) {
        if (error.message.includes("fetch")) {
          setErrors({
            templateName: "Connection error. Please check if server is running.",
          });
        } else if (error.message.toLowerCase().includes("sender")) {
          setErrors({
            envelopeSender: error.message,
          });
        } else if (error.message.toLowerCase().includes("subject")) {
          setErrors({
            subject: error.message,
          });
        } else if (error.message.toLowerCase().includes("template name already exists")) { 
          setErrors({
            templateName: error.message,
          });
        }
        else {
          setErrors({
            templateName: error.message,
          });
        }
      }

      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({ submitEmailTemplate }));

  const handleTrackerChange = (trackerValue: number) => {
    handleInputChange("trackerImage", trackerValue);
  };

  // Handle input changes - dengan safety check
  const handleInputChange = (
    field: keyof EmailTemplateData,
    value: string | number
  ) => {
    if (isSubmitting) {
      return;
    }

    setFormData((prev) => {
      // Untuk isSystemTemplate, pastikan hanya role 1 yang bisa mengubahnya
      if (field === "isSystemTemplate" && userRoleId !== 1) {
        return prev; // Jangan ubah jika bukan role 1
      }
      // Konversi value ke number jika field adalah isSystemTemplate atau trackerImage
      const finalValue = (field === "isSystemTemplate" || field === "trackerImage") 
                         ? Number(value) 
                         : value;
      
      if (prev[field] === finalValue) {
        return prev; 
      }
      return {
        ...prev,
        [field]: finalValue,
      };
    });

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const emailTabs = [
    {
      label: (
        <div className="flex items-center justify-center gap-2">
          <LuLayoutTemplate />
          <span>Template</span>
        </div>
      ),
      content: (
        <EmailBodyEditorTemplate
          templateName={formData.templateName}
          envelopeSender={formData.envelopeSender}
          subject={formData.subject}
          onTrackerChange={handleTrackerChange}
          initialTrackerValue={formData.trackerImage}
          initialContent={formData.bodyEmail}
          onBodyChange={(html: string) => handleInputChange("bodyEmail", html)}
        />
      ),
    },
  ];

  // Jika emailTemplate null, kembalikan null atau pesan loading
  if (!emailTemplate) {
    return null; // Atau tampilkan indikator loading
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          📧 Email Configuration
        </h3>
        <div className={`grid grid-cols-1 gap-4 ${userRoleId === 1 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
          <div>
            <Label>Template Name</Label>
            <Input
              placeholder="Welcome Email"
              type="text"
              value={formData.templateName}
              onChange={(e) => handleInputChange("templateName", e.target.value)}
              required
              disabled={isSubmitting}
              className={`w-full text-sm sm:text-base h-10 px-3 ${
                errors.templateName ? "border-red-500" : ""
              }`}
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
              onChange={(e) => handleInputChange("envelopeSender", e.target.value)}
              required
              disabled={isSubmitting}
              className={`w-full text-sm sm:text-base h-10 px-3 ${
                errors.envelopeSender ? "border-red-500" : ""
              }`}
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
              onChange={(e) => handleInputChange("subject", e.target.value)}
              disabled={isSubmitting}
              className={`w-full text-sm sm:text-base h-10 px-3 ${
                errors.subject ? "border-red-500" : ""
              }`}
            />
            {errors.subject && (
              <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
            )}
          </div>
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

      <Tabs tabs={emailTabs} />
    </div>
  );
});

export default EditEmailTemplateModalForm;