import { forwardRef, useImperativeHandle } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";

type LandingPageData = {
  id: number;
  name: string;
  body: string;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
};

export type DeleteLandingPageFormRef = {
  submitDelete: () => void;
};

type DeleteLandingPageModalFormProps = {
  landingPage: LandingPageData;
  error?: string;
  isDeleting?: boolean;
  onDelete: () => void;
};

const DeleteLandingPageModalForm = forwardRef<DeleteLandingPageFormRef, DeleteLandingPageModalFormProps>(
  ({ landingPage, onDelete }, ref) => {
    useImperativeHandle(ref, () => ({
      submitDelete: async () => {
        await onDelete();
        return true;
      }
    }));

    if (!landingPage) return null;
    return (
      <div className="space-y-6">
        {/* Name */}
        <div>
          <Label>Name</Label>
          <Input 
            type="text"  
            value={landingPage.name}
            readonly
            className="w-full text-sm sm:text-base h-10 px-3 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
          />
        </div>
      </div>
    );
  }
); 

DeleteLandingPageModalForm.displayName = "DeleteLandingPageModalForm";

export default DeleteLandingPageModalForm;