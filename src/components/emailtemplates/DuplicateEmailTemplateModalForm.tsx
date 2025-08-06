import { useState, useEffect, useCallback } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Tabs from "../common/Tabs";
import { forwardRef, useImperativeHandle } from "react";
import { LuLayoutTemplate } from "react-icons/lu";
import LabelWithTooltip from "../ui/tooltip/Tooltip";
import Select from "../form/Select"; 
import Swal from "../utils/AlertContainer";
import CreateEmailBodyEditorTemplate from "./CreateEmailBodyEditorTemplate";

type AttachmentMetadata = {
  id: number; 
  originalFilename: string;
  fileSize: number;
  mimeType: string;
};

type EmailTemplate = {
  id: number;
  name: string;
  envelopeSender: string;
  subject: string;
  bodyEmail: string;
  isSystemTemplate: number;
  language: string; 
  // If you fetch existing attachments with the template, add them here:
  // attachments: AttachmentMetadata[]; 
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
  attachments: File[]; // New field to hold File objects from Dropzone
};

const DuplicateEmailTemplateModalForm = forwardRef<DuplicateEmailTemplateModalFormRef, DuplicateEmailTemplateModalFormProps>(
  ({ emailTemplate, onSuccess }, ref) => {
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

    useEffect(() => {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const roleFromLocalStorage = userData?.role; 
      if (roleFromLocalStorage !== undefined && roleFromLocalStorage !== null) {
        setCurrentUserRole(String(roleFromLocalStorage));
      }
    }, []);

    const [formData, setFormData] = useState<EmailTemplateData>(() => {
      const initialIsSystemTemplate = currentUserRole === "1" ? (emailTemplate?.isSystemTemplate || 0) : 0;
      return {
        templateName: "Copy of " + (emailTemplate?.name || ""),
        envelopeSender: emailTemplate?.envelopeSender || "",
        subject: emailTemplate?.subject || "",
        bodyEmail: emailTemplate?.bodyEmail || "",
        isSystemTemplate: initialIsSystemTemplate,
        language: emailTemplate?.language || "Indonesia",
        attachments: [], // Initialize attachments array for duplication
      };
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<EmailTemplateData>>({});

    const languageOptions = [
      { value: "indonesia", label: "Indonesia" },
      { value: "english", label: "English" },
    ];

    const systemTemplateOptions = [
      { value: "0", label: "Made In" },
      { value: "1", label: "Default" },
    ];

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
        newErrors.language = "Language is required";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const submitEmailTemplate = async (): Promise<boolean> => {
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

        const uploadedAttachmentMetadata: AttachmentMetadata[] = [];

        // --- Attachment Upload Logic (Copied from NewEmailTemplateModalForm) ---
        if (formData.attachments.length > 0) {
          Swal.fire({
            title: 'Uploading Attachments...',
            text: `Uploading ${formData.attachments.length} file...`,
            icon: 'info',
            duration: 3000,
          });

          for (const file of formData.attachments) {
            const formDataForUpload = new FormData();
            formDataForUpload.append("attachment", file); // "attachment" must match the backend's expected field name

            try {
              const uploadResponse = await fetch(`${API_URL}/attachments/upload`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                body: formDataForUpload,
              });

              if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to upload attachment: ${file.name}`);
              }

              const result: { data: AttachmentMetadata } = await uploadResponse.json();
              uploadedAttachmentMetadata.push(result.data);
            } catch (uploadError) {
              console.error(`Error uploading file ${file.name}:`, uploadError);
              Swal.fire({
                icon: 'error',
                title: 'Upload Failed',
                text: `Failed to upload file ${file.name}: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`,
                duration: 3000,
              });
              setIsSubmitting(false);
              return false; // Stop submission if any upload fails
            }
          }
        }
        // --- End Attachment Upload Logic ---

        const payload = {
          templateName: formData.templateName,
          envelopeSender: formData.envelopeSender,
          subject: formData.subject,
          bodyEmail: formData.bodyEmail || "",
          isSystemTemplate: formData.isSystemTemplate,
          language: formData.language, 
          createdBy: createdby,
          attachments: uploadedAttachmentMetadata, // Include the IDs of uploaded attachments
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

        // Reset form data after successful duplication
        setFormData({
          templateName: "Copy of " + (emailTemplate?.name || ""), 
          envelopeSender: emailTemplate?.envelopeSender || "",
          subject: emailTemplate?.subject || "",
          bodyEmail: emailTemplate?.bodyEmail || "",
          isSystemTemplate: currentUserRole === "1" ? (emailTemplate?.isSystemTemplate || 0) : 0,
          language: emailTemplate?.language || "Indonesia",
          attachments: [],
        });
        setErrors({});

        return true;

      } catch (error) {
        console.error('Error duplicating email template:', error);

        if (error instanceof Error) {
          let displayError = error.message;
          if (error.message.includes('fetch')) {
            displayError = 'Connection error. Please check if server is running.';
          } else if (error.message.toLowerCase().includes('sender')) {
            setErrors({ envelopeSender: error.message });
          } else if (error.message.toLowerCase().includes('subject')) {
            setErrors({ subject: error.message });
          } else if (error.message.toLowerCase().includes('language')) {
            setErrors({ language: error.message });
          } else {
            setErrors({ templateName: error.message });
          }

          // Show a general error if specific field error is not set
          if (!Object.keys(errors).some(key => errors[key as keyof EmailTemplateData])) {
            Swal.fire({
                icon: 'error',
                text: displayError,
                duration: 3000,
            });
          }
        }

        return false;
      } finally {
        setIsSubmitting(false);
      }
    };

    useImperativeHandle(ref, () => ({ submitEmailTemplate }));

    const handleInputChange = useCallback((field: keyof EmailTemplateData, value: string | number | File[]) => { // Allow File[]
      if (isSubmitting) {
        return;
      }

      setFormData(prev => {
        if (prev[field] === value) {
          return prev;
        }
        return {
          ...prev,
          [field]: value
        };
      });

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
        content: <CreateEmailBodyEditorTemplate
            templateName={formData.templateName}
            envelopeSender={formData.envelopeSender}
            subject={formData.subject}
            initialContent={formData.bodyEmail}
            onBodyChange={useCallback((html: string) => handleInputChange("bodyEmail", html), [handleInputChange])}
            onAttachmentsChange={(files) => { // Pass callback for attachments
              handleInputChange("attachments", files);
            }}
          />,
      },
    ];

    if (!emailTemplate) {
      return null;
    }

    return (
      <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            📧 Email Configuration
          </h3>
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
                        value={String(formData.isSystemTemplate)}
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
                <div>
                    <LabelWithTooltip position="left" tooltip="This template is created by user">Template Status</LabelWithTooltip>
                    <Input
                        value="Made In"
                        disabled={true}
                        className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    />
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
