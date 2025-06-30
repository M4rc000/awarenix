import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { FaRegTrashAlt } from "react-icons/fa";
import Button from "../ui/button/Button";
import { BsFillPersonPlusFill } from "react-icons/bs";
import LabelWithTooltip from "../ui/tooltip/Tooltip";
import Swal from "../utils/AlertContainer";

type Group = {
  id: number;
  name: string;
  domainStatus: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  members?: User[];
};

type User = {
  id: number;
  name: string;
  email: string;
  position: string;
  company: string;
  country: string;
};

export type EditGroupModalFormRef = {
  submitGroups: () => Promise<boolean>;
};

type EditGroupModalFormProps = {
  group: Group | null;
  onSuccess?: () => void;
};

const EditGroupModalForm = forwardRef<EditGroupModalFormRef, EditGroupModalFormProps>(({ group, onSuccess }, ref) => {
  const [currentGroupName, setCurrentGroupName] = useState<Group>(
    group || { id: 0, name: "", domainStatus: "active", memberCount: 0, createdAt: "", updatedAt: "", members: [] }
  );

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (group) {
      setCurrentGroupName(group);
      // Saat menginisialisasi members, pastikan mereka memiliki ID yang unik untuk React key
      // Jika members dari backend tidak memiliki ID, Anda mungkin perlu menggenerasi UUID di sini.
      // Namun, jika backend mengembalikan ID untuk setiap member, gunakan itu.
      setUsers(group.members || []);
    } else {
        // Jika group null (misal untuk form create baru), reset states
        setCurrentGroupName({ id: 0, name: "", domainStatus: "active", memberCount: 0, createdAt: "", updatedAt: "", members: [] });
        setUsers([]);
    }
  }, [group]);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    position: "",
    company: "",
    country: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addUser = () => {
    const { name, email, position, company, country } = newUser;
    if (!name.trim() || !email.trim() || !position.trim()) {
      Swal.fire({
        icon: 'error',
        text: "Name, Email, and Position are required for a new member.",
        duration: 2000,
      });
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email.trim())) { 
      Swal.fire({
        icon: 'warning',
        text: "Please enter a valid email address.",
        duration: 2000,
      });
      return;
    }
    
    if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      Swal.fire({
        icon: 'warning',
        text: "Member with this email is already added to the list.",
        duration: 2000,
      });
      return;
    }
    
    // Generate a temporary client-side ID.
    // In a real app, if editing existing members, the backend should provide real IDs.
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

    setUsers(prev => [...prev, {
      id: newId,
      name: name.trim(),
      email: email.trim(),
      position: position.trim(),
      company: company.trim(),
      country: country.trim(),
    }]);
    
    setNewUser({ name: "", email: "", position: "", company: "", country: "" });
  };

  const removeUser = (id: number) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  // --- Fungsi baru untuk mengedit anggota yang ada di tabel ---
  const handleUserChange = (id: number, field: keyof User, value: string) => {
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(user =>
        user.id === id ? { ...user, [field]: value } : user
      );

      // Optional: Real-time duplicate email check for edited users
      if (field === 'email') {
        const editedUser = updatedUsers.find(u => u.id === id);
        if (editedUser && updatedUsers.some(u => u.id !== id && u.email.toLowerCase() === editedUser.email.toLowerCase())) {
          Swal.fire({
            icon: 'error',
            text: "Another member in the list already has this email.",
            duration: 2000,
          });
        }
      }
      return updatedUsers;
    });
  };

  // Fungsi lama untuk input `newUser` (tetap relevan)
  const handleNewUserInputChange = (field: keyof typeof newUser) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewUser(prev => ({ ...prev, [field]: e.target.value }));
  };

  const filteredUsers = users.filter(user =>
    Object.values(user).some(value =>
      value !== null && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const displayedUsers = filteredUsers.slice(0, entriesPerPage);

  const isNewUserFormValid = newUser.name.trim() && newUser.email.trim() && newUser.position.trim();
  const isGroupFormValid = currentGroupName.name.trim() && users.length > 0;

  const submitGroups = async (): Promise<boolean> => {
    if (!isGroupFormValid) {
      Swal.fire({
        text: "Please provide a group name and add at least one member.",
        icon: 'warning',
        duration: 3000,
      });
      return false;
    }

    // Optional: Validate all emails in the 'users' list before submission
    const invalidEmail = users.find(u => !/\S+@\S+\.\S+/.test(u.email));
    if (invalidEmail) {
        Swal.fire({
            text: `Invalid email format for member: ${invalidEmail.email}`,
            icon: 'error',
            duration: 3000,
        });
        return false;
    }

    setIsSubmitting(true);

    const membersPayload = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      position: user.position,
      company: user.company,
      country: user.country,
    }));

    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const createdBy = userData?.id || 0;

    const payload = {
      groupName: currentGroupName.name.trim(),
      domainStatus: "active",
      members: membersPayload,
      updatedBy: createdBy
    };

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');

    if (!currentGroupName.id) {
        Swal.fire({
            text: "Group ID is missing. Cannot update group.",
            icon: 'error',
            duration: 3000,
        });
        setIsSubmitting(false);
        return false;
    }

    try {
      const response = await fetch(`${API_URL}/groups/${currentGroupName.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) { 
        if (data.status === 'success') { 
            if (onSuccess) onSuccess();
            return true;
        } else {
            const errorMessage = data.message || "Failed to update group. Unknown error from server.";
            Swal.fire({
                text: errorMessage,
                icon: 'error',
                duration: 3000,
            });
            console.error("Server responded with error:", data);
            return false;
        }
      } else { // HTTP status is not 2xx
        const errorMessage = data.message || `Server error: ${response.status} ${response.statusText}`;
        Swal.fire({
          text: errorMessage,
          icon: 'error',
          duration: 3000,
        });
        console.error("HTTP error during update:", response.status, response.statusText, data);
        return false;
      }
    } catch (error) {
      Swal.fire({
        text: "Network error. Please check your connection and try again.",
        icon: 'error',
        duration: 3000,
      });
      console.error("Error saving group:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  useImperativeHandle(ref, () => ({
    submitGroups,
  }));

  return (
    <div className="space-y-6 ">
      {/* Group Name Section */}
      <div>
        <Label htmlFor="group-name" className="text-sm font-medium">
          Group Name
        </Label>
        <Input
          id="group-name"
          placeholder="Enter group name (e.g., Development Team)"
          type="text"
          value={currentGroupName.name}
          onChange={(e) => {
            setCurrentGroupName(prev => ({ ...prev, name: e.target.value }));
          }}
          className="w-full mt-1"
          disabled={isSubmitting}
        />
      </div>

      {/* Add New User Section */}
      <div className="dark:from-gray-800 dark:to-gray-700 rounded-lg border border-blue-200 dark:border-gray-600 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <BsFillPersonPlusFill className="text-blue-600 dark:text-blue-400 w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            New Member
          </h3>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-6 md:grid-cols-3 gap-2 mb-4 mt-5">
          <div>
            <LabelWithTooltip required tooltip="Full Name of the member">
              Full Name
            </LabelWithTooltip>
            <Input
              id="user-name"
              placeholder="John Doe"
              type="text"
              value={newUser.name}
              onChange={handleNewUserInputChange('name')}
              className="w-full mt-1"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <LabelWithTooltip required tooltip="Email Address of the member">
              Email Address
            </LabelWithTooltip>
            <Input
              id="user-email"
              placeholder="john.doe@company.com"
              type="email"
              value={newUser.email}
              onChange={handleNewUserInputChange('email')}
              className="w-full mt-1"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <LabelWithTooltip required tooltip="Position of the member">
              Position
            </LabelWithTooltip>
            <Input
              id="user-position"
              placeholder="Senior Developer"
              type="text"
              value={newUser.position}
              onChange={handleNewUserInputChange('position')}
              className="w-full mt-1"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <LabelWithTooltip tooltip="Company of the member">
              Company
            </LabelWithTooltip>
            <Input
              id="user-company"
              placeholder="Google"
              type="text"
              value={newUser.company}
              onChange={handleNewUserInputChange('company')}
              className="w-full mt-1"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <LabelWithTooltip tooltip="Country of the member">
              Country
            </LabelWithTooltip>
            <Input
              id="user-country"
              placeholder="Indonesia"
              type="text"
              value={newUser.country}
              onChange={handleNewUserInputChange('country')}
              className="w-full mt-1"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Button
              onClick={addUser}
              disabled={!isNewUserFormValid || isSubmitting}
              className="mt-[30px] w-full bg-blue-600 hover:bg-blue-700 disabled:text-white disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium h-11 transition-colors duration-200"
            >
              Add Member to Group
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table Section */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
        {/* Table Header with Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3 sm:mb-0">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Show
            </span>
            <select
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              disabled={isSubmitting}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              entries
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Search:
            </span>
            <Input
              placeholder="Search member..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-56"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800">
              <TableCell className="font-semibold text-gray-900 dark:text-gray-100 py-3 px-4 text-center border border-gray-200 dark:border-gray-700">
                #
              </TableCell>
              <TableCell className="font-semibold text-gray-900 dark:text-gray-100 py-3 text-center border border-gray-200 dark:border-gray-700">
                Name
              </TableCell>
              <TableCell className="font-semibold text-gray-900 dark:text-gray-100 py-3 text-center border border-gray-200 dark:border-gray-700">
                Email
              </TableCell>
              <TableCell className="font-semibold text-gray-900 dark:text-gray-100 py-3 text-center border border-gray-200 dark:border-gray-700">
                Position
              </TableCell>
              <TableCell className="font-semibold text-gray-900 dark:text-gray-100 py-3 text-center border border-gray-200 dark:border-gray-700">
                Company
              </TableCell>
              <TableCell className="font-semibold text-gray-900 dark:text-gray-100 py-3 text-center border border-gray-200 dark:border-gray-700">
                Country
              </TableCell>
              <TableCell className="font-semibold text-gray-900 dark:text-gray-100 py-3 w-24 text-center border border-gray-200 dark:border-gray-700">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  <div className="flex flex-col items-center justify-center h-[70px] w-full text-gray-900 dark:text-gray-500 italic font-medium rounded-md mx-auto my-2">
                    {searchTerm
                      ? `No members found matching "${searchTerm}"`
                      : "No members added yet. Add your first member above."}
                  </div>
                </td>
              </tr>
            ) : (
              displayedUsers.map((user, index) => (
                <TableRow
                  key={user.id}
                  className={`text-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900`}
                >
                  <TableCell className="text-gray-900 dark:text-gray-100 py-3 border border-gray-200 dark:border-gray-700">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-gray-900 dark:text-gray-100 py-3 border border-gray-200 dark:border-gray-700">
                    <Input
                      value={user.name}
                      onChange={(e) => handleUserChange(user.id, 'name', e.target.value)}
                      disabled={isSubmitting}
                      className="w-full text-center bg-transparent border-none focus:ring-0" // Styling for table input
                    />
                  </TableCell>
                  <TableCell className="text-gray-900 dark:text-gray-100 py-3 border border-gray-200 dark:border-gray-700">
                    <Input
                      value={user.email}
                      onChange={(e) => handleUserChange(user.id, 'email', e.target.value)}
                      disabled={isSubmitting}
                      className="w-full text-center bg-transparent border-none focus:ring-0" // Styling for table input
                    />
                  </TableCell>
                  <TableCell className="text-gray-900 dark:text-gray-100 py-3 border border-gray-200 dark:border-gray-700">
                    <Input
                      value={user.position}
                      onChange={(e) => handleUserChange(user.id, 'position', e.target.value)}
                      disabled={isSubmitting}
                      className="w-full text-center bg-transparent border-none focus:ring-0" // Styling for table input
                    />
                  </TableCell>
                  <TableCell className="text-gray-900 dark:text-gray-100 py-3 border border-gray-200 dark:border-gray-700">
                    <Input
                      value={user.company}
                      onChange={(e) => handleUserChange(user.id, 'company', e.target.value)}
                      disabled={isSubmitting}
                      className="w-full text-center bg-transparent border-none focus:ring-0" // Styling for table input
                    />
                  </TableCell>
                  <TableCell className="text-gray-900 dark:text-gray-100 py-3 border border-gray-200 dark:border-gray-700">
                    <Input
                      value={user.country}
                      onChange={(e) => handleUserChange(user.id, 'country', e.target.value)}
                      disabled={isSubmitting}
                      className="w-full text-center bg-transparent border-none focus:ring-0" // Styling for table input
                    />
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeUser(user.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-800 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 p-2 rounded-md transition-colors duration-200"
                      disabled={isSubmitting}
                    >
                      <FaRegTrashAlt className="w-4 h-4 text-white" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Table Footer */}
        {displayedUsers.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-0">
              Showing{" "}
              <span className="font-medium">
                {Math.min(entriesPerPage, filteredUsers.length)}
              </span>{" "}
              of <span className="font-medium">{filteredUsers.length}</span>{" "}
              members
              {users.length !== filteredUsers.length && (
                <span className="text-gray-500">
                  {" "}
                  (filtered from {users.length} total)
                </span>
              )}
            </div>

            {/* Pagination placeholder - implement actual logic as needed */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={true}
                className="disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={true}
                className="disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
});

EditGroupModalForm.displayName = 'EditGroupModalForm';
export default EditGroupModalForm;