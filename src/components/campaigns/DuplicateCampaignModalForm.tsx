import {
  forwardRef,
  useState,
  useEffect,
  useImperativeHandle,
} from "react";
import Swal from "../utils/AlertContainer";
import DatePicker from "../form/date-picker";
import Select from "../form/Select";
import Label from "../form/Label";
import LabelWithTooltip from "../ui/tooltip/Tooltip";
import { Campaign as ParentCampaignType } from "./TableCampaigns";
import Input from "../form/input/InputField";

const API_URL = import.meta.env.VITE_API_URL as string;

type Group = { id: number; name: string };
type Template = { id: number; name: string };
type LandingPage = { id: number; name: string };
type SendingProfile = {
  id: number;
  name: string;
  smtpHost: string;
  smtpPort: number;
  username: string;
  secure: boolean;
};

type Option = { value: string; label: string };

export type DuplicateCampaignModalFormRef = {
  submitCampaign: () => Promise<boolean>;
};

type Props = {
  campaign: ParentCampaignType;
  onUpdateSuccess: () => void;
};

// Generic shape of your API's JSON response
type ApiResponse<T> = {
  Success: string;
  message: string;
  Data: T;
};

const DuplicateCampaignModalForm = forwardRef<
  DuplicateCampaignModalFormRef,
  Props
