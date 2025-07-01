import { forwardRef, useImperativeHandle } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";

type SendingProfileData = {
  id: number;
  name: string;
	interfaceType: string;
	smtpFrom     : string;
	username     : string;
	password     : string;
	host         : string;
	CreatedAt    : string;
	CreatedBy    : number;
	CreatedByName    : string;
	UpdatedAt    : string;
	UpdatedBy    : number; 
	UpdatedByName    : string; 
  senderAddress: string;
	EmailHeaders : string;
}

export type DeleteSendingProfileModalFormRef = {
  submitDelete: () => void;
};

type DeleteSendingProfileModalFormProps = {
  sendingProfile: SendingProfileData;
  error?: string;
  isDeleting?: boolean;
  onDelete: () => void;
};

const DeleteSendingProfileModalForm = forwardRef<DeleteSendingProfileModalFormRef, DeleteSendingProfileModalFormProps>(
  ({ sendingProfile, error, onDelete }, ref) => {
    useImperativeHandle(ref, () => ({
      submitDelete: async () => {
        await onDelete();
        return true;
      }
    }));

    if (!sendingProfile) return null;

    return (
      <div className="space-y-6">
        {/* Name */}
        <div>
          <Label>Name</Label>
          <Input 
            type="text"  
            value={sendingProfile.name}
            readonly
            className="w-full text-sm sm:text-base h-10 px-3 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);


export default DeleteSendingProfileModalForm;