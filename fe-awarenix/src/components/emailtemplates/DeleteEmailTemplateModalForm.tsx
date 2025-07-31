import { forwardRef, useImperativeHandle } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";

type EmailTemplateData = {
  id: number;
  name: string;
  envelopeSender: string;
  subject: string;
};

export type DeleteEmailTemplateFormRef = {
  submitDelete: () => void;
};

type DeleteEmailTemplateModalFormProps = {
  emailTemplate: EmailTemplateData;
  error?: string;
  isDeleting?: boolean;
  onDelete: () => void;
};

const DeleteEmailTemplateModalForm = forwardRef<DeleteEmailTemplateFormRef, DeleteEmailTemplateModalFormProps>(
  ({ emailTemplate, onDelete }, ref) => {
    useImperativeHandle(ref, () => ({
      submitDelete: async () => {
        await onDelete();
        return true;
      }
    }));

    if (!emailTemplate) return null;
    return (
      <div className="space-y-6">
        {/* Name */}
        <div>
          <Label>Name</Label>
          <Input 
            type="text"  
            value={emailTemplate.name}
            readonly
            className="w-full text-sm sm:text-base h-10 px-3 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
          />
        </div>

        {/* Envelope Sender */}
        <div>
          <Label>Envelope Sender</Label>
          <Input 
            type="text"  
            value={emailTemplate.envelopeSender}
            readonly
            className="w-full text-sm sm:text-base h-10 px-3 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
          />
        </div>

        {/* Subject */}
        <div>
          <Label>Subject</Label>
          <Input 
            type="text"  
            value={emailTemplate.subject}
            readonly
            className="w-full text-sm sm:text-base h-10 px-3 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
          />
        </div>
      </div>
    );
  }
);

DeleteEmailTemplateModalForm.displayName = "DeleteEmailTemplateModalForm";

export default DeleteEmailTemplateModalForm;