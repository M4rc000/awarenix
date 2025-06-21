          
import Label from "../form/Label";
import Input from "../form/input/InputField";

export default function DeleteGroupModalForm() {
  return (
    <div className="space-y-6">
      {/* Group Name */}
      <div>
        <Label>Group Name</Label>
        <Input
          placeholder="Team A"
          type="text"
          className="w-full text-sm sm:text-base h-10 px-3"
        />
      </div>
    </div>
  );
}