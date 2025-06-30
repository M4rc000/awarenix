import { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import Label from "../form/Label";
import Input from "../form/input/InputField";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Button from "../ui/button/Button";
import Swal from '../utils/AlertContainer';

type Group = {
  id: number;
  name: string;
  domainStatus: string;
  memberCount: number;
  createdAt: string; 
  createdBy: number; 
  createdByName: string; 
  updatedAt: string; 
  updatedBy: number; 
  updatedByName: string; 
};

type Member = {
  id: number;
  name: string;
  email: string;
  position: string;
  company: string;
  country: string;
  createdAt: string;
  updatedAt: string;
};

export type ShowGroupDetailModalFormProps = {
  group: Group | null;
};

export default function ShowGroupDetailModalForm({ group }: ShowGroupDetailModalFormProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [groupName, setGroupName] = useState("");
  const [domainStatus, setDomainStatus] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const highlightText = (text: string | number | null | undefined, searchTerm: string) => {
    const textString = String(text ?? ''); // Konversi ke string kosong jika null/undefined
    if (!searchTerm || textString.length === 0) return textString;

    return (
      <span
        dangerouslySetInnerHTML={{
          __html: textString.replace( // Panggil replace pada textString
            new RegExp(`(${searchTerm})`, "gi"),
            '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>'
          ),
        }}
      />
    );
  };

  // GET MEMBER BY GROUP ID
  const fetchGroupDetailsAndMembers = async (groupId: number) => {
    setIsLoadingMembers(true);
    try {
      const res = await fetch(`${API_URL}/groups/${groupId}`, {
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = `Failed to load group detail. Status: ${res.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.warn("Response json is not valid:", e);
        }
        throw new Error(errorMessage);
      }

      const result = await res.json();

      if (result.Data) {
        setGroupName(result.Data.name || '');
        setDomainStatus(result.Data.domainStatus || '');
        setCreatedAt(result.Data.createdAt || '');
        setUpdatedAt(result.Data.updatedAt || '');
        setMembers(result.Data.members || []); 
      } else {
        setGroupName("");
        setDomainStatus("");
        setCreatedAt("");
        setUpdatedAt("");
        setMembers([]);

        Swal.fire({
          text: 'Group Data is not found.',
          duration: 2000,
          icon: "info"
        });
      }
    } catch (err) {
      console.error('Error fetching group details and members:', err);
      Swal.fire({
        text: 'An occured when load detail group and members.',
        duration: 2000,
        icon: "error"
      });
      setMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (group && group.id) { 
      fetchGroupDetailsAndMembers(group.id);
      setPagination({ pageIndex: 0, pageSize: 10 }); // Reset pagination
      setSearchTerm(""); // Reset search term
    } else {
      setGroupName("");
      setDomainStatus("");
      setCreatedAt("");
      setUpdatedAt("");
      setMembers([]);
      setPagination({ pageIndex: 0, pageSize: 10 });
      setSearchTerm("");
    }
  }, [group]); 

  const columns = useMemo<ColumnDef<Member>[]>(
    () => [
      {
        accessorKey: 'id',
        header: '#',
        cell: info => info.row.index + 1 + (info.table.getState().pagination.pageIndex * info.table.getState().pagination.pageSize),
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: info => highlightText(info.getValue() as string | number | null | undefined, searchTerm),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: info => highlightText(info.getValue() as string | number | null | undefined, searchTerm),
      },
      {
        accessorKey: 'position',
        header: 'Position',
        cell: info => highlightText(info.getValue() as string | number | null | undefined, searchTerm),
      },
      {
        accessorKey: 'company',
        header: 'Company',
        cell: info => highlightText(info.getValue() as string | number | null | undefined, searchTerm),
      },
      {
        accessorKey: 'Country',
        header: 'Country',
        cell: info => highlightText(info.getValue() as string | number | null | undefined, searchTerm),
      },
    ],
    [searchTerm]
  );
 
  const table = useReactTable({
    data: members,
    columns,
    state: {
      globalFilter: searchTerm,
      pagination: pagination,
    },
    onGlobalFilterChange: setSearchTerm,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
  });

  return (
    <div className="space-y-6">
      {/* Detail Group Section (Readonly) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="group-name" className="text-sm font-medium">
            Nama Grup
          </Label>
          <Input
            id="group-name"
            type="text"
            value={groupName}
            className="w-full mt-1"
            readonly
          />
        </div>
        <div>
          <Label htmlFor="domain-status" className="text-sm font-medium">
            Status Domain
          </Label>
          <Input
            id="domain-status"
            type="text"
            value={domainStatus}
            className="w-full mt-1"
            readonly
          />
        </div>
        <div>
          <Label htmlFor="created-at" className="text-sm font-medium">
            Created At
          </Label>
          <Input
            id="created-at"
            type="text"
            value={
              createdAt
                ? new Date(createdAt).toLocaleDateString('en-GB', {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                  timeZoneName: 'short',  
                  })
                : ''
            }
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
            value={group?.createdByName || ''}
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
            value={
              updatedAt
                ? new Date(updatedAt).toLocaleDateString('en-GB', {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                  timeZoneName: 'short',  
                  })
                : ''
            }
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
            value={group?.updatedByName || ''}
            className="w-full mt-1"
            readonly
          />
        </div>
      </div>

      {/* Members Table Section */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
        {/* Table Header with Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3 sm:mb-0">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Show
            </span>
            <select
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
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
              Search
            </span>
            <Input
              placeholder="Search member..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-56"
            />
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className="bg-gray-50 dark:bg-gray-800">
                {headerGroup.headers.map(header => (
                  <TableCell
                    key={header.id}
                    className="font-semibold text-gray-900 dark:text-gray-100 py-3 text-center border border-gray-200 dark:border-gray-700"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoadingMembers ? (
              <tr>
                <td colSpan={columns.length} className="relative h-[40px]">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 italic">
                    <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                    </svg>
                    Loading member...
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  <div className="flex flex-col items-center justify-center h-[70px] w-full text-gray-900 dark:text-gray-500 italic font-medium rounded-md mx-auto my-2">
                    {searchTerm
                      ? `There are no matching members "${searchTerm}"`
                      : "There are no members in this group."}
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={`text-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900`}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      className="text-gray-900 dark:text-gray-100 py-3 px-2 border border-gray-200 dark:border-gray-700"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Table Footer */}
        {table.getRowModel().rows.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-0">
              Showing{" "}
              <span className="font-medium">
                {table.getRowModel().rows.length > 0 ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1 : 0}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}
              </span>{" "}
              from{" "}
              <span className="font-medium">{table.getFilteredRowModel().rows.length}</span>{" "}
              entries
              {table.getFilteredRowModel().rows.length !== members.length && ( // Gunakan 'members.length'
                <span className="text-gray-500">
                  {" "}
                  (difilter dari {members.length} total)
                </span>
              )}
            </div>

            {/* Pagination controls */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
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
}