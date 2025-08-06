import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { FaRegTrashAlt } from "react-icons/fa";
import Swal from "../utils/AlertContainer";
import { GrFormPrevious } from "react-icons/gr";
import { MdOutlineNavigateNext } from "react-icons/md";
import LabelWithTooltip from "../ui/tooltip/Tooltip"; 
import Select from "../form/Select";
import SendTestEmailModal from "./SendTestEmailModal";

// Definisi interface untuk TestRecipient (sesuai dengan yang sudah ada)
export interface TestRecipient {
  name: string;
  email: string;
  position: string;
}

// Definisi interface SendingProfile yang lengkap dan konsisten dengan TableUsers
type SendingProfile = {
  id: number;
  name: string;
  interfaceType: string;
  smtpFrom: string;
  username: string;
  password: string;
  host: string;
  port: string;
  createdAt: string;
  createdBy: number;
  createdByName: string;
  updatedAt: string;
  updatedBy: number;
  updatedByName: string;
  EmailHeaders: string; 
};

// Interface untuk setiap Email Header dalam array
type EmailHeader = { header: string; value: string };

// Interface untuk ref yang diekspos ke parent
export type DuplicateSendingProfileModalFormRef = {
  submitSendingProfile: () => Promise<boolean>; 
  sendingProfile: SendingProfile | null;
};

// Interface props untuk komponen ini
type UpdateSendingProfilesModalFormProps = {
  onSuccess?: () => void;
  sendingProfile: SendingProfile; 
};

const DuplicateSendingProfileModalForm = forwardRef<
  DuplicateSendingProfileModalFormRef,
  UpdateSendingProfilesModalFormProps
