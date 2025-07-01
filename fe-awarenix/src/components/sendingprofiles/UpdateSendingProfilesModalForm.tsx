import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import Button from '../ui/button/Button';
import Input from '../form/input/InputField';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Swal from '../utils/AlertContainer';
import { MdOutlineNavigateNext } from "react-icons/md";
import { GrFormPrevious } from "react-icons/gr";
import { FaTrashAlt } from 'react-icons/fa';
import LabelWithTooltip from '../ui/tooltip/Tooltip';

type SendingProfile = {
  id: number;
  name: string;
  interfaceType: string;
  smtpFrom: string;
  username: string;
  password: string;
  host: string;
  CreatedAt: string;
  CreatedBy: number;
  CreatedByName: string;
  UpdatedAt: string;
  UpdatedBy: number;
  UpdatedByName: string;
  senderAddress: string;
};

type EmailHeader = { 
    id?: number; 
    sendingProfileId?: number; 
    header: string; 
    value: string;
    createdAt?: string;
    createdBy?: number;
    updatedAt?: string;
    updatedBy?: number;
};

type UpdateSendingProfileModalFormProps = {
  sendingProfile: SendingProfile;
};

export type UpdateSendingProfileModalFormRef = {
  submitSendingProfile: () => Promise<boolean>;
};

const UpdateSendingProfileModalForm = forwardRef<
  UpdateSendingProfileModalFormRef,
  UpdateSendingProfileModalFormProps
