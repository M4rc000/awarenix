
import { useState, useEffect } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { MdOutlineNavigateNext } from "react-icons/md";
import { GrFormPrevious } from "react-icons/gr";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Swal from "../utils/AlertContainer";
import { formatUserDate } from "../utils/DateFormatter";

type EmailHeader = {
  id: number;
  sendingProfileId: number;
  header: string;
  value: string;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
};

type SendingProfile = {
  id: number;
  name: string;
  interfaceType: string;
  smtpFrom: string;
  username: string;
  host: string;
  createdAt    : string;
	createdBy    : number;
	createdByName    : string;
	updatedAt    : string;
	updatedBy    : number; 
	updatedByName    : string; 
  senderAddress: string;
	EmailHeaders : string;
};

type ShowSendingProfileDetailModalFormProps = {
  sendingProfile: SendingProfile;
};

const ShowSendingProfileModalForm = ({
  sendingProfile,
}: ShowSendingProfileDetailModalFormProps) => {
  const [emailHeaders, setEmailHeaders] = useState<EmailHeader[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [isLoadingHeaders, setIsLoadingHeaders] = useState(false);

  // Fungsi untuk mengambil email headers
  const fetchEmailHeaders = async (profileId: number) => {
    setIsLoadingHeaders(true);
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token'); 
    
    try {
      const response = await fetch(`${API_URL}/sending-profile/email-header/${profileId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch email headers:", errorData);
        Swal.fire({
          icon: 'error',
          text: errorData.message || 'Failed to load email headers!',
          duration: 3000,
        });
        setEmailHeaders([]);
        return;
      }

      const result = await response.json();
      if (result.status === 'success' && Array.isArray(result.data)) {
        setEmailHeaders(result.data);
      } else {
        console.warn("Unexpected response format for email headers:", result);
        setEmailHeaders([]);
      }
    } catch (error) {
      console.error("Error fetching email headers:", error);
      Swal.fire({
        icon: 'error',
        text: `Error fetching email headers: ${error instanceof Error ? error.message : String(error)}`,
        duration: 3000,
      });
      setEmailHeaders([]);
    } finally {
      setIsLoadingHeaders(false);
    }
  };

  // useEffect untuk memanggil fetchEmailHeaders saat sendingProfile.id berubah
  useEffect(() => {
    if (sendingProfile && sendingProfile.id) {
      fetchEmailHeaders(sendingProfile.id);
    } else {
      setEmailHeaders([]); // Kosongkan jika tidak ada sendingProfile atau ID
    }
  }, [sendingProfile]); // Jalankan ulang jika sendingProfile berubah

  // Filter headers based on search term
  const filteredHeaders = emailHeaders.filter(
    (header) =>
      header.header.toLowerCase().includes(searchTerm.toLowerCase()) ||
      header.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredHeaders.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );

  const totalPages = Math.ceil(filteredHeaders.length / entriesPerPage);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  if(!sendingProfile) return null;
  return (
    <div className="space-y-6 max-w-4xl mx-auto bg-white dark:bg-gray-900">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Profile Name */}
        <div>
          <Label>Profile Name</Label>
          <Input
            type="text"
            className="w-full text-sm sm:text-base h-10 px-3"
            value={sendingProfile.name}
            readonly
          />
        </div>

        {/* Interface Type */}
        <div>
          <Label>Interface Type</Label>
          <Input
            type="text"
            className="w-full text-sm sm:text-base h-10 px-3"
            value={sendingProfile.interfaceType}
            readonly
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* SMTP FROM */}
        <div>
          <Label>SMTP From</Label>
          <Input
            type="text"
            className="w-full text-sm sm:text-base h-10 px-3"
            value={sendingProfile.smtpFrom}
            readonly
          />
        </div>

        {/* Host */}
        <div>
          <Label>Host</Label>
          <Input
            type="text"
            className="w-full text-sm sm:text-base h-10 px-3"
            value={sendingProfile.host}
            readonly
          />
        </div>

        {/* Username */}
        <div>
          <Label>Username</Label>
          <Input
            placeholder="username"
            type="text"
            className="w-full text-sm sm:text-base h-10 px-3"
            value={sendingProfile.username}
            readonly
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
        <div>
          <Label>Created At</Label>
          <Input
            type="text"
            className="w-full text-sm sm:text-base h-10 px-3"
            value={formatUserDate(sendingProfile.createdAt)}
            readonly
          />
        </div>
        <div>
          <Label>Created By</Label>
          <Input
            type="text"
            className="w-full text-sm sm:text-base h-10 px-3"
            value={sendingProfile.createdByName}
            readonly
          />
        </div>
        <div>
          <Label>Updated At</Label>
          <Input
            type="text"
            className="w-full text-sm sm:text-base h-10 px-3"
            value={formatUserDate(sendingProfile.updatedAt)}
            readonly
          />
        </div>
        <div>
          <Label>Updated By</Label>
          <Input
            type="text"
            className="w-full text-sm sm:text-base h-10 px-3"
            value={sendingProfile.updatedByName}
            readonly
          />
        </div>
      </div>

      {/* Email Headers Section */}
      <div className="border-t dark:border-gray-700 pt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Email Headers:
        </h3>

        {/* Headers Table */}
        <div className="bg-white border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700 px-2">
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
                  setCurrentPage(1); // Reset ke halaman pertama saat entries per page berubah
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
                  setCurrentPage(1); // Reset ke halaman pertama saat search term berubah
                }}
                className="w-48 text-sm h-8 px-2 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
              />
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow className="border-b-1 dark:border-gray-700">
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
                <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                  <div className="flex items-center mx-3 py-2">
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
                <TableCell className="font-medium text-gray-900 dark:text-gray-100">
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingHeaders ? (
                <TableRow>
                  <td className="text-center py-8 text-gray-500 dark:text-gray-400" colSpan={3}>
                    Loading email headers...
                  </td>
                </TableRow>
              ) : currentEntries.length === 0 ? (
                <TableRow>
                  <td className="text-center py-8 text-gray-500 dark:text-gray-400" colSpan={3}>
                    {searchTerm
                      ? `No results found for "${searchTerm}"`
                      : "No data available in table"}
                  </td>
                </TableRow>
              ) : (
                currentEntries.map((header, index) => {
                  return (
                    <TableRow key={`${header.id || index}-${header.header}`}> {/* Gunakan id jika ada, fallback ke index */}
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
                          index + 1
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
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Table Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
            <div>
              Showing {filteredHeaders.length > 0 ? indexOfFirstEntry + 1 : 0} to{" "}
              {Math.min(indexOfLastEntry, filteredHeaders.length)} of{" "}
              {filteredHeaders.length} entries
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-400"
              >
                <GrFormPrevious />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
                className="disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-400"
              >
                <MdOutlineNavigateNext />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowSendingProfileModalForm;