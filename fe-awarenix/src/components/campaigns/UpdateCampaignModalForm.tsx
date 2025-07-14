import { forwardRef, useState, useImperativeHandle, useEffect } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import LabelWithTooltip from "../ui/tooltip/Tooltip";
import Select from "../form/Select";
import Swal from "../utils/AlertContainer";
import DatePicker from "../form/date-picker";
import SendTestEmailModal from "../sendingprofiles/SendTestEmailModal";
import { Button } from "@headlessui/react";
// import { TestRecipient } from "../sendingprofiles/NewSendingProfilesModalForm";

type Campaign = {
  name: string;
  launchDate: string;
  sendEmailBy?: string;
  group: string;
  emailTemplate: string;
  landingPage: string;
  sendingProfile: string;
}

export type UpdateCampaignModalFormRef = {
  submitCampain: () => Promise<boolean>;
  campaign: Campaign | null;
};

type UpdateCampaignModalFormProps = {
  onSuccess?: () => void;
};

type CampaignData = {
  name: string;
  launchDate: string;
  sendEmailBy?: string;
  url: string;
  group: string;
  emailTemplate: string;
  landingPage: string;
  sendingProfile: string;
};

type RoleData = {
  id: number;
  name: string;
};

type EmailTemplateData = {
  id: number;
  name: string;
};

type LandingPageData = {
  id: number;
  name: string;
};

type SendingProfileData = {
  id: number;
  name: string;
};

