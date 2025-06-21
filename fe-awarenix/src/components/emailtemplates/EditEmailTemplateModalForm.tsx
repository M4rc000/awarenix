import { useState, useEffect } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Tabs from "../common/Tabs";
import EmailBodyEditor from "./EmailBodyEditorTemplate";
import { forwardRef, useImperativeHandle } from "react";

export type EditEmailTemplateModalFormRef = {
  submitEmailTemplate: () => Promise<boolean>;
};

type EditEmailTemplateModalFormProps = {
  onSuccess?: () => void;
  emailTemplate: EmailTemplate;
};

// Define email templaet data structure
type EmailTemplateData = {
  templateName: string;
  envelopeSender: string;
  subject: string;
  bodyEmail: string;
};

const EditEmailTemplateModalForm = forwardRef<EditEmailTemplateModalFormRef, EditEmailTemplateModalFormProps>(
  ({ emailTemplate, onSuccess }, ref) => {
     const [formData, setFormData] = useState<EmailTemplateData>({
      templateName: "",
      envelopeSender: "",
      subject: "",
      bodyEmail: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<EmailTemplateData>>({});

    // Initialize form data when emailTemplate prop changes
    useEffect(() => {
      if (emailTemplate) {
        setFormData({
          templateName: emailTemplate.name || "",
          envelopeSender: emailTemplate.envelopeSender || "",
          subject: emailTemplate.subject || "",
          bodyEmail: emailTemplate.bodyEmail || "",
        });
      }
    }, [emailTemplate]);

    // VALIDATION FUNCTION
    const validateForm = (): boolean => {
      const newErrors: Partial<EmailTemplateData> = {};

      if (!formData.templateName.trim()) {
        newErrors.templateName = "Name is required";
      }
      if (!formData.envelopeSender.trim()) {
        newErrors.envelopeSender = "Envelope Sender is required";
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
        const updatedBy = userData?.id || 0; 

        const response = await fetch(`${API_URL}/email-template/${emailTemplate.id}`, {
          method: 'PUT',
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            templateName: formData.templateName,
            envelopeSender: formData.envelopeSender,
            subject: formData.subject,
            bodyEmail: formData.bodyEmail || "",
            updatedBy: updatedBy,
          }),
        });


        if (!response.ok) {
          let errorMessage = `Failed to update email template`;
          
          // Cek content type sebelum parsing
          const contentType = response.headers.get('content-type');
          
          if (contentType && contentType.includes('application/json')) {
            try {
              const errorData = await response.json();
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (jsonError) {
              console.error('Failed to parse JSON error:', jsonError);
              errorMessage = `Server error: ${response.status} ${response.statusText}`;
            }
          } else {
            // Jika bukan JSON, jangan coba parse sebagai JSON
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
          
          throw new Error(errorMessage);
        }

        if (onSuccess) onSuccess(); 

        // Reset form on success only if creating new template
        if (!emailTemplate?.id) {
          setFormData({
            templateName: "",
            envelopeSender: "",
            subject: "",
            bodyEmail: "",
          });
        }
        setErrors({});
        
        return true;
        
      } catch (error) {
        console.error('Error saving email template:', error);
        
        // Set error message untuk user
        if (error instanceof Error) {
          // Cek jika error terkait network
          if (error.message.includes('fetch')) {
            setErrors({
              templateName: 'Connection error. Please check if server is running.',
            });
          } else if (error.message.toLowerCase().includes('sender')) {
            setErrors({
              envelopeSender: error.message,
            });
          } else if (error.message.toLowerCase().includes('subject')) {
            setErrors({
              subject: error.message,
            });
          } else {
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
    const handleInputChange = (field: keyof EmailTemplateData, value: string) => {
      // Prevent submit trigger dari input change
      if (isSubmitting) {
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: undefined
        }));
      }
    };

    const emailTabs = [
      {
        label: "📝 Email Body",
        content: <EmailBodyEditor 
          templateName={formData.templateName}
          envelopeSender={formData.envelopeSender}
          subject={formData.subject}
          onBodyChange={(html) => handleInputChange("bodyEmail", html)}
          initialContent={formData.bodyEmail}
        />,
      },
    ];
    return (
      <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            📧 Email Configuration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          </div>
        </div>

        <Tabs tabs={emailTabs} />
      </div>
    );
  }
);

export default EditEmailTemplateModalForm;