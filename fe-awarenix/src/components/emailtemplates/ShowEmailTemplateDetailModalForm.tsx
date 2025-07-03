import Label from "../form/Label";
import Input from "../form/input/InputField";
import Tabs from "../common/Tabs";
import ShowEmailBodyEditor from "./ShowEmailBodyEditorTemplate";
import { formatUserDate } from "../utils/DateFormatter";

type EmailTemplate = {
  id: number;
  name: string;
  envelopeSender: string;
  subject: string;
  bodyEmail: string;
  trackerImage: number;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
}

export type ShowEmailTemplateDetailModalFormRef = {
  submitEmailTemplates: () => Promise<EmailTemplate>;
  emailtemplate: EmailTemplate;
};

type EmailTemplateData = {
  name: string;
  envelopeSender: string;
  subject: string;
  bodyEmail: string;
  trackerImage: number;
  createdAt: string;
  createdBy: number;
  createdByName: string;
  updatedAt: string;
  updatedBy: number;
  updatedByName: string;
};

type ShowEmailTemplateDetailModalFormProps = {
  emailTemplate: EmailTemplateData;
};

const ShowEmailTemplateDetailModalForm = ({ emailTemplate }: ShowEmailTemplateDetailModalFormProps) => {
  if (!emailTemplate) return null;
  

  const emailTabs = [
    {
      label: "📝 Email Body",
      content: <ShowEmailBodyEditor 
        templateName={emailTemplate.name}
        envelopeSender={emailTemplate.envelopeSender}
        subject={emailTemplate.subject}
        initialContent={emailTemplate.bodyEmail}
      />,
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          📧 Email Configuration
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-2">
          <div>
            <Label>Template Name</Label>
            <Input 
              placeholder="Welcome Email" 
              type="text" 
              value={emailTemplate.name} 
              className={`w-full text-sm sm:text-base h-10 px-3`}
              readonly
            />
          </div>
          <div>
            <Label>Envelope Sender</Label>
            <Input 
              type="email" 
              value={emailTemplate.envelopeSender} 
              className={`w-full text-sm sm:text-base h-10 px-3 `}
              readonly
            />
          </div>
          <div>
            <Label>Subject Line</Label>
            <Input 
              type="text"
              required 
              value={emailTemplate.subject} 
              readonly
              className={`w-full text-sm sm:text-base h-10 px-3`}
            />
          </div>
          <div>
            <Label>Tracker Image</Label>
            <Input 
              type="text"
              required 
              value={emailTemplate.trackerImage == 1 ? 'Active' : 'Not Active'} 
              readonly
              className={`w-full text-sm sm:text-base h-10 px-3`}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mt-5">
          <div>
            <Label>Created At</Label>
            <Input 
              type="text" 
              value={
                formatUserDate(emailTemplate.createdAt)
              }
              className={`w-full text-sm sm:text-base h-10 px-3`}
              readonly
              />
          </div>
          <div>
            <Label>Created By</Label>
            <Input 
              type="text" 
              value={emailTemplate.createdByName} 
              className={`w-full text-sm sm:text-base h-10 px-3`}
              readonly
            />
          </div>
          <div>
            <Label>Updated At</Label>
            <Input 
              type="text" 
              value={formatUserDate(emailTemplate.updatedAt)}
              className={`w-full text-sm sm:text-base h-10 px-3`}
              readonly
              />
          </div>
          <div>
            <Label>Updated By</Label>
            <Input 
              type="text" 
              value={emailTemplate.updatedByName} 
              className={`w-full text-sm sm:text-base h-10 px-3`}
              readonly
            />
          </div>
        </div>
      </div>

      <Tabs tabs={emailTabs} />
    </div>
  );
};

export default ShowEmailTemplateDetailModalForm;