const UpdateCampaignModalForm = forwardRef<UpdateCampaignModalFormRef, UpdateCampaignModalFormProps>(({ onSuccess }, ref) => {
  const [campaign, setCampaign] = useState<CampaignData>({
    name: "",
    launchDate: "",
    sendEmailBy: "",
    group: "",
    url: "",
    emailTemplate: "",
    landingPage: "",
    sendingProfile: ""
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CampaignData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailTemplateOptions, setEmailTemplateOptions] = useState<{ value: string; label: string }[]>([]);
  const [landingPageOptions, setLandingPageOptions] = useState<{ value: string; label: string }[]>([]);
  const [sendingProfileOptions, setsendingProfileOptions] = useState<{ value: string; label: string }[]>([]);
  const [groupOptions, setGroupOptions] = useState<{ value: string; label: string }[]>([]);

  // State untuk modal email tes
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

  // Fetch Roles
  const fetchGroups = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_URL}/groups/all`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch groups: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.Success && result.Data) {
        // Transform API data to select options format
        const options = result.Data.map((role: RoleData) => ({
          value: String(role.id), 
          label: role.name,
        }));
        
        setGroupOptions(options);
      } else {
        console.error('Failed to fetch groups:', result.Message);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };
  
  const fetchEmailTemplates = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_URL}/email-template/all`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch email template: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.Success && result.Data) {
        const options = result.Data.map((emailTemplate: EmailTemplateData) => ({
          value: String(emailTemplate.id), 
          label: emailTemplate.name,
        }));
        
        setEmailTemplateOptions(options);
      } else {
        console.error('Failed to fetch email template:', result.Message);
      }
    } catch (error) {
      console.error('Error fetching email template:', error);
    }
  };
  
  const fetchLandingPages = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_URL}/landing-page/all`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch landing page: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.Success && result.Data) {
        const options = result.Data.map((landingPage: LandingPageData) => ({
          value: String(landingPage.id), 
          label: landingPage.name,
        }));
        
        setLandingPageOptions(options);
      } else {
        console.error('Failed to fetch landing page:', result.Message);
      }
    } catch (error) {
      console.error('Error fetching landing page:', error);
    }
  };
  
  const fetchSendingProfiles = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_URL}/sending-profile/all`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sending profile: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.Success && result.Data) {
        // Transform API data to select options format
        const options = result.Data.map((sendingProfile: SendingProfileData) => ({
          value: String(sendingProfile.id), 
          label: sendingProfile.name,
        }));
        
        setsendingProfileOptions(options);
      } else {
        console.error('Failed to fetch sending profile:', result.Message);
      }
    } catch (error) {
      console.error('Error fetching sending profile:', error);
    }
  };

  // Fetch roles on component mount
  useEffect(() => {
    fetchGroups();
    fetchEmailTemplates();
    fetchLandingPages();
    fetchSendingProfiles();
  }, []);


  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Partial<CampaignData> = {};

    if (!campaign.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!campaign.launchDate.trim()) {
      newErrors.launchDate = "Launch Date is required";
    }
    
    if (!campaign.url.trim()) {
      newErrors.url = "URL is required";
    }
    
    if (!campaign.emailTemplate.trim()) {
      newErrors.emailTemplate = "Email Template is required";
    }

    if (!campaign.landingPage.trim()) {
      newErrors.landingPage = "Landing Page is required";
    }

    if (!campaign.sendingProfile.trim()) {
      newErrors.sendingProfile = "Sending Profile is required";
    }

    if (!campaign.group.trim()) {
      newErrors.group = "Group is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit function dengan better error handling
  const submitCampain = async (): Promise<boolean> => {
    
    if (!validateForm()) {
      return false;
    }

    setIsSubmitting(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const createdBy = userData?.id || 0; 
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: campaign.name,
          launchDate: campaign.launchDate,
          sendEmailBy: campaign.sendEmailBy,
          url: campaign.url,
          group: campaign.group,
          emailTemplate: campaign.emailTemplate,
          landingPage: campaign.landingPage,
          sendingProfile: campaign.sendingProfile,
          createdBy: createdBy
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create campaign';
        
        // Cek content type sebelum parsing
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
              if (errorData.status === "error") {
                // SET ERRORS KE FORM FIELD JIKA ADA
                if (errorData.fields && typeof errorData.fields === "object") {
                  setErrors(errorData.fields);
                }
                errorMessage = errorData.message || "Something went wrong";
              }
          } catch (jsonError) {
            console.error('Failed to parse JSON error:', jsonError);
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
        } else {
          // Jika bukan JSON, jangan coba parse sebagai JSON
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      Swal.fire({
        text: "Campaign successfully added!",
        icon: "success",
        duration: 3000
      });

      if (onSuccess) onSuccess(); 

      setCampaign({
        name: "",
        launchDate: "",
        sendEmailBy: "",
        group: "",
        url: "",
        emailTemplate: "",
        landingPage: "",
        sendingProfile: ""
      });
      setErrors({});
      
      return true;
      
    } catch (error) {
      console.error('Error creating campaign:', error);
      
      // Set error message untuk campaign
      if (error instanceof Error) {
        // Cek jika error terkait network
        if (error.message.includes('fetch')) {
          setErrors({
            name: 'Connection error. Please check if server is running.',
          });
        } else if (error.message.toLowerCase().includes('launchDate')) {
          setErrors({
            launchDate: error.message,
          });
        } else if (error.message.toLowerCase().includes('group')) {
          setErrors({
            group: error.message,
          });
        } else if (error.message.toLowerCase().includes('url')) {
          setErrors({
            url: error.message,
          });
        } else if (error.message.toLowerCase().includes('emailTemplate')) {
          setErrors({
            emailTemplate: error.message,
          });
        } else if (error.message.toLowerCase().includes('landingPage')) {
          setErrors({
            landingPage: error.message,
          });
        } else if (error.message.toLowerCase().includes('sendingProfile')) {
          setErrors({
            sendingProfile: error.message,
          });
        } else {
          setErrors({
            name: error.message,
          });
        }
      }
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    submitCampain,
    campaign: campaign as Campaign,
  }));

  // Handle input changes - dengan safety check
  const handleInputChange = (field: keyof CampaignData, value: string) => {
    // Prevent submit trigger dari input change
    if (isSubmitting) {
      return;
    }
    
    setCampaign(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Handle form submit (untuk prevent default jika ada)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // SEND TEST EMAIL HANDLE
  const handleOpenTestEmailModal = () => {
  // Validasi sebelum membuka modal

  if (!validateForm()) {
    if(errors.name) {
      Swal.fire({
        icon: 'error',
        text: errors.name,
        duration: 3000,
      });
    }
    // if(errors.interfaceType) {
    //   Swal.fire({
    //     icon: 'error',
    //     text: errors.interfaceType,
    //     duration: 3000,
    //   });
    // }
    // if(errors.smtpFrom) {
    //   Swal.fire({
    //     icon: 'error',
    //     text: errors.smtpFrom,
    //     duration: 3000,
    //   });
    // }
    // if(errors.host) {
    //   Swal.fire({
    //     icon: 'error',
    //     text: errors.host,
    //     duration: 3000,
    //   });
    // }
    // if(errors.username) {
    //   Swal.fire({
    //     icon: 'error',
    //     text: errors.username,
    //     duration: 3000,
    //   });
    // }
    // if(errors.password) {
    //   Swal.fire({
    //     icon: 'error',
    //     text: errors.password,
    //     duration: 3000,
    //   });
    // }
    return;
  }
  setShowTestEmailModal(true);
  };

  const handleCloseTestEmailModal = () => {
    setShowTestEmailModal(false);
  };

  // --- Fungsi untuk mengirim email tes ---
  const handleSendTestEmail = async () => {
    setIsSendingTestEmail(true);
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');

    // Body email sederhana untuk tes
    // const testEmailBody = `<html><body>
    //   <h1>Halo ${recipient.name},</h1>
    //   <p>Ini adalah email tes dari sistem pengiriman kami.</p>
    //   <p>Detail penerima:</p>
    //   <ul>
    //     <li>Nama: ${recipient.name}</li>
    //     <li>Email: ${recipient.email}</li>
    //     <li>Posisi: ${recipient.position}</li>
    //   </ul>
    //   <p>Profil pengiriman yang digunakan: ${profileName}</p>
    //   <p>Terima kasih!</p>
    //   <p><a href="{{.URL}}">Klik di sini untuk melacak</a></p>
    // </body></html>`;

    const dataToSend = {
      // sendingProfile: {
      //   name: profileName,
      //   interfaceType: interfaceType,
      //   smtpFrom: smtpFrom,
      //   host: host,
      //   username: username,
      //   password: password,
      //   emailHeaders: emailHeaders,
      // },
      // recipient: recipient,
      // emailBody: testEmailBody, 
    };

    try {
      // Asumsi endpoint API untuk mengirim email tes
      const response = await fetch(`${API_URL}/sending-profile/send-test-email`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          text: errorData.message || 'Failed to send test email.',
          duration: 3000,
        });
        return;
      }

      Swal.fire({
        icon: 'success',
        text: 'The test email was sent successfully!',
        duration: 3000,
      });
      handleCloseTestEmailModal(); 
    } catch (error: unknown) {
      console.error("An error occurred while sending the test email: ", error);
      Swal.fire({
        icon: 'error',
        text: 'A network or server error occurred while sending the test email.',
        duration: 3000,
      });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="rounded-xl">
          <div className="space-y-3 grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
            <div>
              <Label required>Name</Label>
              <Input
                placeholder="Name"
                value={campaign.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={isSubmitting}
                className={errors.name ? 'border-red-500' : ''}
                required
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label required>Launch Date</Label>
              <DatePicker
                id="date-picker"
                mode="datetime"
                placeholder="Select a date"
                onChange={(dates, currentDateString) => {
                  console.log({ dates, currentDateString });
                }}
              />
              {errors.launchDate && (
                <p className="text-red-500 text-sm mt-1">{errors.launchDate}</p>
              )}
            </div>

            <div>
              <LabelWithTooltip position="left" tooltip="If specified, This will send emails evenly between the campaign launch and this date.">Send Emails By</LabelWithTooltip>
              <DatePicker
                id="date-picker"
                mode="datetime"
                placeholder="Select a date"
                onChange={(dates, currentDateString) => {
                  console.log({ dates, currentDateString });
                }}
              />
              {errors.sendEmailBy && (
                <p className="text-red-500 text-sm mt-1">{errors.sendEmailBy}</p>
              )}
            </div>
          </div>
          <div className="space-y-3 grid grid-cols-1 xl:grid-cols-2 gap-3 mb-3">
            <div>
              <LabelWithTooltip position="right" tooltip="Group means target for this campaign" required>Groups</LabelWithTooltip>
              <Select
                value={campaign.group}
                options={groupOptions}
                onChange={(val) => handleInputChange('group', val)} 
                placeholder={"Select Group"}
                required
              />
              {errors.group && (
                <p className="text-red-500 text-sm mt-1">{errors.group}</p>
              )}
            </div>
            <div>
              <LabelWithTooltip tooltip="Email Phising that want to be send for target" required>Email Template</LabelWithTooltip>
              <Select
                value={campaign.emailTemplate}
                options={emailTemplateOptions}
                onChange={(val) => handleInputChange('emailTemplate', val)} 
                placeholder={"Select EmailTemplate"}
                required
              />
              {errors.emailTemplate && (
                <p className="text-red-500 text-sm mt-1">{errors.emailTemplate}</p>
              )}
            </div>
            <div>
              <LabelWithTooltip position="right" tooltip="Phishing page for target trap" required>Landing Page</LabelWithTooltip>
              <Select
                value={campaign.landingPage}
                options={landingPageOptions}
                onChange={(val) => handleInputChange('landingPage', val)} 
                placeholder={"Select Landing Page"}
                required
              />
              {errors.landingPage && (
                <p className="text-red-500 text-sm mt-1">{errors.landingPage}</p>
              )}
            </div>
            <div>
              <Label required>URL</Label>
              <Input
                placeholder="URL"
                value={campaign.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                disabled={isSubmitting}
                className={errors.url ? 'border-red-500' : ''}
                required
              />
              {errors.url && (
                <p className="text-red-500 text-sm mt-1">{errors.url}</p>
              )}
            </div>
          </div>
          <div className="space-y-3 grid grid-cols-1 xl:grid-cols-2 gap-3 mb-3  ">
            <div>
              <LabelWithTooltip position="left" tooltip="Sender that send email phising to target" required>Sending Profile</LabelWithTooltip>
              <Select
                value={campaign.sendingProfile}
                options={sendingProfileOptions}
                onChange={(val) => handleInputChange('sendingProfile', val)} 
                placeholder={"Select Sending Profile"}
                required
              />
              {errors.sendingProfile && (
                <p className="text-red-500 text-sm mt-1">{errors.sendingProfile}</p>
              )}
            </div>
            <div className="mt-7">
              <Button
                className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-[10px] flex items-center gap-2 rounded-md"
                onClick={handleOpenTestEmailModal} 
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>Send Test Email</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Render SendTestEmailModal */}
      <SendTestEmailModal
        isOpen={showTestEmailModal}
        onClose={handleCloseTestEmailModal}
        onSendTestEmail={handleSendTestEmail}
        isLoading={isSendingTestEmail}
      />
    </form>
  );
});

UpdateCampaignModalForm.displayName = 'UpdateCampaignModalForm';

export default UpdateCampaignModalForm;