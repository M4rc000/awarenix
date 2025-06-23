          
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { useImperativeHandle, forwardRef } from "react";

type GroupData = {
  id: number;
  name: string;
};

export type DeleteGroupModalFormRef = {
  submitDelete: () => void;
};

type DeleteGroupModalFormProps = {
  group: GroupData;
  error?: string;
  isDeleting?: boolean;
  onDelete: () => void;
};

const DeleteGroupModalForm = forwardRef<DeleteGroupModalFormRef, DeleteGroupModalFormProps>(
  ({ group, onDelete }, ref) => {
    useImperativeHandle(ref, () => ({
      submitDelete: async () => {
        await onDelete();
        return true;
      }
    }));

  if (!group) return null;
  return (
    <div className="space-y-6">
      {/* Group Name */}
      <div>
        <Label>Group Name</Label>
        <Input
          type="text"
          value={group.name}
          className="w-full text-sm sm:text-base h-10 px-3"
          readonly
        />
      </div>
    </div>
  );
})

export default DeleteGroupModalForm;