>(({ onSuccess, sendingProfile: initialSendingProfile }, ref) => {
  const [profileName, setProfileName] = useState(initialSendingProfile?.name || "");
  const [interfaceType, setInterfaceType] = useState(initialSendingProfile?.interfaceType || "");
  const [port, setPort] = useState(initialSendingProfile?.port || "");
  const [smtpFrom, setSmtpFrom] = useState(initialSendingProfile?.smtpFrom || "");
  const [host, setHost] = useState(initialSendingProfile?.host || "");
  const [username, setUsername] = useState(initialSendingProfile?.username || "");
  // Password diinisialisasi sebagai string kosong agar backend bisa mendeteksi "tidak ada perubahan"
  const [password, setPassword] = useState("");

  // State untuk email headers, parsing dari JSON string
  const [emailHeaders, setEmailHeaders] = useState<EmailHeader[]>(() => {
    try {
      return initialSendingProfile?.EmailHeaders ? JSON.parse(initialSendingProfile.EmailHeaders) : [];
    } catch (e) {
      console.error("Failed to parse EmailHeaders:", e);
      return [];
    }
  });

  const [newHeader, setNewHeader] = useState("");
  const [newValue, setNewValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [errors, setErrors] = useState<Partial<SendingProfile>>({});
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [showPassword, setShowPassword] = useState(false);


  // State untuk modal email tes
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

  // Update state ketika initialSendingProfile berubah (misal ketika modal dibuka dengan data baru)
  useEffect(() => {
    // Tambahkan "Copy of" di awal profileName
    setProfileName(`Copy of ${initialSendingProfile?.name || ""}`); 
    setInterfaceType(initialSendingProfile?.interfaceType || "");
    setSmtpFrom(initialSendingProfile?.smtpFrom || "");
    setHost(initialSendingProfile?.host || "");
    setUsername(initialSendingProfile?.username || "");
    setPort(initialSendingProfile?.port || "");
    // Password tidak di-set di sini agar field tetap kosong untuk "tidak ada perubahan"
    setPassword("");
    try {
      setEmailHeaders(initialSendingProfile?.EmailHeaders ? JSON.parse(initialSendingProfile.EmailHeaders) : []);
    } catch (e) {
      console.error("Failed to parse EmailHeaders on update:", e);
      setEmailHeaders([]);
    }
    setErrors({}); // Clear errors on new data load
  }, [initialSendingProfile]);

  // Opsi untuk Interface Type
  const interfaceTypeOptions = [
    { value: 'SMTP', label: 'SMTP' },
    { value: 'API', label: 'API' },
  ];

  const addEmailHeader = () => {
    if (newHeader.trim() && newValue.trim()) {
      setEmailHeaders([
        ...emailHeaders,
        { header: newHeader.trim(), value: newValue.trim() },
      ]);
      setNewHeader("");
      setNewValue("");
    }
  };

  const removeEmailHeader = (indexToRemove: number) => {
    // Filter out the header at the original index, not just the displayed index
    setEmailHeaders((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  // Filter headers based on search term
  const filteredHeaders = emailHeaders.filter(
    (header) =>
      header.header.toLowerCase().includes(searchTerm.toLowerCase()) ||
      header.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredHeaders.length / entriesPerPage);
  const [currentPage, setCurrentPage] = useState(0);

  const displayedHeaders = filteredHeaders.slice(
    currentPage * entriesPerPage,
    (currentPage + 1) * entriesPerPage
  );

  // VALIDATION FUNCTION
  const validateForm = (): boolean => {
    const newErrors: Partial<SendingProfile> = {};

    // Pastikan nilai tidak undefined/null sebelum memanggil .trim()
    if (!profileName.trim()) {
      newErrors.name = "Name is required";
    }
    if (!interfaceType.trim()) {
      newErrors.interfaceType = "Interface Type is required";
    }
    if (!smtpFrom.trim()) {
      newErrors.smtpFrom = "SMTP From is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(smtpFrom)) {
      newErrors.smtpFrom = "Please enter a valid email";
    }
    if (!host.trim()) {
      newErrors.host = "Host is required";
    }
    if (!username.trim()) {
      newErrors.username = "Username is required";
    }
    if (!port) {
      newErrors.port = "Port is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SEND TEST EMAIL HANDLE
  const handleOpenTestEmailModal = () => {
    if (!validateForm()) {
      let errorMessage = '';
      // Collect all error messages for display in Swal
      for (const key in errors) {
        if (errors[key as keyof SendingProfile]) {
          errorMessage += `${errors[key as keyof SendingProfile]}\n`;
        }
      }
      if (errorMessage) {
        Swal.fire({
          icon: 'error',
          text: errorMessage.replace(/\n/g, '<br/>'),
          duration: 3000,
        });
      }
      return;
    }
    setShowTestEmailModal(true);
  };

  const handleCloseTestEmailModal = () => {
    setShowTestEmailModal(false);
  };

  // --- Fungsi untuk mengirim email tes ---
  const handleSendTestEmail = async (recipient: TestRecipient) => {
    setIsSendingTestEmail(true);
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');

    // KIRIM EMAILHEADERS SEBAGAI ARRAY OBJEK, BUKAN STRING JSON
    const dataToSend = {
      sendingProfile: {
        id: initialSendingProfile?.id || 0, 
        name: profileName,
        interfaceType: interfaceType,
        smtpFrom: smtpFrom,
        host: host,
        port: port,
        username: username,
        password: password, 
        EmailHeaders: emailHeaders, 
      },
      recipient: recipient,
      EmailBody: `<html><body>
        <h1>Halo ${recipient.name},</h1>
        <p>Ini adalah email tes dari sistem pengiriman kami.</p>
        <p>Detail penerima:</p>
        <ul>
          <li>Nama: ${recipient.name}</li>
          <li>Email: ${recipient.email}</li>
          <li>Posisi: ${recipient.position}</li>
        </ul>
        <p>Profil pengiriman yang digunakan: ${profileName}</p>
        <p>Terima kasih!</p>
        <p><a href="{{.URL}}">Klik di sini untuk melacak</a></p>
      </body></html>`,
    };

    try {
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

  // SUBMIT DATA UPDATE
  useImperativeHandle(ref, () => ({
    submitSendingProfile: async () => {
      if (!validateForm()) {
        return false; 
      }

      setIsSubmitting(true);
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const createdBy = userData?.id || 0;
      // const emailHeadersString = JSON.stringify(emailHeaders);

      const dataToSend = {
        name: profileName,
        interfaceType: interfaceType,
        smtpFrom: smtpFrom,
        host: host,
        port: port,
        username: username,
        password: password,
        emailHeaders: emailHeaders, 
        createdBy: createdBy, 
      };

      try {
        const response = await fetch(`${API_URL}/sending-profile/create`, {
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
          console.error("API Error Response:", errorData);
          Swal.fire({
            icon: 'error',
            text: errorData.message || 'Failed to add sending profile',
            duration: 3000,
          });
          return false;
        }

        Swal.fire({
          icon: 'success',
          text: 'Sending Profile successfully add!',
          duration: 3000,
        });
        if (onSuccess) onSuccess();
        return true;
      } catch (error: unknown) {
        console.error("An error occurred when adding sending profile: ", error);
        Swal.fire({
          icon: 'error',
          text: 'A network or server error occurred while adding the sending profile.',
          duration: 3000,
        });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    sendingProfile: {
      id: initialSendingProfile?.id || 0,
      name: profileName,
      interfaceType: interfaceType,
      smtpFrom: smtpFrom,
      username: username,
      password: password,
      host: host,
      port: port,
      EmailHeaders: JSON.stringify(emailHeaders),
      createdAt: initialSendingProfile?.createdAt || "",
      createdBy: initialSendingProfile?.createdBy || 0,
      createdByName: initialSendingProfile?.createdByName || "",
      updatedAt: initialSendingProfile?.updatedAt || "",
      updatedBy: initialSendingProfile?.updatedBy || 0,
      updatedByName: initialSendingProfile?.updatedByName || "",
    },
  }));

  return (
    <div className="space-y-6 max-w-4xl mx-auto bg-white dark:bg-gray-900">
      <div className="grid grid-cols-3 gap-3">
        {/* Profile Name */}
        <div>
          <LabelWithTooltip required>Profile Name</LabelWithTooltip>
          <Input
            placeholder="Team A"
            type="text"
            className={`w-full text-sm sm:text-base h-10 px-3 ${errors.name ? 'border-red-500' : ''}`}
            value={profileName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setProfileName(e.target.value);
              setErrors(prev => ({ ...prev, name: undefined }));
            }}
            disabled={isSubmitting} 
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Interface Type */}
        <div>
          <LabelWithTooltip required>Interface Type</LabelWithTooltip>
          <Select
            placeholder="Select Interface Type"
            options={interfaceTypeOptions}
            className={`w-full text-sm sm:text-base h-10 px-3 ${errors.interfaceType ? 'border-red-500' : ''}`}
            value={interfaceType}
            onChange={(val: string) => {
              setInterfaceType(val);
              setErrors(prev => ({ ...prev, interfaceType: undefined }));
            }}
          />
          {errors.interfaceType && (
            <p className="text-red-500 text-sm mt-1">{errors.interfaceType}</p>
          )}
        </div>

        {/* Port */}
        <div>
          <LabelWithTooltip required>Port</LabelWithTooltip>
          <Input
            placeholder="Default port is 587"
            type="text"
            className={`w-full text-sm sm:text-base h-10 px-3 ${errors.port ? 'border-red-500' : ''}`}
            value={port}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPort(e.target.value);
              setErrors(prev => ({ ...prev, port: undefined }));
            }}
            disabled={isSubmitting} 
          />
          {errors.port && (
            <p className="text-red-500 text-sm mt-1">{errors.port}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* SMTP FROM */}
        <div>
          <LabelWithTooltip required>SMTP From</LabelWithTooltip>
          <Input
            placeholder="example@gmail.com"
            type="text"
            className={`w-full text-sm sm:text-base h-10 px-3 ${errors.smtpFrom ? 'border-red-500' : ''}`}
            value={smtpFrom}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSmtpFrom(e.target.value);
              setErrors(prev => ({ ...prev, smtpFrom: undefined }));
            }}
            disabled={isSubmitting} 
          />
          {errors.smtpFrom && (
            <p className="text-red-500 text-sm mt-1">{errors.smtpFrom}</p>
          )}
        </div>

        {/* Host */}
        <div>
          <LabelWithTooltip required>Host</LabelWithTooltip>
          <Input
            placeholder="smtp.example.com:587"
            type="text"
            className={`w-full text-sm sm:text-base h-10 px-3 ${errors.host ? 'border-red-500' : ''}`}
            value={host}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setHost(e.target.value);
              setErrors(prev => ({ ...prev, host: undefined }));
            }}
            disabled={isSubmitting} 
          />
          {errors.host && (
            <p className="text-red-500 text-sm mt-1">{errors.host}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Username */}
        <div>
          <LabelWithTooltip required>Username</LabelWithTooltip>
          <Input
            placeholder="username"
            type="text"
            className={`w-full text-sm sm:text-base h-10 px-3 ${errors.username ? 'border-red-500' : ''}`}
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setUsername(e.target.value);
              setErrors(prev => ({ ...prev, username: undefined }));
            }}
            disabled={isSubmitting} 
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <LabelWithTooltip>Password</LabelWithTooltip> 
          <Input
            placeholder="Leave blank for no changes" 
            type={showPassword ? "text" : "password"}
            className={`w-full text-sm sm:text-base h-10 px-3 ${errors.password ? 'border-red-500' : ''}`}
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPassword(e.target.value);
              setErrors(prev => ({ ...prev, password: undefined }));
            }}
            disabled={isSubmitting} 
          />
          <span
            onClick={() => setShowPassword((s) => !s)}
            className="absolute z-30 right-4 top-1/2 -translate-y-1/2 cursor-pointer pt-[31px]"
          >
            {showPassword ? (
              <EyeIcon className="size-5 fill-gray-500" />
            ) : (
              <EyeCloseIcon className="size-5 fill-gray-500" />
            )}
          </span>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>
      </div>

      {/* Email Headers Section */}
      <div className="border-t dark:border-gray-700 pt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Email Headers:
        </h3>

        {/* Add Custom Header Form */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Input
            placeholder="X-Custom-Header"
            value={newHeader}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewHeader(e.target.value)
            }
            className="flex-1 text-sm h-10 px-3"
            disabled={isSubmitting} 
          />
          <Input
            placeholder="{{.URL}}-awarenix"
            value={newValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewValue(e.target.value)
            }
            className="flex-1 text-sm h-10 px-3"
            disabled={isSubmitting} 
          />
          <Button
            onClick={addEmailHeader}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm whitespace-nowrap"
            type="button"
            disabled={isSubmitting} 
          >
            + Add Custom Header
          </Button>
        </div>

        {/* Headers Table */}
        <div className="bg-white border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700 px-1">
          {/* Table Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 border-b rounded-lg dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2 sm:mb-0">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Show
              </span>
              <select
                className="border border-gray-300 rounded px-2 py-1 text-sm dark:text-gray-400 dark:bg-gray-800 dark:border-gray-600"
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(0); // Reset ke halaman pertama saat entries per page berubah
                }}
                disabled={isSubmitting} 
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                entries
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Search:
              </span>
              <Input
                placeholder="Search headers..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                className="w-48 text-sm h-8 px-2 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
                disabled={isSubmitting} 
              />
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow className="border-b-1 border-b-gray-400 dark:border-b-gray-700">
                <TableCell className="font-medium text-gray-900 dark:text-gray-100 py-2">
                  <div className="flex items-center mx-3">
                    #
                    <svg
                      className="w-3 h-3 ml-1 text-gray-400 dark:text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 12 12"
                    >
                      <path d="M6 3l3 3H3l3-3z" />
                    </svg>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-gray-900 dark:text-gray-100 py-2">
                  <div className="flex items-center mx-3">
                    Header
                    <svg
                      className="w-3 h-3 ml-1 text-gray-400 dark:text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 12 12"
                    >
                      <path d="M6 3l3 3H3l3-3z" />
                    </svg>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-gray-900 dark:text-gray-100 py-2">
                  <div className="flex items-center">
                    Value
                    <svg
                      className="w-3 h-3 ml-1 text-gray-400 dark:text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 12 12"
                    >
                      <path d="M6 9L3 6h6l-3 3z" />
                    </svg>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-gray-900 dark:text-gray-100 w-20 py-2">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedHeaders.length === 0 ? (
                <tr>
                  <td className="text-center py-8 text-gray-500 dark:text-gray-400" colSpan={4}>
                    {searchTerm
                      ? `No results found for "${searchTerm}"`
                      : "No data available in table"}
                  </td>
                </tr>
              ) : (
                displayedHeaders.map((header, index) => {
                  const originalIndex = emailHeaders.findIndex(
                    (h) => h.header === header.header && h.value === header.value
                  );
                  return (
                    <TableRow key={`${header.header}-${index}`} className="text-md">
                      <TableCell className="text-gray-900 dark:text-gray-400 px-3 py-2">
                        {currentPage * entriesPerPage + index + 1}
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-gray-400 px-3 py-2">
                        {searchTerm ? (
                          <span
                            dangerouslySetInnerHTML={{
                              __html: header.header.replace(
                                new RegExp(`(${searchTerm})`, "gi"),
                                '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>'
                              ),
                            }}
                          />
                        ) : (
                          header.header
                        )}
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-gray-400">
                        {searchTerm ? (
                          <span
                            dangerouslySetInnerHTML={{
                              __html: header.value.replace(
                                new RegExp(`(${searchTerm})`, "gi"),
                                '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>'
                              ),
                            }}
                          />
                        ) : (
                          header.value
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeEmailHeader(originalIndex)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 p-1 mx-2"
                          type="button"
                          disabled={isSubmitting} 
                        >
                          <FaRegTrashAlt />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Table Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
            <div>
              Showing {filteredHeaders.length > 0 ? currentPage * entriesPerPage + 1 : 0} to {Math.min((currentPage + 1) * entriesPerPage, filteredHeaders.length)} of {filteredHeaders.length} entries
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0 || isSubmitting}
                className="disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-400"
                type="button"
              >
                <GrFormPrevious/>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage >= totalPages - 1 || totalPages === 0 || isSubmitting}
                className="disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-400"
                type="button"
              >
                <MdOutlineNavigateNext/>
              </Button>
            </div>
          </div>
        </div>

        {/* Send Test Email Button */}
        <div className="mt-6">
          <Button
            className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 flex items-center gap-2"
            onClick={handleOpenTestEmailModal}
            type="button"
            disabled={isSubmitting || isSendingTestEmail} 
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

      {/* Render SendTestEmailModal */}
      <SendTestEmailModal
        isOpen={showTestEmailModal}
        onClose={handleCloseTestEmailModal}
        onSendTestEmail={handleSendTestEmail}
        isLoading={isSendingTestEmail}
      />
    </div>
  );
});

export default DuplicateSendingProfileModalForm;