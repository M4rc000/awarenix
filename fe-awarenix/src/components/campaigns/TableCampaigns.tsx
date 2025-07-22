import { useState, useMemo, useDeferredValue, useRef, useEffect, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  getSortedRowModel
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { IoIosSave } from "react-icons/io";
import { HiOutlineMail } from "react-icons/hi";
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { FaRegTrashAlt } from "react-icons/fa";
import { BiSolidEditAlt } from "react-icons/bi";
import { HiOutlineMailOpen } from "react-icons/hi";
import { LuMousePointerClick } from "react-icons/lu";
import { BiError } from "react-icons/bi";
import { FaCircleInfo } from "react-icons/fa6";
import Button from "../ui/button/Button";
import type { SortingState } from '@tanstack/react-table';
import { useSidebar } from "../../context/SidebarContext";
import ShowCampaignModal from "../../components/campaigns/ShowCampaignModal";
import UpdateCampaignModal from "../../components/campaigns/UpdateCampaignModal";
import DeleteCampaignModal from "../../components/campaigns/DeleteCampaignModal";

export interface Campaign {
  id: number;
  name: string;
  launch_date: Date;
  send_email_by: Date;
  group_id: number;
  email_template_id: number;
  landing_page_id: number;
  sending_profile_id: number;
  url: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  status: string;
  completed_date?: string | null;
  email_sent: number;
  email_opened: number;
  clicks: number;
  submitted: number;
  reported: number;
  groupName: string, 
  emailTemplateName: string, 
  landingPageName: string, 
  sendingProfileName: string
  createdAt: Date;
  createdByName: string;
  updatedAt: Date;
  updatedByName: string;
}

export interface FetchCampaignsParams {
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface FetchCampaignsResult<T> {
  status: string;
  message: string;
  data: T[]; 
  total: number; 
  page?: number;
  limit?: number;
}

export default function TableCampaigns({ reloadTrigger, onReload }: { reloadTrigger?: number, onReload?: () => void }){
  const [search, setSearch] = useState('');
  const { isExpanded } = useSidebar();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const deferredSearch = useDeferredValue(search);
  const inputRef = useRef<HTMLInputElement>(null);

  // State untuk menyimpan semua data kampanye yang di-fetch
  const [campaignsData, setCampaignsData] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk modal dan kampanye yang dipilih
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [activeModal, setActiveModal] = useState<'detail' | 'edit' | 'delete' | null>(null);

  // Efek untuk menangani shortcut keyboard (Ctrl+K atau Cmd+K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Fungsi untuk mengambil semua data dari API
  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL;

      const res = await fetch(`${API_URL}/campaigns/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to fetch campaigns: ${res.status}`);
      }

      const result: FetchCampaignsResult<Campaign> = await res.json();
      setCampaignsData(result.data);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fungsi untuk menangani pagination setelah delete
  const handlePaginationAfterDelete = useCallback((newDataLength: number) => {
    const { pageIndex, pageSize } = pagination;
    const newPageCount = Math.ceil(newDataLength / pageSize);
    
    // Jika halaman saat ini melebihi total halaman yang tersedia
    if (pageIndex >= newPageCount && newPageCount > 0) {
      setPagination(prev => ({
        ...prev,
        pageIndex: newPageCount - 1 // Pindah ke halaman terakhir yang tersedia
      }));
    }
  }, [pagination]);

  // Efek untuk memicu fetch data saat komponen dimuat atau reloadTrigger berubah
  useEffect(() => {
    fetchCampaigns();

    const intervalId = setInterval(() => {
      fetchCampaigns();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchCampaigns, reloadTrigger]);

  // Handler untuk membuka modal detail
  const handleDetailModal = (campaign: Campaign) =>{
    setSelectedCampaign(campaign);
    setActiveModal('detail');
  }

  // Handler untuk membuka modal edit
  const handleEditModal = (campaign: Campaign) =>{
    setSelectedCampaign(campaign);
    setActiveModal('edit');
  }

  // Handler untuk membuka modal delete
  const handleDeleteModal = (campaign: Campaign) =>{
    setSelectedCampaign(campaign);
    setActiveModal('delete');
  }

  // Handler untuk campaign yang berhasil dihapus
  const handleCampaignDeleted = useCallback(() => {
    // Hitung data baru setelah filter diterapkan
    const filteredData = campaignsData.filter(campaign => {
      if (!deferredSearch) return true;
      return campaign.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
             campaign.status.toLowerCase().includes(deferredSearch.toLowerCase());
    });
    
    const newDataLength = filteredData.length - 1; // Kurangi 1 karena data akan terhapus
    
    // Tangani pagination
    handlePaginationAfterDelete(newDataLength);
    
    // Fetch data terbaru
    fetchCampaigns();
    
    // Trigger reload callback jika ada
    if (onReload) onReload();
  }, [campaignsData, deferredSearch, handlePaginationAfterDelete, fetchCampaigns, onReload]);

  // Definisi kolom tabel menggunakan useMemo untuk optimasi
  const columns = useMemo<ColumnDef<Campaign>[]>(
    () => [
      {
        accessorKey: 'id',
        header: '#',
        cell: info => info.row.index + 1 + (pagination.pageIndex * pagination.pageSize),
      },
      {
        accessorKey: 'name',
        header: 'Campaign Name',
      },
      {
        accessorKey: 'launch_date',
        header: 'Schedule',
        cell: ({ getValue }) => {
          const raw = getValue();
          if (!raw || (typeof raw !== 'string' && typeof raw !== 'number' && !(raw instanceof Date))) return '-';

          const date = new Date(raw);
          if (isNaN(date.getTime())) return '-';
          
          return date.toLocaleString('en-US', {
            timeZone: 'Asia/Jakarta',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }).replace(' pukul ', ' ');
        }
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: () => "Phishing",
      },
      {
        accessorKey: 'email_sent',
        header: () => <HiOutlineMail className="text-xl text-green-600" />,
        cell: info => info.getValue() 
      },
      {
        accessorKey: 'email_opened',
        header: () => <HiOutlineMailOpen className="text-xl text-yellow-600" />,
        cell: info => info.getValue() 
      },
      {
        accessorKey: 'email_clicks',
        header: () => <LuMousePointerClick className="text-xl text-blue-600" />,
        cell: info => info.getValue() 
      },
      {
        accessorKey: 'email_reported',
        header: () => <BiError className="text-xl text-red-600" />,
        cell: info => info.getValue() 
      },
      {
        accessorKey: 'email_submitted',
        header: () => <IoIosSave className="text-xl text-cyan-600" />,
        cell: info => info.getValue() 
      },
      {
        accessorKey: 'status',
        header: 'Status',
      },
      {
        id: 'actions',
        accessorKey: 'actions',
        header: 'Action',
        cell: (row) => (
          <div className="flex items-center space-x-2">
            <Button size="xs" variant="info" onClick={() => { handleDetailModal(row.row.original) }}>
              <FaCircleInfo />
            </Button>
            <Button size="xs" variant="warning" onClick={() => { handleEditModal(row.row.original) }}>
              <BiSolidEditAlt />
            </Button>
            <Button size="xs" variant="danger" onClick={() => { handleDeleteModal(row.row.original) }}>
              <FaRegTrashAlt />
            </Button>
          </div>
        ),
      },
    ],
    [pagination]
  );

  // Inisialisasi React Table
  const table = useReactTable({
    data: campaignsData,
    columns,
    state: {
      globalFilter: deferredSearch,
      pagination: pagination,
      sorting: sorting,
    },
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
  });

  return (
    <div className="overflow-hidden rounded-xl bg-white dark:bg-white/[0.03] border-1 border-gray-300 dark:border-gray-800 box-border mx-4 xl:max-w-[900px]">
      <div className="p-4 rounded-lg bg-white dark:bg-white/[0.03]">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative">
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-sm text-gray-600">Show</span>
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:text-gray-600 text-gray-700"
                >
                  {[5, 10, 20, 50, 100].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-600">entries</span>
              </div>
            </div>
            {/* SEARCH BAR */}
            <div className={`relative ${isExpanded ? 'xl:mx-24' : 'xl:mx-30'}`}>
              <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2">
                <svg
                  className="fill-gray-500 dark:fill-gray-400"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                    fill=""
                  />
                </svg>
              </span>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search or type command..."
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="absolute right-2.5 xl:px-3 xl:w-12 xl:left-92 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
                <span className='text-center'> ⌘ </span>
                <span> K </span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="max-w-full overflow-x-auto xl:overflow-x-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  const isSorted = header.column.getIsSorted();
                  const canSort = header.column.getCanSort();

                  return (
                    <TableCell
                      key={header.id}
                      isHeader
                      className="
                        relative
                        px-5 py-3 pr-6
                        text-center text-gray-500 text-sm
                        cursor-pointer select-none
                      "
                    >
                      <div
                        onClick={header.column.getToggleSortingHandler()}>
                        {flexRender(header.column.columnDef.header, header.getContext())}

                        {canSort && (
                          <div className="mt-1 w-1 text-xs">
                            <span
                              className={`
                                ${isSorted === "asc"
                                  ? "text-gray-800"
                                  : "text-gray-300"}
                              `}
                            >
                              ▲
                            </span>
                            <span
                              className={`mr-22
                                ${isSorted === "desc"
                                  ? "text-gray-800"
                                  : "text-gray-300"
                                }`}
                            >
                              ▼
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="relative h-[40px]">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 italic">
                    <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                    </svg>
                  </div>
                </td>
              </tr>
            ) : error ? (
                <tr>
                    <td colSpan={columns.length} className="relative h-[40px]">
                        <div className="absolute inset-0 flex items-center justify-center text-red-500 italic">
                            Error: {error}
                        </div>
                    </td>
                </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="relative h-[40px]">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 italic">
                    No data available
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="px-5 py-3 text-sm text-gray-600 text-center">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between p-4 text-gray-600 dark:text-gray-500 text-sm">
        <div>
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
          {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)}{' '}
          of {table.getFilteredRowModel().rows.length} entries
        </div>
        <div className="space-x-2">
          <div>
            <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md shadow-xs">
              <a
                href="#"
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 dark:ring-gray-700 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0${!table.getCanPreviousPage() ? ' opacity-50 pointer-events-none cursor-not-allowed' : ''}`}
                onClick={e => {
                  e.preventDefault();
                  if (table.getCanPreviousPage()) table.previousPage();
                }}
                aria-disabled={!table.getCanPreviousPage()}
                tabIndex={!table.getCanPreviousPage() ? -1 : 0}>
                <span className="sr-only">Previous</span>
                <ChevronLeftIcon aria-hidden="true" className="size-5" color='grey' />
              </a>

              {/* Page Numbers */}
              {Array.from({ length: table.getPageCount() }, (_, i) => i).map((page) => {
                const currentPage = table.getState().pagination.pageIndex;
                const totalPage = table.getPageCount();

                if (
                  page === 0 ||
                  page === totalPage - 1 ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <a
                      key={page}
                      onClick={() => table.setPageIndex(page)}
                      href="#"
                      aria-current="page"
                      className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-regular focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-grey-400 ${
                        currentPage === page
                          ? 'z-10 bg-blue-600 text-white focus:outline-blue-600 ring-gray-300 dark:ring-gray-700 border-1 border-gray-400 dark:border-gray-700'
                          : 'text-gray-600 ring-gray-300 hover:bg-gray-50 dark:text-gray-400 dark:ring-gray-700 border-1 border-gray-300 dark:border-gray-700'
                      }`}
                    >
                      {page + 1}
                    </a>
                  );
                }

                if (
                  (page === currentPage - 2 && currentPage > 1) ||
                  (page === currentPage + 2 && currentPage < totalPage - 2)
                ) {
                  return (
                    <span
                      key={page}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-regular text-gray-700 ring-1 ring-gray-300 dark:ring-gray-700"
                    >
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <a
                onClick={e => {
                  e.preventDefault();
                  if (table.getCanNextPage()) table.nextPage();
                }}
                aria-disabled={!table.getCanNextPage()}
                href="#"
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-300 ring-1 ring-gray-300 dark:ring-gray-700 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">Next</span>
                <ChevronRightIcon aria-hidden="true" className="size-5" color='grey' />
              </a>
            </nav>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <ShowCampaignModal
        isOpen={activeModal === 'detail'}
        onClose={() => {
          setActiveModal(null);
          setSelectedCampaign(null);
        }}
        campaign={selectedCampaign}
      />

      <UpdateCampaignModal
        isOpen={activeModal === 'edit'}
        onClose={() => {
          setActiveModal(null);
          setSelectedCampaign(null);
          fetchCampaigns();
          if (onReload) onReload();
        }}
        onUpdateSuccess={() => {
          if (onReload) onReload();
          fetchCampaigns()
        }}
        campaign={selectedCampaign}
      />

      <DeleteCampaignModal
        isOpen={activeModal === 'delete'}
        onClose={() => {
          setActiveModal(null);
          setSelectedCampaign(null);
        }}
        campaign={selectedCampaign}
        onCampaignDeleted={handleCampaignDeleted}
      />
    </div>
  );
}