>(
  ({ sendingProfile }, ref) => {
    if (!sendingProfile) return null;
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

    // GET EMAIL HEADERS DATA
    const fetchEmailHeaders = useCallback(async () => {
      try {
        const profileId = sendingProfile.id;
        if (!profileId) { // Tambahkan validasi jika profileId tidak ada
            setEmailHeaders([]);
            return;
        }

        const API_URL = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/sending-profile/email-header/${profileId}`, {
          method: "GET",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        console.log('Result fetchEmailHeaders: ', result); 
      
        if (result.status === 'success') {
          if (Array.isArray(result.data)) {
            setEmailHeaders(result.data);
          } else {
            console.warn("EmailHeaders from API is not a valid array:", result.data);
            setEmailHeaders([]);
          }
        } else {
          Swal.fire({
            icon: 'error',
            text: result.message || 'Failed to fetch email headers.',
            duration: 3000, 
          });
          setEmailHeaders([]);
        }
      } catch (error) {
        console.error("Error fetching email headers:", error);
        Swal.fire({
          icon: 'error',
          text: 'An error occurred while fetching email headers.',
          duration: 3000,
        });
        setEmailHeaders([]);
      }
    }, [sendingProfile.id]);

    useEffect(() => {
      if (sendingProfile) {
        setProfileName(sendingProfile.name || "");
        setInterfaceType(sendingProfile.interfaceType || "");
        setSmtpFrom(sendingProfile.smtpFrom || "");
        setHost(sendingProfile.host || "");
        setUsername(sendingProfile.username || "");
        setPassword(""); 

        // Panggil fungsi untuk mengambil email headers
        if (sendingProfile.id) {
          fetchEmailHeaders();
        } else {
          setEmailHeaders([]); // Jika tidak ada ID, kosongkan headers
        }
      }
    }, [sendingProfile, fetchEmailHeaders]); // Dependensi fetchEmailHeaders diperlukan di sini

    // Fungsi untuk menambahkan header email baru
    const addEmailHeader = () => {
      if (newHeader.trim() && newValue.trim()) {
        setEmailHeaders((prevHeaders) => [
          ...prevHeaders,
          { header: newHeader.trim(), value: newValue.trim() },
        ]);
        setNewHeader("");
        setNewValue("");
      }
    };

    // Fungsi untuk menghapus header email
    const removeEmailHeader = (indexToRemove: number) => {
      setEmailHeaders((prev) => prev.filter((_, i) => i !== indexToRemove));
    };

    // Filter headers berdasarkan search term
    const filteredHeaders = emailHeaders.filter(
      (header) =>
        header.header.toLowerCase().includes(searchTerm.toLowerCase()) ||
        header.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Hitung paginasi (perbaiki logika paginasi untuk menunjukkan halaman yang benar)
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(filteredHeaders.length / entriesPerPage);
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const displayedHeaders = filteredHeaders.slice(indexOfFirstEntry, indexOfLastEntry);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    // Fungsi yang diekspos melalui ref untuk submit data
    useImperativeHandle(ref, () => ({
      submitSendingProfile: async () => {
        // Validasi sederhana
        if (!profileName || !smtpFrom || !host || !username) {
          Swal.fire({ icon: 'warning', text: 'Please complete all required fields (Profile Name, SMTP From, Host, Username)!', duration: 3000 });
          return false;
        }

        let passwordToSend = password;
        if (!password) {
          passwordToSend = "";
        }

        const API_URL = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem('token');

        // 1. Kirim data profil utama
        const profileDataToSend = {
          name: profileName,
          interfaceType: interfaceType,
          smtpFrom: smtpFrom,
          host: host,
          username: username,
          password: passwordToSend,
        };

        let profileUpdateSuccess = false;
        try {
          const profileResponse = await fetch(`${API_URL}/sending-profile/${sendingProfile.id}`, {
            method: "PUT",
            credentials: 'include',
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(profileDataToSend),
          });

          if (!profileResponse.ok) {
            const errorData = await profileResponse.json();
            Swal.fire({ icon: 'error', text: errorData.message || 'Failed to update sending profile details.', duration: 3000 });
            return false;
          }
          profileUpdateSuccess = true;
        } catch (error) {
          console.error("Error updating sending profile details:", error);
          Swal.fire({ icon: 'error', text: 'An error occurred while updating profile details!', duration: 3000 });
          return false;
        }

        // Jika update profil utama berhasil, lanjutkan ke update header
        if (profileUpdateSuccess) {
          try {
            // 2. Kirim data email headers
            // Pastikan emailHeaders DIKIRIM SEBAGAI ARRAY OBJEK, BUKAN STRING JSON
            const headersResponse = await fetch(`${API_URL}/sending-profile/email-header/${sendingProfile.id}`, {
              method: "PUT",
              credentials: 'include',
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(emailHeaders), // Mengirim array objek langsung
            });

            if (!headersResponse.ok) {
              const errorData = await headersResponse.json();
              Swal.fire({ icon: 'error', text: errorData.message || 'Failed to update email headers.', duration: 3000 });
              return false;
            }
            Swal.fire({ icon: 'success', text: 'Sending Profile and Headers successfully updated!', duration: 3000 });
            return true; // Kedua update berhasil

          } catch (error) {
            console.error("Error updating email headers:", error);
            Swal.fire({ icon: 'error', text: 'An error occurred while updating email headers!', duration: 3000 });
            return false;
          }
        }
        return false; // Seharusnya tidak tercapai
      },
    }));

    return (
      <div className="space-y-6 max-w-4xl mx-auto bg-white dark:bg-gray-900">
        {/* Profile Name */}
        <div>
          <LabelWithTooltip required>Profile Name</LabelWithTooltip>
          <Input
            id="profileName"
            placeholder="Team A"
            type="text"
            className="w-full text-sm sm:text-base h-10 px-3"
            value={profileName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setProfileName(e.target.value)
            }
          />
        </div>

        {/* Interface Type */}
        <div>
          <LabelWithTooltip required>Interface Type</LabelWithTooltip>
          <Input
            id="interfaceType"
            placeholder="SMTP"
            type="text"
            className="w-full text-sm sm:text-base h-10 px-3"
            value={interfaceType}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setInterfaceType(e.target.value)
            }
          />
        </div>

        {/* SMTP FROM */}
        <div>
          <LabelWithTooltip required>SMTP From</LabelWithTooltip>
          <Input
            id="smtpFrom"
            placeholder="First Last example@gmail.com"
            type="text"
            className="w-full text-sm sm:text-base h-10 px-3"
            value={smtpFrom}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSmtpFrom(e.target.value)
            }
          />
        </div>

        {/* Host */}
        <div>
          <LabelWithTooltip required>Host</LabelWithTooltip>
          <Input
            id="host"
            placeholder="smtp.example.com"
            type="text"
            className="w-full text-sm sm:text-base h-10 px-3"
            value={host}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setHost(e.target.value)
            }
          />
        </div>

        {/* Username */}
        <div>
          <LabelWithTooltip required>Username</LabelWithTooltip>
          <Input
            id="username"
            placeholder="username"
            type="text"
            className="w-full text-sm sm:text-base h-10 px-3"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setUsername(e.target.value)
            }
          />
        </div>

        {/* Password */}
        <div>
          <LabelWithTooltip required>Password</LabelWithTooltip>
          <Input
            id="password"
            placeholder="****** (Leave blank to keep current password)"
            type="password"
            className="w-full text-sm sm:text-base h-10 px-3"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
          />
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
          <div className="bg-white border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700">
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
                    setCurrentPage(1); // Reset halaman ke 1 saat entries per page berubah
                  }}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset halaman ke 1 saat searchTerm berubah
                  }}
                  className="w-48 text-sm h-8 px-2 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
                />
              </div>
            </div>

            {/* Table */}
            <Table>
              <TableHeader>
                <TableRow className='border-b-1 dark:border-gray-700 text-sm'>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">
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
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100 py-3">
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
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100 py-3">
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
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100 w-20 py-3">
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
                  displayedHeaders.map((header, index) => (
                    <TableRow key={`header-${index}-${header.header}`}>
                      <TableCell className="text-gray-900 dark:text-gray-400 px-3 py-3 text-sm">
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
                          index + 1
                        )}
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-gray-400 py-3 text-sm">
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
                      <TableCell className="text-gray-900 dark:text-gray-400 py-3 text-sm">
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
                          onClick={() => removeEmailHeader(indexOfFirstEntry + index)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 p-1"
                        >
                          <FaTrashAlt/>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Table Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
              <div>
                Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredHeaders.length)} of {filteredHeaders.length} entries
              </div>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-400"
                >
                  <GrFormPrevious/>
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "primary" : "outline"}
                    size="sm"
                    onClick={() => paginate(i + 1)}
                    className={`
                      ${currentPage === i + 1 ? 'bg-blue-500 text-white hover:bg-blue-600' : 'dark:border-gray-600 dark:text-gray-400'}
                      px-3 py-1 rounded
                    `}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-400"
                >
                  <MdOutlineNavigateNext/>
                </Button>
              </div>
            </div>
          </div>

          {/* Send Test Email Button */}
          <div className="mt-6">
            <Button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 flex items-center gap-2">
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
    );
  }
);

export default UpdateSendingProfileModalForm;