import { forwardRef, useImperativeHandle } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";

type CampaignData = {
  id: number;
  name: string;
  launch_date: Date; 
  send_email_by?: Date | null;
  group_id: number;
  email_template_id: number;
  landing_page_id: number;
  sending_profile_id: number;
  url: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  status: string;
  completed_date?: string | null;
  email_sent: number;
  email_opened: number;
  clicks: number; 
  submitted: number; 
  reported: number;
};

export type DeleteCampaignModalFormRef = {
  submitDelete: () => void;
};

type DeleteCampaignModalFormProps = {
  campaign: CampaignData;
  error?: string;
  isDeleting?: boolean;
  onDelete: () => void;
};

const DeleteCampaignModalForm = forwardRef<DeleteCampaignModalFormRef, DeleteCampaignModalFormProps>(
  ({ campaign, error, onDelete }, ref) => {
    useImperativeHandle(ref, () => ({
      submitDelete: async () => {
        await onDelete();
        return true;
      }
    }));

    if (!campaign) return null;

    return (
      <div className="space-y-6">
        {/* Name */}
        <div>
          <Label>Name</Label>
          <Input 
            type="text"  
            value={campaign.name}
            readonly
            className="w-full text-sm sm:text-base h-10 px-3 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

DeleteCampaignModalForm.displayName = "DeleteCampaignModalForm";

export default DeleteCampaignModalForm;