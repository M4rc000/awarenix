import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Tabs from "../common/Tabs";
import { LuLayoutTemplate } from "react-icons/lu";
import EmailBodyEditorTemplate from "./EmailBodyEditorTemplate";
import LabelWithTooltip from "../ui/tooltip/Tooltip";
import Swal from "../utils/AlertContainer";
import Select from "../form/Select";

type EmailTemplate = {
  id: number;
  name: string;
  envelopeSender: string;
  subject: string;
  bodyEmail: string;
  isSystemTemplate: number;
  language: string; // Menambahkan bidang language
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
  isSystemTemplate: number;
  language: string; 
};

const EditEmailTemplateModalForm = forwardRef<
  EditEmailTemplateModalFormRef,
  EditEmailTemplateModalFormProps
>(({ emailTemplate, onSuccess }, ref) => {
  const [userRoleId, setUserRoleId] = useState<number | null>(null); // State untuk menyimpan role_id

  // Ambil role_id pengguna dari localStorage saat komponen dimuat
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const roleId = userData?.role;
      if (typeof roleId === "number") {
        setUserRoleId(roleId);
      } else {
        setUserRoleId(null);
      }
    } catch (e) {
      console.error("Failed to parse user data from localStorage", e);
      setUserRoleId(null);
    }
  }, []);

  // Inisialisasi formData
  const [formData, setFormData] = useState<EmailTemplateData>(() => {
    // Pastikan emailTemplate ada sebelum melanjutkan
    const initialIsSystemTemplate = userRoleId === 1 ? (emailTemplate?.isSystemTemplate || 0) : 0;
    return {
      templateName: emailTemplate?.name || "",
      envelopeSender: emailTemplate?.envelopeSender || "",
      subject: emailTemplate?.subject || "",
      bodyEmail: emailTemplate?.bodyEmail || "",
      isSystemTemplate: initialIsSystemTemplate,
      language: emailTemplate?.language || "Indonesia", // Inisialisasi language
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<EmailTemplateData>>({});

  // Reset form data ketika emailTemplate berubah (misalnya, saat modal dibuka dengan data template lain)
  useEffect(() => {
    if (emailTemplate) {
      setFormData({
        templateName: emailTemplate.name || "",
        envelopeSender: emailTemplate.envelopeSender || "",
        subject: emailTemplate.subject || "",
        bodyEmail: emailTemplate.bodyEmail || "",
        // Pastikan isSystemTemplate diinisialisasi dengan benar berdasarkan role
        isSystemTemplate: userRoleId === 1 ? (emailTemplate.isSystemTemplate || 0) : 0,
        language: emailTemplate.language || "Indonesia", // Reset language
      });
      setErrors({}); // Bersihkan error saat data baru dimuat
    }
  }, [emailTemplate, userRoleId]); // Tambahkan userRoleId sebagai dependency

  // Opsi untuk komponen Select Template Status
  const templateStatusOptions = [
    { value: "0", label: "Made In" },
    { value: "1", label: "Default" },
  ];

  // Opsi untuk komponen Select Language Type
  const languageOptions = [
    { value: "indonesia", label: "Indonesia" },
    { value: "english", label: "English" },
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
    if (!formData.language.trim()) { 
      newErrors.language = "Template Language is required";
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
      // Pastikan language hanya dikirim jika userRoleId adalah 1, jika tidak, gunakan nilai yang ada atau default
      const languageToSend = userRoleId === 1 ? formData.language : emailTemplate.language || "Indonesia";


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
          isSystemTemplate: isSystemTemplateToSend,
          language: languageToSend, // Menggunakan nilai yang disesuaikan
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
        } else if (error.message.toLowerCase().includes("language")) {
          setErrors({
            language: error.message,
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

  // Handle input changes - dengan safety check
  const handleInputChange = useCallback((
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
      // Untuk language, pastikan hanya role 1 yang bisa mengubahnya
      if (field === "language" && userRoleId !== 1) {
        return prev; // Jangan ubah jika bukan role 1
      }

      const finalValue = (field === "isSystemTemplate")
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
  }, [isSubmitting, errors, userRoleId]);

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
          initialContent={formData.bodyEmail}
          onBodyChange={useCallback((html: string) => handleInputChange("bodyEmail", html), [handleInputChange])}
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
        {/* Mengubah grid-cols menjadi dinamis berdasarkan currentUserRole */}
        <div className={`grid grid-cols-1 gap-4 ${userRoleId === 1 ? 'sm:grid-cols-5' : 'sm:grid-cols-3'}`}>
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
          {/* Template Status - Conditional rendering */}
          {userRoleId === 1 ? (
              <div>
                  <LabelWithTooltip position="left" tooltip="Templates status means is default template by system or created from user">Template Status</LabelWithTooltip>
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
          {/* Select input for Language Type - Conditional rendering */}
          {userRoleId === 1 && (
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
          )}
        </div>
      </div>

      <Tabs tabs={emailTabs} />
    </div>
  );
});

export default EditEmailTemplateModalForm;
