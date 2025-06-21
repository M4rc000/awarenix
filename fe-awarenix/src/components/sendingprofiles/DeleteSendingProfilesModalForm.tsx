          
import Label from "../form/Label";
import Input from "../form/input/InputField";

export default function DeleteSendingProfilesForm() {
  return (
    <div className="space-y-6">
      {/* Sending Profiles */}
      <div>
        <Label>Sending Profiles</Label>
        <Input
          placeholder="Team A"
          type="text"
          className="w-full text-sm sm:text-base h-10 px-3"
        />
      </div>
    </div>
  );
}