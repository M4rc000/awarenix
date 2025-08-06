import { forwardRef, useImperativeHandle } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";

type UserData = {
  id: number;
  name: string;
  email: string;
  position: string;
};

export type DeleteUserModalFormRef = {
  submitDelete: () => void;
};

type DeleteUserModalFormProps = {
  user: UserData;
  error?: string;
  isDeleting?: boolean;
  onDelete: () => void;
};

const DeleteUserModalForm = forwardRef<DeleteUserModalFormRef, DeleteUserModalFormProps>(
  ({ user, error, onDelete }, ref) => {
    useImperativeHandle(ref, () => ({
      submitDelete: async () => {
        await onDelete();
        return true;
      }
    }));

    if (!user) return null;

    return (
      <div className="space-y-6">
        {/* Name */}
        <div>
          <Label>Name</Label>
          <Input 
            type="text"  
            value={user.name}
            readonly
            className="w-full text-sm sm:text-base h-10 px-3 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
          />
        </div>

        {/* Email */}
        <div>
          <Label>Email</Label>
          <Input 
            type="email"  
            value={user.email}
            readonly
            className="w-full text-sm sm:text-base h-10 px-3 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
          />
        </div>

        {/* Position */}
        <div>
          <Label>Position</Label>
          <Input 
            type="text"  
            value={user.position}
            readonly
            className="w-full text-sm sm:text-base h-10 px-3 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

DeleteUserModalForm.displayName = "DeleteUserModalForm";

export default DeleteUserModalForm;