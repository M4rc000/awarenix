import { useState } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Tabs from "../common/Tabs";
import LandingPageBodyEditor from "./LandingPageBodyEditor";
import { FaPager } from "react-icons/fa6";

export default function NewLandingPageModalForm() {
  const [templateName, setTemplateName] = useState("Landing Page");

  const emailTabs = [
    {
      label: "📝 Page Body",
      content: <LandingPageBodyEditor />,
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="flex text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          <FaPager className="mt-[5px] mr-2"/> Landing Page Configuration
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Name</Label>
            <Input 
              placeholder="Page Name" 
              type="text" 
              value={templateName} 
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full text-sm sm:text-base h-10 px-3"
            />
          </div>
        </div>
      </div>

      <Tabs tabs={emailTabs} />
    </div>
  );
}