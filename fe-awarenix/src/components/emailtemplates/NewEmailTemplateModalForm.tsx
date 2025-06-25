import { useState } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Tabs from "../common/Tabs";
import EmailBodyEditorTemplate from "./EmailBodyEditorTemplate";
import { forwardRef, useImperativeHandle } from "react";
import Swal from "../utils/AlertContainer";
import { LuLayoutTemplate } from "react-icons/lu";

interface EmailTemplate{
  id: number;
  templateName: string;
  envelopeSender: string;
  subject: string;
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

// Define user data structure
type EmailTemplateData = {
  templateName: string;
  envelopeSender: string;
  subject: string;
  bodyEmail: string;
};

const NewEmailTemplateModalForm = forwardRef<NewEmailTemplateModalFormRef, NewEmailTemplateModalFormProps>(({ onSuccess }, ref) => {
  const [emailtemplate, setEmailTemplate] = useState<EmailTemplateData>({
    templateName: "",
    envelopeSender: "",
    subject: "",
    bodyEmail: "",
  });
  const [templateName, setTemplateName] = useState("Welcome Email");
  const [envelopeSender, setEnvelopeSender] = useState("team@company.com");
  const [subject, setSubject] = useState("Welcome to Our Platform!");
  const [errors, setErrors] = useState<Partial<EmailTemplateData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // VALIDATION FUNCTION
  const validateForm = (): boolean => {
    const newErrors: Partial<EmailTemplateData> = {};

    if (!emailtemplate.templateName.trim()) {
      newErrors.templateName = "Name is required";
    }
    if (!emailtemplate.envelopeSender.trim()) {
      newErrors.envelopeSender = "Envelope Sender is required";
    }
    if (!emailtemplate.subject.trim()) {
      newErrors.subject = "Subject Email is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitEmailTemplate = async (): Promise<EmailTemplate | null> => {
    // CEK VALIDASI
    if (!validateForm()) {
      return null;
    }

    setIsSubmitting(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const createdBy = userData?.id || 0; 
      const response = await fetch(`${API_URL}/email-template/create`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          templateName: templateName,
          envelopeSender: envelopeSender,
          subject: subject,
          bodyEmail: emailtemplate.bodyEmail || "",
          createdAt: new Date().toISOString(),
          createdBy: createdBy,
        }),
      });

      console.log('Body: ', {
        templateName: templateName,
        envelopeSender: envelopeSender,
        subject: subject,
        bodyEmail: emailtemplate.bodyEmail,
        createdAt: new Date().toISOString(),
        createdBy: createdBy,
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to create user';
        
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

      // Parse the created template from the response
      const createdTemplate: EmailTemplate = await response.json();

      Swal.fire({
        text: "Email Template successfully added!",
        icon: "success",
        duration: 2500
      });

      if (onSuccess) onSuccess(); 

      // Reset form on success
      setEmailTemplate({
        templateName: "",
        envelopeSender: "",
        subject: "",
        bodyEmail: "",
      });
      setErrors({});
      
      return createdTemplate;
      
    } catch (error) {
      console.error('Error creating user:', error);
      
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
  const handleInputChange = (field: keyof EmailTemplateData, value: string) => {
    // Prevent submit trigger dari input change
    if (isSubmitting) {
      // console.log('Ignoring input change during submission');
      return;
    }
    
    setEmailTemplate(prev => ({
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
      label: (
      <div className="flex items-center justify-center gap-2">
        <LuLayoutTemplate />
        <span>Email Body</span>
      </div>
      ), 
      content: <EmailBodyEditorTemplate
        templateName={templateName}
        envelopeSender={envelopeSender}
        subject={subject}
        onBodyChange={(html) => {
          handleInputChange("bodyEmail", html);
          setEmailTemplate(prev => ({ ...prev, bodyEmail: html })); 
        }}
      />,
    },
  ];

  return (
    <div className="space-y-6 p-1 dark:bg-gray-900 min-h-screen">
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
              value={emailtemplate.templateName} 
              onChange={(e) => {
                setTemplateName(e.target.value);
                handleInputChange('templateName', e.target.value)
              }}
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
              value={emailtemplate.envelopeSender} 
              onChange={(e) => {
                setEnvelopeSender(e.target.value)
                handleInputChange('envelopeSender', e.target.value)
              }}
              required
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
              value={emailtemplate.subject} 
              onChange={(e) => {
                setSubject(e.target.value)
                handleInputChange('subject', e.target.value)
              }} 
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
});

export default NewEmailTemplateModalForm;