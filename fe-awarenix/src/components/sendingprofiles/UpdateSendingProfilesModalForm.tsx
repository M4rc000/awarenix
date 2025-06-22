import { useState } from "react";

interface LabelProps {
  children: React.ReactNode;
}

const Label = ({ children }: LabelProps) => (
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{children}</label>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string; 
}

const Input = ({ className, ...props }: InputProps) => (
  <input 
    className={`border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 ${className}`}
    {...props}
  />
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

const Button = ({ children, variant = "default", size = "default", className = "", ...props }: ButtonProps) => {
  const baseClasses = "font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500"
  };
  const sizeClasses = {
    default: "px-4 py-2 text-sm",
    sm: "px-3 py-1.5 text-xs",
    lg: "px-6 py-3 text-base"
  };
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

const Table = ({ children, className = "" }: TableProps) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      {children}
    </table>
  </div>
);

interface TableHeaderProps {
  children: React.ReactNode;
}

const TableHeader = ({ children }: TableHeaderProps) => (
  <thead className="bg-gray-50 dark:bg-gray-800">
    {children}
  </thead>
);

interface TableBodyProps {
  children: React.ReactNode;
}

const TableBody = ({ children }: TableBodyProps) => (
  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
    {children}
  </tbody>
);

interface TableRowProps {
  children: React.ReactNode;
}

const TableRow = ({ children }: TableRowProps) => (
  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
    {children}
  </tr>
);

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

const TableCell = ({ children, className = "" }: TableCellProps) => ( 
  <td className={`px-6 py-4 whitespace-nowrap text-sm ${className}`}>
    {children}
  </td>
);

const FaRegTrashAlt = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export default function UpdateSendingProfilesModalForm() {
  type EmailHeader = { header: string; value: string };

  const [emailHeaders, setEmailHeaders] = useState<EmailHeader[]>([]);
  const [newHeader, setNewHeader] = useState("");
  const [newValue, setNewValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const addEmailHeader = () => {
    if (newHeader.trim() && newValue.trim()) {
      setEmailHeaders([...emailHeaders, { header: newHeader.trim(), value: newValue.trim() }]);
      setNewHeader("");
      setNewValue("");
    }
  };

  const removeEmailHeader = (index: number) => {
    setEmailHeaders(prev => prev.filter((_, i) => i !== index));
  };

  // Filter headers based on search term
  const filteredHeaders = emailHeaders.filter(header => 
    header.header.toLowerCase().includes(searchTerm.toLowerCase()) ||
    header.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const displayedHeaders = filteredHeaders.slice(0, entriesPerPage);

  return (
    <div className="space-y-6 max-w-4xl mx-auto bg-white dark:bg-gray-900">
      {/* Profile Name */}
      <div>
        <Label>Profile Name</Label>
        <Input
          placeholder="Team A"
          type="text"
          className="w-full text-sm sm:text-base h-10 px-3"
        />
      </div>

      {/* Interface Type */}
      <div>
        <Label>Interface Type</Label>
        <Input
          placeholder="SMTP"
          type="text"
          className="w-full text-sm sm:text-base h-10 px-3"
        />
      </div>

      {/* SMTP FROM */}
      <div>
        <Label>SMTP From</Label>
        <Input
          placeholder="First Last example@gmail.com"
          type="text"
          className="w-full text-sm sm:text-base h-10 px-3"
        />
      </div>

      {/* Host */}
      <div>
        <Label>Host</Label>
        <Input
          placeholder="smtp.example.com"
          type="text"
          className="w-full text-sm sm:text-base h-10 px-3"
        />
      </div>
      
      {/* Username */}
      <div>
        <Label>Username</Label>
        <Input
          placeholder="username"
          type="text"
          className="w-full text-sm sm:text-base h-10 px-3"
        />
      </div>

      {/* Password */}
      <div>
        <Label>Password</Label>
        <Input
          placeholder="******"
          type="password"
          className="w-full text-sm sm:text-base h-10 px-3"
        />
      </div>

      {/* Email Headers Section */}
      <div className="border-t dark:border-gray-700 pt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Email Headers:</h3>
        
        {/* Add Custom Header Form */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Input
            placeholder="X-Custom-Header"
            value={newHeader}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewHeader(e.target.value)}
            className="flex-1 text-sm h-10 px-3"
          />
          <Input
            placeholder="{{.URL}}-gophish"
            value={newValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewValue(e.target.value)}
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
              <span className="text-sm text-gray-600 dark:text-gray-400">Show</span>
              <select 
                className="border border-gray-300 rounded px-2 py-1 text-sm dark:text-gray-400 dark:bg-gray-800 dark:border-gray-600"
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600 dark:text-gray-400">entries</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Search:</span>
              <Input
                placeholder="Search headers..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-48 text-sm h-8 px-2 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
              />
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                  <div className="flex items-center">
                    Header
                    <svg className="w-3 h-3 ml-1 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M6 3l3 3H3l3-3z"/>
                    </svg>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                  <div className="flex items-center">
                    Value
                    <svg className="w-3 h-3 ml-1 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M6 9L3 6h6l-3 3z"/>
                    </svg>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-gray-900 dark:text-gray-100 w-20">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedHeaders.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {searchTerm ? `No results found for "${searchTerm}"` : "No data available in table"}
                  </TableCell>
                </TableRow>
              ) : (
                displayedHeaders.map((header, index) => {
                  // Find the original index for deletion
                  const originalIndex = emailHeaders.findIndex(h => h.header === header.header && h.value === header.value);
                  return (
                    <TableRow key={`${header.header}-${index}`}>
                      <TableCell className="text-gray-900 dark:text-gray-100">
                        {searchTerm ? (
                          <span dangerouslySetInnerHTML={{
                            __html: header.header.replace(
                              new RegExp(`(${searchTerm})`, 'gi'),
                              '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>'
                            )
                          }} />
                        ) : (
                          header.header
                        )}
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-gray-100">
                        {searchTerm ? (
                          <span dangerouslySetInnerHTML={{
                            __html: header.value.replace(
                              new RegExp(`(${searchTerm})`, 'gi'),
                              '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>'
                            )
                          }} />
                        ) : (
                          header.value
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEmailHeader(originalIndex)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 p-1"
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
              Showing 0 to 0 of {emailHeaders.length} entries
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <Button 
                variant="outline" 
                size="sm"
                disabled={true}
                className="disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-400"
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={true}
                className="disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-400"
              >
                Next
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