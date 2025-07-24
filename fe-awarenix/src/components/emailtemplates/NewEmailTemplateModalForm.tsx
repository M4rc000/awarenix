import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Tabs from "../common/Tabs";
import EmailBodyEditorTemplate from "./EmailBodyEditorTemplate";
import Swal from "../utils/AlertContainer";
import { LuLayoutTemplate } from "react-icons/lu";
import LabelWithTooltip from "../ui/tooltip/Tooltip";
import Select from "../form/Select"; 

interface EmailTemplate {
  id: number;
  templateName: string;
  envelopeSender: string;
  subject: string;
  language: string; // Added language field
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export type NewEmailTemplateModalFormRef = {
  submitEmailTemplate: () => Promise<EmailTemplate | null>;
  emailtemplate: EmailTemplate | null;
};

type NewEmailTemplateModalFormProps = {
  onSuccess?: () => void;
};

type EmailTemplateData = {
  templateName: string;
  envelopeSender: string;
  subject: string;
  isSystemTemplate: number;
  bodyEmail: string;
  language: string; // Added language field
};

const NewEmailTemplateModalForm = forwardRef<
  NewEmailTemplateModalFormRef,
  NewEmailTemplateModalFormProps
>(({ onSuccess }, ref) => {
  const [emailtemplate, setEmailTemplate] = useState<EmailTemplateData>({
    templateName: "",
    envelopeSender: "",
    subject: "",
    isSystemTemplate: 0, // Default to 0 (No)
    bodyEmail: "",
    language: "Indonesia", // Default language
  });

  const [errors, setErrors] = useState<Partial<EmailTemplateData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRoleId, setUserRoleId] = useState<number | null>(null); // State untuk menyimpan role_id

  // Ambil role_id pengguna dari localStorage saat komponen dimuat
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const roleId = userData?.role; 
      if (typeof roleId === "number") {
        setUserRoleId(roleId);
        // Jika role_id bukan 1, set isSystemTemplate ke 0
        if (roleId !== 1) {
          setEmailTemplate((prev) => ({ ...prev, isSystemTemplate: 0 }));
        }
      } else {
        // Fallback jika role_id tidak ditemukan atau bukan angka
        setUserRoleId(null);
        setEmailTemplate((prev) => ({ ...prev, isSystemTemplate: 0 }));
      }
    } catch (e) {
      console.error("Failed to parse user data from localStorage", e);
      setUserRoleId(null);
      setEmailTemplate((prev) => ({ ...prev, isSystemTemplate: 0 }));
    }
  }, []); // [] agar hanya berjalan sekali saat mount

  // Opsi untuk komponen Select
  const templateStatusOptions = [
    { value: "0", label: "No" },
    { value: "1", label: "Yes" },
  ];

  // Opsi untuk language type
  const languageOptions = [
    { value: "indonesia", label: "Indonesia" },
    { value: "english", label: "English" },
  ];

  // VALIDATION FUNCTION
  const validateForm = (): boolean => {
    const newErrors: Partial<EmailTemplateData> = {};

    if (!emailtemplate.templateName.trim()) {
      newErrors.templateName = "Name is required";
    }
    if (!emailtemplate.envelopeSender.trim()) {
      newErrors.envelopeSender = "Envelope Sender is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailtemplate.envelopeSender)) {
      newErrors.envelopeSender = "Please enter a valid email";
    }
    if (!emailtemplate.subject.trim()) {
      newErrors.subject = "Subject Email is required";
    }
    if (!emailtemplate.language.trim()) { // Added validation for language
      newErrors.language = "Language is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitEmailTemplate = async (): Promise<EmailTemplate | null> => {
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
      return null;
    }

    setIsSubmitting(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const createdBy = userData?.id || 0;
      const payload = {
        templateName: emailtemplate.templateName,
        envelopeSender: emailtemplate.envelopeSender,
        subject: emailtemplate.subject,
        bodyEmail: emailtemplate.bodyEmail || "",
        isSystemTemplate: emailtemplate.isSystemTemplate,
        language: emailtemplate.language, 
        createdBy: createdBy,
      };
      const response = await fetch(`${API_URL}/email-template/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = "Failed to create email template";

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

      const createdTemplate: EmailTemplate = await response.json();

      Swal.fire({
        text: "Email Template successfully added!",
        icon: "success",
        duration: 2500,
      });

      if (onSuccess) onSuccess();

      setEmailTemplate({
        templateName: "",
        envelopeSender: "",
        subject: "",
        isSystemTemplate: userRoleId !== 1 ? 0 : 0, 
        bodyEmail: "",
        language: "Indonesia", 
      });
      setErrors({});

      return createdTemplate;
    } catch (error) {
      console.error("Error creating email template:", error);

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
        } else if (error.message.toLowerCase().includes("language")) { // Added error handling for language
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

      return null;
    } finally {
      setIsSubmitting(false);
    }
  };
  useImperativeHandle(ref, () => ({ submitEmailTemplate, emailtemplate: null }));

  // Handle input changes - dengan safety check
  const handleInputChange = (
    field: keyof EmailTemplateData,
    value: string | number
  ) => {
    if (isSubmitting) {
      return;
    }

    setEmailTemplate((prev) => ({
      ...prev,
      [field]: field === "isSystemTemplate" ? Number(value) : value, 
    }));

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
          <span>Email Body</span>
        </div>
      ),
      content: (
        <EmailBodyEditorTemplate
          templateName={emailtemplate.templateName} 
          envelopeSender={emailtemplate.envelopeSender} 
          subject={emailtemplate.subject} 
          onBodyChange={(html) => {
            handleInputChange("bodyEmail", html);
          }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6 p-1 dark:bg-gray-900 min-h-screen">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          📧 Email Configuration
        </h3>
        <div className={`grid grid-cols-1 gap-4 ${userRoleId === 1 ? 'sm:grid-cols-5' : 'sm:grid-cols-4'}`}>
          <div>
            <Label>Template Name</Label>
            <Input
              placeholder="Welcome Email"
              type="text"
              value={emailtemplate.templateName}
              onChange={(e) => {
                handleInputChange("templateName", e.target.value);
              }}
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
              value={emailtemplate.envelopeSender}
              onChange={(e) => {
                handleInputChange("envelopeSender", e.target.value);
              }}
              required
              className={`w-full text-sm sm:text-base h-10 px-3 ${
                errors.envelopeSender ? "border-red-500" : ""
              }`}
            />
            {errors.envelopeSender && (
              <p className="text-red-500 text-sm mt-1">
                {errors.envelopeSender}
              </p>
            )}
          </div>
          <div>
            <Label>Subject Line</Label>
            <Input
              placeholder="Welcome to Our Platform!"
              type="text"
              required
              value={emailtemplate.subject}
              onChange={(e) => {
                handleInputChange("subject", e.target.value);
              }}
              className={`w-full text-sm sm:text-base h-10 px-3 ${
                errors.subject ? "border-red-500" : ""
              }`}
            />
            {errors.subject && (
              <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
            )}
          </div>
          {/* Conditional rendering untuk Template Status */}
          {userRoleId === 1 && ( // Hanya render jika userRoleId adalah 1
            <div>
              <LabelWithTooltip
                position="left"
                tooltip="Templates status means is default template by system or created from user"
              >
                Template Status
              </LabelWithTooltip>
              <Select
                placeholder="Choose Template Type"
                options={templateStatusOptions} // Tidak perlu filter lagi di sini karena sudah di dalam kondisi userRoleId === 1
                value={String(emailtemplate.isSystemTemplate)}
                onChange={(val: string) => {
                  handleInputChange("isSystemTemplate", val);
                }}
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
          <div>
            <Label>Language Type</Label>
            <Select
              placeholder="Choose Language"
              options={languageOptions}
              value={emailtemplate.language}
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
});

export default NewEmailTemplateModalForm;