>(({ campaign, onUpdateSuccess }, ref) => {
  // lookup lists
  const [groups, setGroups] = useState<Group[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [sendingProfiles, setSendingProfiles] = useState<SendingProfile[]>([]);


  // form state
  const [name, setName] = useState<string>(campaign.name);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    String(campaign.group_id)
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    String(campaign.email_template_id)
  );
  const [selectedLandingPageId, setSelectedLandingPageId] = useState<string>(
    String(campaign.landing_page_id)
  );
  const [selectedSendingProfileId, setSelectedSendingProfileId] = useState<string>(
    String(campaign.sending_profile_id)
  );
  const [scheduleAt, setScheduleAt] = useState<string>(
    new Date(campaign.launch_date).toISOString()
  );
  const [url, setUrl] = useState<string>(
    String(campaign.launch_date)
  );
  const [sendEmailBy, setSendEmailBy] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);


  // Fetch all lookup lists once
  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    async function loadLookups() {
      try {
        const [gRes, tRes, lRes, sRes] = await Promise.all([
          fetch(`${API_URL}/groups/all`, { headers }).then((r) => r.json()) as Promise<ApiResponse<Group[]>>,
          fetch(`${API_URL}/email-template/all`, { headers }).then((r) => r.json()) as Promise<ApiResponse<Template[]>>,
          fetch(`${API_URL}/landing-page/all`, { headers }).then((r) => r.json()) as Promise<ApiResponse<LandingPage[]>>,
          fetch(`${API_URL}/sending-profile/all`, { headers }).then((r) => r.json()) as Promise<ApiResponse<SendingProfile[]>>,
        ]);

        if (gRes.Success) setGroups(gRes.Data);
        if (tRes.Success) setTemplates(tRes.Data);
        if (lRes.Success) setLandingPages(lRes.Data);
        if (sRes.Success) setSendingProfiles(sRes.Data);
      } catch (err: unknown) {
        console.error("Lookup load error:", err);
        const msg = err instanceof Error ? err.message : String(err);
        Swal.fire({ text: "Gagal memuat opsi seleksi: " + msg, icon: "error", duration: 3000 });
      }
    }

    loadLookups();
  }, []);

  // Reset form when `campaign` prop changes
  useEffect(() => {
    setName("Copy of " + campaign.name);
    setSelectedGroupId(String(campaign.group_id));
    setSelectedTemplateId(String(campaign.email_template_id));
    setSelectedLandingPageId(String(campaign.landing_page_id));
    setSelectedSendingProfileId(String(campaign.sending_profile_id));
    setScheduleAt(new Date(campaign.launch_date).toISOString());
    setSendEmailBy(null);
    setUrl(String(campaign.url));
  }, [campaign]);

  // The method parent will call via ref
  const submitCampaign = async (): Promise<boolean> => {
    setSaving(true);

    // validation
    if (
      !name ||
      !selectedGroupId ||
      !selectedTemplateId ||
      !selectedLandingPageId ||
      !selectedSendingProfileId ||
      !scheduleAt ||
      // !sendEmailBy ||
      !url
    ) {
      Swal.fire({
        text: 'All field is required',
        icon: 'error',
        duration: 3000,
      })
      setSaving(false);
      return false;
    }

    const currentUserData = JSON.parse(localStorage.getItem("user") || "{}");
    const updatedBy = currentUserData?.id || 0;

    const payload = {
      name,
      group_id: Number(selectedGroupId),
      email_template_id: Number(selectedTemplateId),
      landing_page_id: Number(selectedLandingPageId),
      sending_profile_id: Number(selectedSendingProfileId),
      launch_date: scheduleAt,
      send_email_by: sendEmailBy,
      url: url,
      updated_by: updatedBy,
    };

    try {
      const token = localStorage.getItem("token") ?? "";
      const res = await fetch(`${API_URL}/campaigns/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const json = await res.json() as ApiResponse<unknown>;

      if (!res.ok) {
        throw new Error(json.message || "Failed to update campaign");
      }

      Swal.fire({
        text: "Campaign successfully added!",
        icon: "success",
        duration: 3000
      });
      onUpdateSuccess();
      return true;
    } catch (err: unknown) {
      console.error("Update error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      Swal.fire({ text: msg, icon: "error", duration: 3000 });
      return false;
    } finally {
      setSaving(false);
    }
  };

  // expose submitCampaign in parent via ref
  useImperativeHandle(ref, () => ({ submitCampaign }));

  // map to Select options
  const groupOptions: Option[] = groups.map(g => ({
    value: String(g.id),
    label: g.name,
  }));
  const templateOptions: Option[] = templates.map(g => ({ value:String(g.id), label:g.name })); 
  const landingPageOptions: Option[] = landingPages.map(g => ({ value:String(g.id), label:g.name })); 
  const sendingProfileOptions: Option[] = sendingProfiles.map(g => ({ value:String(g.id), label:g.name })); 

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {/* Campaign Name */}
        <div>
          <Label required>Campaign Name</Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100"
            required
          />
        </div>
        
        {/* Schedule Date */}
        <div>
          <Label required>Launch Date</Label>
          <DatePicker
            id="launch-date"
            mode="datetime"
            value={scheduleAt}
            onChange={(_, dateStr) => setScheduleAt(dateStr)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {/* Send Email By */}
        <div>
          <Label required>Send Email By</Label>
          <DatePicker
            id="send-email-by"
            mode="datetime"
            value={sendEmailBy ?? undefined}
            onChange={(_, dateStr) => setScheduleAt(dateStr)}
          />
        </div>

        {/* URL */}
        <div>
          <Label required>URL</Label>
          <Input
            type="text"
            value={url}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Group */}
        <div>
          <LabelWithTooltip tooltip="Grup target untuk campaign ini" required>
            Group
          </LabelWithTooltip>
          <Select
            options={groupOptions}
            value={selectedGroupId}
            onChange={(v: string) => setSelectedGroupId(v)}
            placeholder="Select group…"
            required
          />
        </div>

        {/* Email Template */}
        <div>
          <LabelWithTooltip tooltip="Template email phishing" required>
            Email Template
          </LabelWithTooltip>
          <Select
            options={templateOptions}
            value={selectedTemplateId}
            onChange={(v: string) => setSelectedTemplateId(v)}
            placeholder="Select template…"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Landing Page */}
        <div>
          <LabelWithTooltip tooltip="Landing page phishing" required>
            Landing Page
          </LabelWithTooltip>
          <Select
            options={landingPageOptions}
            value={selectedLandingPageId}
            onChange={(v: string) => setSelectedLandingPageId(v)}
            placeholder="Select page…"
            required
          />
        </div>

        {/* Sending Profile */}
        <div>
          <LabelWithTooltip tooltip="SMTP profile untuk pengiriman email" required>
            Sending Profile
          </LabelWithTooltip>
          <Select
            options={sendingProfileOptions}
            value={selectedSendingProfileId}
            onChange={(v: string) => setSelectedSendingProfileId(v)}
            placeholder="Select profile…"
            required
          />
        </div>
      </div>
      {saving && <p className="text-sm text-blue-600">Saving...</p>}
    </div>
  );
});

export default DuplicateCampaignModalForm;