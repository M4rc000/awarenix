          
import Label from "../form/Label";
import Input from "../form/input/InputField";

export default function DeleteCampaignModalForm() {
  return (
    <div className="space-y-6">
      {/* Group Name */}
      <div>
        <Label>Campaign Name</Label>
        <Input
          placeholder="Team A"
          type="text"
          className="w-full text-sm sm:text-base h-10 px-3"
        />
      </div>
    </div>
  );
}