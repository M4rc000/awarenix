import { useState, forwardRef, useImperativeHandle } from "react"; // Added forwardRef, useImperativeHandle
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
  createdAt: string;
  UpdatedAt: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  position: string;
  company: string;
  country: string;
};

// Define the ref type to expose submitGroups
export type NewGroupModalFormRef = {
  submitGroups: () => Promise<boolean>; // It should return a boolean for success/failure
  group: Group | null; // This might not be needed if group is submitted via submitGroups
};

type NewGroupModalFormProps = {
  onSuccess?: () => void;
};

// Use forwardRef to receive the ref from the parent
const NewGroupModalForm = forwardRef<NewGroupModalFormRef, NewGroupModalFormProps>(({ onSuccess }, ref) => {
  const [users, setUsers] = useState<User[]>([]);
  const [groupName, setGroupName] = useState("");
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
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const addUser = () => {
    const { name, email, position, company, country } = newUser;
    if (!name.trim() || !email.trim() || !position.trim()) {
        setSubmitMessage({ type: 'error', text: "Name, Email, and Position are required for a new member." });
        return;
    }

    // Client-side check for duplicate email in the current list before adding
    if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
        setSubmitMessage({ type: 'error', text: "Member with this email is already added to the list." });
        return;
    }

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
    setSubmitMessage(null); // Clear message on successful add
  };

  const removeUser = (id: number) => {
    setUsers(prev => prev.filter(user => user.id !== id));
    setSubmitMessage(null); // Clear message on remove
  };

  const handleInputChange = (field: keyof typeof newUser) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewUser(prev => ({ ...prev, [field]: e.target.value }));
    setSubmitMessage(null); // Clear message when typing
  };

  // The logic for filtering and displaying users remains the same
  const filteredUsers = users.filter(user =>
    Object.values(user).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const displayedUsers = filteredUsers.slice(0, entriesPerPage);

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;

    return (
      <span
        dangerouslySetInnerHTML={{
          __html: text.replace(
            new RegExp(`(${searchTerm})`, "gi"),
            '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>'
          ),
        }}
      />
    );
  };


  const isNewUserFormValid = newUser.name.trim() && newUser.email.trim() && newUser.position.trim();
  const isGroupFormValid = groupName.trim() && users.length > 0;

  // The submitGroups function, as requested, REMAINS UNTOUCHED in its core logic (API_URL, body, headers)
  const submitGroups = async (): Promise<boolean> => {
    if (!isGroupFormValid) {
        setSubmitMessage({ type: 'error', text: "Please provide a group name and add at least one member." });
        return false; // Return false on validation failure
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    // Prepare members data for the backend (remove the frontend-only 'id' field)
    const membersPayload = users.map(({ ...rest }) => ({ // Deconstruct id to exclude it
        ...rest,
        company: "", // These should be from newUser state if inputs exist, or removed if fixed on BE
        country: "", // These should be from newUser state if inputs exist, or removed if fixed on BE
    }));

    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const createdBy = userData?.id || 0;     

    const payload = {
      groupName: groupName.trim(),
      domainStatus: "Active", 
      createdBy: createdBy,
      members: membersPayload,
    };

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/groups/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (onSuccess) onSuccess();

        setGroupName("");
        setUsers([]);
        setNewUser({ name: "", email: "", position: "", company: "", country: "" });
        setSearchTerm("");
        return true;
      } else {
        Swal.fire({
          text: 'Failed to save group and members',
          icon: 'error',
          duration: 3000,
        })
        console.error("Failed to save group:", data.error || "Unknown error");
        return false; 
      }
    } catch (error) {
      setSubmitMessage({ type: 'error', text: "Network error. Please try again." });
      console.error("Error saving group:", error);
      return false; 
    } finally {
      setIsSubmitting(false);
    }
  };

  // Expose methods to parent component using useImperativeHandle
  useImperativeHandle(ref, () => ({
    submitGroups,
    group: null, // As group is not a single state, it's generated on submit. You might remove this if not used.
  }));


  return (
    <div className="space-y-6">
      {/* Group Name Section */}
      <div>
        <Label htmlFor="group-name" className="text-sm font-medium">
          Group Name
        </Label>
        <Input
          id="group-name"
          placeholder="Enter group name (e.g., Development Team)"
          type="text"
          value={groupName}
          onChange={(e) => { setGroupName(e.target.value); setSubmitMessage(null); }} 
          className="w-full mt-1"
          disabled={isSubmitting} // Disable while submitting
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
              onChange={handleInputChange('name')}
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
              onChange={handleInputChange('email')}
              className="w-full mt-1"
              disabled={isSubmitting} 
            />
          </div>
          <div>
            <LabelWithTooltip required tooltip="Position of the member"> {/* Changed to required */}
              Position
            </LabelWithTooltip>
            <Input
              id="user-position"
              placeholder="Senior Developer"
              type="text"
              value={newUser.position}
              onChange={handleInputChange('position')}
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
              onChange={handleInputChange('company')}
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
              onChange={handleInputChange('country')}
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
              disabled={isSubmitting} // Disable while submitting
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
              disabled={isSubmitting} // Disable while submitting
            />
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800">
              <TableCell className="font-semibold text-gray-900 dark:text-gray-100 py-3 text-center border border-gray-200 dark:border-gray-700">
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
                    {highlightText(user.name, searchTerm)}
                  </TableCell>
                  <TableCell className="text-gray-900 dark:text-gray-100 py-3 border border-gray-200 dark:border-gray-700">
                    {highlightText(user.email, searchTerm)}
                  </TableCell>
                  <TableCell className="text-gray-900 dark:text-gray-100 py-3 border border-gray-200 dark:border-gray-700">
                    {highlightText(user.position, searchTerm)}
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeUser(user.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-800 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 p-2 rounded-md transition-colors duration-200"
                      disabled={isSubmitting} // Disable while submitting
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

      {/* Submit and Test Email Section */}
      {submitMessage && (
        <div className={`p-3 rounded-md text-sm ${submitMessage.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'}`}>
          {submitMessage.text}
        </div>
      )}
    </div>
  );
});

NewGroupModalForm.displayName = 'NewGroupModalForm';

export default NewGroupModalForm;