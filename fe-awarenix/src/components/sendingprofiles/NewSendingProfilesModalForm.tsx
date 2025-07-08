import { useState, forwardRef, useImperativeHandle } from "react";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
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
import SendTestEmailModal from "./SendTestEmailModal";

interface TestRecipient {
  name: string;
  email: string;
  position: string;
}

type SendingProfile = {
  id: number;
  name: string;
  interfaceType: string;
  smtpFrom: string;
  host: string;
  username: string;
  password: string;
}

export type NewSendingProfileModalFormRef = {
  submitSendingProfile: () => Promise<{
    name: string;
    interfaceType: string;
    smtpFrom: string;
    host: string;
    username: string;
    password: string;
    emailHeaders: { header: string; value: string }[];
  } | null>;
};

const NewSendingProfileModalForm = forwardRef<NewSendingProfileModalFormRef>(
  (_, ref) => { 
    type EmailHeader = { header: string; value: string };

    // State untuk input form
    const [profileName, setProfileName] = useState("");
    const [interfaceType, setInterfaceType] = useState("");
    const [smtpFrom, setSmtpFrom] = useState("");
    const [host, setHost] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [emailHeaders, setEmailHeaders] = useState<EmailHeader[]>([]);
    const [newHeader, setNewHeader] = useState("");
    const [newValue, setNewValue] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [errors, setErrors] = useState<Partial<SendingProfile>>({});
    

    // State untuk modal email tes
    const [showTestEmailModal, setShowTestEmailModal] = useState(false);
    const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

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

    const removeEmailHeader = (index: number) => {
      setEmailHeaders((prev) => prev.filter((_, i) => i !== index));
    };

    // Filter headers based on search term
    const filteredHeaders = emailHeaders.filter(
      (header) =>
        header.header.toLowerCase().includes(searchTerm.toLowerCase()) ||
        header.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate pagination
    const displayedHeaders = filteredHeaders.slice(0, entriesPerPage);

    // VALIDATION FUNCTION
    const validateForm = (): boolean => {
      const newErrors: Partial<SendingProfile> = {};

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
      if (!password.trim()) {
        newErrors.password = "Password is required";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
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
        if(errors.interfaceType) {
          Swal.fire({
            icon: 'error',
            text: errors.interfaceType,
            duration: 3000,
          });
        }
        if(errors.smtpFrom) {
          Swal.fire({
            icon: 'error',
            text: errors.smtpFrom,
            duration: 3000,
          });
        }
        if(errors.host) {
          Swal.fire({
            icon: 'error',
            text: errors.host,
            duration: 3000,
          });
        }
        if(errors.username) {
          Swal.fire({
            icon: 'error',
            text: errors.username,
            duration: 3000,
          });
        }
        if(errors.password) {
          Swal.fire({
            icon: 'error',
            text: errors.password,
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

      // Body email sederhana untuk tes
      const testEmailBody = `<html><body>
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
      </body></html>`;

      const dataToSend = {
        sendingProfile: {
          name: profileName,
          interfaceType: interfaceType,
          smtpFrom: smtpFrom,
          host: host,
          username: username,
          password: password,
          emailHeaders: emailHeaders,
        },
        recipient: recipient,
        emailBody: testEmailBody, 
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
            text: errorData.message || 'Gagal mengirim email tes.',
            duration: 3000,
          });
          return;
        }

        Swal.fire({
          icon: 'success',
          text: 'Email tes berhasil dikirim!',
          duration: 3000,
        });
        handleCloseTestEmailModal(); // Tutup modal setelah berhasil
      } catch (error: unknown) {
        console.error("Terjadi kesalahan saat mengirim email tes: ", error);
        Swal.fire({
          icon: 'error',
          text: 'Terjadi kesalahan jaringan atau server saat mengirim email tes.',
          duration: 3000,
        });
      } finally {
        setIsSendingTestEmail(false);
      }
    };

    // SEND DATA CREATE
    useImperativeHandle(ref, () => ({
      submitSendingProfile: async () => {
        if (!validateForm()) {
          return null;
        }

        const API_URL = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const createdBy = userData?.id || 0; 
        const dataToSend = {
          name: profileName,
          interfaceType: interfaceType,
          smtpFrom: smtpFrom,
          host: host,
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
            console.log(errorData);
            Swal.fire({
              icon: 'error',
              text: errorData.message || 'Failed to save sending profile',
              duration: 3000,
            });
          }
          
          
          const result = await response.json();
          
          Swal.fire({
            icon: 'success',
            text: 'Sending Profile successfully added!',
            duration: 3000,
          });
          return result;
        } catch (error: unknown) {
          console.error("An occured when saving sending profile! ", error);
          return null;
        }
      },
    }));

    return (
      <div className="space-y-6 max-w-4xl mx-auto bg-white dark:bg-gray-900">
        {/* Profile Name */}
        <div>
          <LabelWithTooltip required>Profile Name</LabelWithTooltip>
          <Input
            placeholder="Team A"
            type="text"
            className={`w-full text-sm sm:text-base h-10 px-3 ${errors.name ? 'border-red-500' : ''}`}
            value={profileName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setProfileName(e.target.value)
            }
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Interface Type */}
        <div>
          <LabelWithTooltip required>Interface Type</LabelWithTooltip>
          <Input
            placeholder="SMTP"
            type="text"
            className={`w-full text-sm sm:text-base h-10 px-3 ${errors.interfaceType ? 'border-red-500' : ''}`}
            value={interfaceType}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setInterfaceType(e.target.value)
            }
          />
          {errors.interfaceType && (
            <p className="text-red-500 text-sm mt-1">{errors.interfaceType}</p>
          )}
        </div>

        {/* SMTP FROM */}
        <div>
          <LabelWithTooltip required>SMTP From</LabelWithTooltip>
          <Input
            placeholder="example@gmail.com"
            type="text"
            className={`w-full text-sm sm:text-base h-10 px-3 ${errors.smtpFrom ? 'border-red-500' : ''}`}
            value={smtpFrom}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSmtpFrom(e.target.value)
            }
          />
          {errors.smtpFrom && (
            <p className="text-red-500 text-sm mt-1">{errors.smtpFrom}</p>
          )}
        </div>

        {/* Host */}
        <div>
          <LabelWithTooltip required>Host</LabelWithTooltip>
          <Input
            placeholder="smtp.example.com"
            type="text"
            className={`w-full text-sm sm:text-base h-10 px-3 ${errors.host ? 'border-red-500' : ''}`}
            value={host}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setHost(e.target.value)
            }
          />
          {errors.host && (
            <p className="text-red-500 text-sm mt-1">{errors.host}</p>
          )}
        </div>

        {/* Username */}
        <div>
          <LabelWithTooltip required>Username</LabelWithTooltip>
          <Input
            placeholder="username"
            type="text"
            className={`w-full text-sm sm:text-base h-10 px-3 ${errors.username ? 'border-red-500' : ''}`}
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setUsername(e.target.value)
            }
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <LabelWithTooltip required>Password</LabelWithTooltip>
          <Input
            placeholder="******"
            type="password"
            className={`w-full text-sm sm:text-base h-10 px-3 ${errors.password ? 'border-red-500' : ''}`}
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
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
            />
            <Input
              placeholder="{{.URL}}-awarenix"
              value={newValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewValue(e.target.value)
              }
              className="flex-1 text-sm h-10 px-3"
            />
            <Button
              onClick={addEmailHeader}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm whitespace-nowrap"
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
                  onChange={(e) => setEntriesPerPage(Number(e.target.value))}
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
                    <td className="text-center py-8 text-gray-500 dark:text-gray-400" colSpan={3}> 
                      {searchTerm
                        ? `No results found for "${searchTerm}"`
                        : "No data available in table"}
                    </td>
                  </tr>
                ) : (
                  displayedHeaders.map((header, index) => {
                    // Find the original index for deletion
                    const originalIndex = emailHeaders.findIndex(
                      (h) => h.header === header.header && h.value === header.value
                    );
                    return (
                      <TableRow key={`${header.header}-${index}`} className="text-md">
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
                            <span>
                              {index + 1}
                            </span>
                          )}
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
                Showing 0 to {displayedHeaders.length} of {filteredHeaders.length} entries {/* Perbaiki tampilan jumlah entries */}
              </div>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={true}
                  className="disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-400"
                >
                  <GrFormPrevious/>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={true}
                  className="disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-400"
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
  }
);

export default NewSendingProfileModalForm;