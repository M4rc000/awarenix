import {
  useState,
  useEffect,
} from "react";
import Label from "../form/Label";
import LabelWithTooltip from "../ui/tooltip/Tooltip";
import Input from "../form/input/InputField";
import Swal from "../utils/AlertContainer";
import { formatUserDate } from "../utils/DateFormatter";

const API_URL = import.meta.env.VITE_API_URL;

export type Campaign = {
  id: number;
  name: string;
  launch_date: Date;
  sendEmailsBy?: Date;
  groupName: string;
  emailTemplateName: string;
  landingPageName: string;
  sendingProfileName: string;
  url: string;
  createdAt: Date;
  createdByName: string;
  updatedAt: Date;
  updatedByName: string;
};

type ShowCampaignModalFormProps = {
  campaign: Campaign | null;
  // isOpen: boolean;
  // onClose: () => void;
  // onSuccess?: () => void;
};

const ShowCampaignModalForm = ({ campaign }: ShowCampaignModalFormProps) => {
  const [campaignData, setCampaignData] = useState<Campaign | undefined>(undefined);

  // Fetch detail campaign dari API
  const fetchDetail = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/campaigns/${campaign?.id}`, { // Gunakan optional chaining di sini
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok) {
        Swal.fire({
          text: 'Failed to load campaign detail',
          icon: 'error',
          duration: 3000,
        })
      }

      const result = json.data;
      setCampaignData(result); 
    } catch (err: unknown) {
      console.error('Error fetching campaign detail: ', err);
    }
  };

  useEffect(() => {
    if (campaign && campaign.id) {
      fetchDetail();
    } else {
      setCampaignData(undefined); 
    }
  }, [campaign]); 

  return (
    <>
      {campaign && ( // Tetap tampilkan jika prop campaign ada
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div>
              <Label required>Name</Label>
              <Input value={campaignData?.name} readonly />
            </div>
            <div>
              <Label required>Launch Date</Label>
              <Input value={campaignData?.launch_date ? formatUserDate(campaignData.launch_date) : ''} readonly />
            </div>
            <div>
              <LabelWithTooltip
                position="left"
                tooltip="Jika diisi, email akan terkirim merata hingga tanggal ini"
              >
                Send Emails By
              </LabelWithTooltip>
              <Input value={campaignData?.sendEmailsBy ? formatUserDate(campaignData.sendEmailsBy) : ''} readonly />
            </div>
            <div>
              <LabelWithTooltip
                position="right"
                tooltip="Grup target untuk campaign ini"
                required
              >
                Groups
              </LabelWithTooltip>
              <Input value={campaignData?.groupName} readonly />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            <div>
              <LabelWithTooltip
                tooltip="Template email phishing yang akan dikirim"
                required
              >
                Email Template
              </LabelWithTooltip>
              <Input value={campaignData?.emailTemplateName} readonly />
            </div>
            <div>
              <LabelWithTooltip
                position="right"
                tooltip="Landing page phishing untuk target"
                required
              >
                Landing Page
              </LabelWithTooltip>
              <Input value={campaignData?.landingPageName} readonly />
            </div>
            <div>
              <Label required>URL</Label>
              <Input value={campaignData?.url} readonly />
            </div>
            <div>
              <LabelWithTooltip
                position="left"
                tooltip="SMTP profile yang digunakan untuk mengirim email"
                required
              >
                Sending Profile
              </LabelWithTooltip>
              <Input value={campaignData?.sendingProfileName} readonly />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="created-at" className="text-sm font-medium">
                Created At
              </Label>
              <Input
                id="created-at"
                type="text"
                value={campaignData?.createdAt ? formatUserDate(campaignData.createdAt) : ''}
                className="w-full mt-1"
                readonly
              />
            </div>
            <div>
              <Label htmlFor="created-by" className="text-sm font-medium">
                Created By
              </Label>
              <Input
                id="created-by"
                type="text"
                value={campaignData?.createdByName}
                className="w-full mt-1"
                readonly
              />
            </div>
            <div>
              <Label htmlFor="updated-at" className="text-sm font-medium">
                Updated At
              </Label>
              <Input
                id="updated-at"
                type="text"
                value={campaignData?.updatedAt ? formatUserDate(campaignData.updatedAt) : ''}
                className="w-full mt-1"
                readonly
              />
            </div>
            <div>
              <Label htmlFor="updated-by" className="text-sm font-medium">
                Updated By
              </Label>
              <Input
                id="updated-by"
                type="text"
                value={campaignData?.updatedByName}
                className="w-full mt-1"
                readonly
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ShowCampaignModalForm;