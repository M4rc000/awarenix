import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Tabs from "../common/Tabs";
import { LuLayoutTemplate } from "react-icons/lu";
import LabelWithTooltip from "../ui/tooltip/Tooltip";
import Swal from "../utils/AlertContainer";
import Select from "../form/Select";
import EditEmailBodyEditorTemplate from "./EditEmailBodyEditorTemplate";

// Assuming AttachmentMetadata is defined in a shared models file or similar
type AttachmentMetadata = {
  id: number; 
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  filePath?: string; 
};

type EmailTemplate = {
  id: number;
  name: string;
  envelopeSender: string;
  subject: string;
  bodyEmail: string;
  isSystemTemplate: number;
  language: string;
  attachments?: AttachmentMetadata[]; 
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
  newAttachments: File[]; // New field for newly added files
  removedExistingAttachmentIds: number[]; // New field for IDs of removed existing attachments
};

const EditEmailTemplateModalForm = forwardRef<
  EditEmailTemplateModalFormRef,
  EditEmailTemplateModalFormProps
>(({ emailTemplate, onSuccess }, ref) => {
  const [userRoleId, setUserRoleId] = useState<number | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false); // New state to track initial load

  // Fetch user role ID from localStorage on component mount
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

  // Initialize formData state
  const [formData, setFormData] = useState<EmailTemplateData>(() => {
    // Initial state setup, will be updated by useEffect if emailTemplate exists
    return {
      templateName: "",
      envelopeSender: "",
      subject: "",
      bodyEmail: "",
      isSystemTemplate: 0,
      language: "Indonesia",
      newAttachments: [],
      removedExistingAttachmentIds: [],
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<EmailTemplateData>>({});

  // Reset form data when emailTemplate prop changes (e.g., when modal opens with different template data)
  // This also handles initial loading of emailTemplate and userRoleId
  useEffect(() => {
    if (emailTemplate && userRoleId !== null) { // Ensure userRoleId is loaded
      const initialIsSystemTemplate = userRoleId === 1 ? (emailTemplate.isSystemTemplate || 0) : 0;
      setFormData({
        templateName: emailTemplate.name || "",
        envelopeSender: emailTemplate.envelopeSender || "",
        subject: emailTemplate.subject || "",
        bodyEmail: emailTemplate.bodyEmail || "",
        isSystemTemplate: initialIsSystemTemplate,
        language: emailTemplate.language || "Indonesia",
        newAttachments: [], // Always start with no new attachments on load
        removedExistingAttachmentIds: [], // Always start with no removed attachments on load
      });
      setErrors({});
      setInitialLoaded(true); // Mark as initially loaded
    } else if (!emailTemplate && initialLoaded) {
      // If emailTemplate becomes null after being loaded, reset form
      setFormData({
        templateName: "",
        envelopeSender: "",
        subject: "",
        bodyEmail: "",
        isSystemTemplate: 0,
        language: "Indonesia",
        newAttachments: [],
        removedExistingAttachmentIds: [],
      });
      setErrors({});
      setInitialLoaded(false);
    }
  }, [emailTemplate, userRoleId, initialLoaded]); // Add initialLoaded to dependencies

  // Options for the Select component
  const templateStatusOptions = [
    { value: "0", label: "Made In" },
    { value: "1", label: "Default" },
  ];

  // Options for language type
  const languageOptions = [
    { value: "indonesia", label: "Indonesia" },
    { value: "english", label: "English" },
  ];

  // Validation function for form fields
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

  // Function to submit the email template data
  const submitEmailTemplate = async (): Promise<boolean> => {
    // Ensure emailTemplate data is available
    if (!emailTemplate) {
      console.error("No email template data provided for update.");
      return false;
    }

    // Validate form fields
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

    setIsSubmitting(true); // Set submitting state to true

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedBy = userData?.id || 0;

      const newlyUploadedAttachmentMetadata: AttachmentMetadata[] = [];

      // --- Attachment Upload Logic for new attachments ---
      if (formData.newAttachments.length > 0) {
        Swal.fire({
          text: `Uploading ${formData.newAttachments.length} new files...`,
          icon: 'info',
          duration: 3000,
        });

        for (const file of formData.newAttachments) {
          const formDataForUpload = new FormData();
          formDataForUpload.append("attachment", file); // "attachment" must match the backend's expected field name

          try {
            const uploadResponse = await fetch(`${API_URL}/attachments/upload`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formDataForUpload, // FormData automatically sets Content-Type to multipart/form-data
            });

            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json().catch(() => ({}));
              throw new Error(errorData.message || `Failed to upload new attachment: ${file.name}`);
            }

            const result: { data: AttachmentMetadata } = await uploadResponse.json();
            newlyUploadedAttachmentMetadata.push(result.data);
          } catch (uploadError) {
            console.error(`Error uploading new file ${file.name}:`, uploadError);
            Swal.fire({
              icon: 'error',
              text: `Failed to upload new file ${file.name}: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`,
              duration: 3000,
            });
            setIsSubmitting(false); 
            return false;
          }
        }
      }
      // --- End Attachment Upload Logic ---

      // Determine isSystemTemplate value based on user role
      const isSystemTemplateToSend = userRoleId === 1 ? formData.isSystemTemplate : 0;
      // Determine language value based on user role or existing template language
      const languageToSend = userRoleId === 1 ? formData.language : emailTemplate.language || "Indonesia";

      // Combine existing attachments (that were NOT removed) with newly uploaded ones
      // The backend's PUT endpoint will handle linking/unlinking based on this provided list of IDs
      const finalAttachmentIds = [
        ...(emailTemplate.attachments || []) // Start with original attachments (if any)
          .filter(att => !formData.removedExistingAttachmentIds.includes(att.id)) // Filter out removed ones
          .map(att => ({ id: att.id })), // Send only their IDs
        ...newlyUploadedAttachmentMetadata.map(att => ({ id: att.id })) // Add IDs of newly uploaded attachments
      ];
      
      // Send the PUT request to update the email template
      const response = await fetch(`${API_URL}/email-template/${emailTemplate.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json", // Content-Type for JSON payload
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          templateName: formData.templateName,
          envelopeSender: formData.envelopeSender,
          subject: formData.subject,
          bodyEmail: formData.bodyEmail || "",
          isSystemTemplate: isSystemTemplateToSend,
          language: languageToSend,
          updatedBy: updatedBy,
          attachments: finalAttachmentIds, // Send the final list of attachment IDs
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

      // Show success notification
      if (onSuccess) onSuccess(); // Trigger parent's success callback

      // Reset form attachments after successful submission
      setFormData(prev => ({
        ...prev,
        newAttachments: [],
        removedExistingAttachmentIds: [],
      }));

      return true;
    } catch (error) {
      console.error("Error saving email template:", error);

      if (error instanceof Error) {
        let displayError = error.message;
        if (error.message.includes("fetch")) {
          displayError = "Connection error. Please check if server is running.";
        } else if (error.message.toLowerCase().includes("sender")) {
          setErrors({ envelopeSender: error.message });
        } else if (error.message.toLowerCase().includes("subject")) {
          setErrors({ subject: error.message });
        } else if (error.message.toLowerCase().includes("template name already exists")) {
          setErrors({ templateName: error.message });
        } else if (error.message.toLowerCase().includes("language")) {
          setErrors({ language: error.message });
        }
        else {
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
      setIsSubmitting(false); // Always reset submitting state
    }
  };

  // Expose submitEmailTemplate function to parent component via ref
  useImperativeHandle(ref, () => ({ submitEmailTemplate }));

  // Handle input changes for form fields
  const handleInputChange = useCallback((
    field: keyof EmailTemplateData,
    value: string | number | File[] | number[] // Allow string, number, File[], and number[] for different fields
  ) => {
    if (isSubmitting) {
      return; // Prevent changes while submitting
    }

    setFormData((prev) => {
      // Prevent changes to isSystemTemplate and language if user is not role 1
      if (field === "isSystemTemplate" && userRoleId !== 1) {
        return prev;
      }
      if (field === "language" && userRoleId !== 1) {
        return prev;
      }

      return {
        ...prev,
        [field]: value, // Assign value directly, TypeScript handles type safety
      };
    });

    // Clear specific error message when user starts typing/changing that field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  }, [isSubmitting, errors, userRoleId]);

  // Define tabs for the email editor
  const emailTabs = [
    {
      label: (
        <div className="flex items-center justify-center gap-2">
          <LuLayoutTemplate />
          <span>Template</span>
        </div>
      ),
      content: (
        <EditEmailBodyEditorTemplate
          templateName={formData.templateName}
          envelopeSender={formData.envelopeSender}
          subject={formData.subject}
          initialContent={formData.bodyEmail}
          initialAttachments={emailTemplate?.attachments || []} // Pass existing attachments to child component
          onBodyChange={useCallback((html: string) => handleInputChange("bodyEmail", html), [handleInputChange])}
          onAttachmentsChange={useCallback((newFiles: File[], removedIds: number[]) => {
            handleInputChange("newAttachments", newFiles); // Update new attachments in formData
            handleInputChange("removedExistingAttachmentIds", removedIds); // Update removed IDs in formData
          }, [handleInputChange])}
        />
      ),
    },
  ];

  // Render loading indicator if emailTemplate or userRoleId is not yet loaded
  if (!emailTemplate || userRoleId === null) {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-gray-500 dark:text-gray-400">
        Loading email template...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          📧 Email Configuration
        </h3>
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
                          handleInputChange("isSystemTemplate", Number(val))
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