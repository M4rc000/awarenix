import Label from "../form/Label";
import Input from "../form/input/InputField";
import Tabs from "../common/Tabs";
import ShowLandingPageBodyEditor from "./ShowLandingPageBodyEditor";

type LandingPage = {
  id: number;
  name: string;
  envelopeSender: string;
  subject: string;
  bodyEmail: string;
}

export type ShowLandingPageDetailModalFormRef = {
  submitLandingPages: () => Promise<LandingPage>;
  landingPage: LandingPage;
};

type LandingPageData = {
  name: string;
  body: string;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
};

type ShowLandingPageDetailModalFormProps = {
  landingPage: LandingPageData;
};

const ShowLandingPageDetailModalForm = ({ landingPage }: ShowLandingPageDetailModalFormProps) => {
  if (!landingPage) return null;
  

  const landingPageTabs = [
    {
      label: "📝 Email Body",
      content: <ShowLandingPageBodyEditor 
        name={landingPage.name}
        initialContent={landingPage.body}
      />,
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          📧 Landing Page Configuration
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Name</Label>
            <Input 
              placeholder="Welcome Login" 
              type="text" 
              value={landingPage.name} 
              className={`w-full text-sm sm:text-base h-10 px-3`}
              readonly
            />
          </div>
        </div>
      </div>

      <Tabs tabs={landingPageTabs} />
    </div>
  );
};

export default ShowLandingPageDetailModalForm;