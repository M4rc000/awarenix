import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition,
} from '@headlessui/react'
import { Fragment } from 'react'
import ShowGroupDetailModalForm from './ShowGroupDetailModalForm'

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
  members?: Member[];
}

interface Member {
    id: number;
    name: string;
    email: string;
    position: string;
    company: string;
    country: string;
    createdAt: string;
    updatedAt: string;
}

export type ShowGroupDetailModalProps = {
  isOpen: boolean
  onClose: () => void
  group: Group | null; 
}

export default function ShowGroupDetailModal({
  isOpen,
  onClose,
  group,
}: ShowGroupDetailModalProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        open={isOpen}
        onClose={()=>{}}
        className="relative z-[999]"
      >
        {/* Backdrop dengan animasi fade */}
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <DialogBackdrop className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          {/* Panel dengan animasi scale & slide-up */}
          <Transition.Child
            as={Fragment}
            enter="transition-transform duration-300 ease-out"
            enterFrom="translate-y-4 opacity-0 scale-95"
            enterTo="translate-y-0 opacity-100 scale-100"
            leave="transition-transform duration-200 ease-in"
            leaveFrom="translate-y-0 opacity-100 scale-100"
            leaveTo="translate-y-4 opacity-0 scale-95"
          >
            <DialogPanel
              className="w-full max-w-4xl box-border rounded-lg bg-white dark:bg-gray-900 shadow-xl overflow-hidden dark:border dark:border-gray-700 flex flex-col max-h-[90vh] xl:mt-5"
              onClick={(e) => e.stopPropagation()} // Mencegah penutupan saat klik di dalam panel
            >
              {/* HEADER */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-b-gray-300 dark:border-b-gray-600 flex-shrink-0">
                <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Detail Group
                </DialogTitle>
                <button
                  onClick={onClose}
                  aria-label="Tutup modal"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              {/* BODY */}
              <div className="px-6 py-4 overflow-y-auto flex-1">
                <ShowGroupDetailModalForm group={group} />
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-200 dark:text-gray-200 rounded"
                >
                  Close
                </button>
              </div>
            </DialogPanel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}