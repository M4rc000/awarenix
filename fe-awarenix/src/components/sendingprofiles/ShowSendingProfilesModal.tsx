import { Fragment } from 'react'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition,
} from '@headlessui/react'
import ShowSendingProfileModalForm from './ShowSendingProfilesModalForm'

type SendingProfile = {
  id: number;
  name: string;
	interfaceType: string;
	smtpFrom     : string;
	username     : string;
	password     : string;
	host         : string;
	CreatedAt    : string;
	CreatedBy    : number;
	CreatedByName    : string;
	UpdatedAt    : string;
	UpdatedBy    : number; 
	UpdatedByName    : string; 
  senderAddress: string;
	EmailHeaders : string;
}

export type ShowEmailTemplateDetailModalProps = {
  isOpen: boolean
  onClose: () => void
  sendingProfile: SendingProfile | null;
}

export default function ShowSendingProfileDetailModal({
  isOpen,
  onClose,
  sendingProfile,
}: ShowEmailTemplateDetailModalProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog open={isOpen} onClose={()=>{}} className="relative z-[999]">
        {/* Backdrop with fade animation */}
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <DialogBackdrop className="fixed inset-0 bg-black/40 backdrop-filter backdrop-blur-xs"/>
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          {/* Panel with scale & slide-up animation */}
          <Transition.Child
            as={Fragment}
            enter="transition-transform duration-300 ease-out"
            enterFrom="translate-y-4 opacity-0 scale-95"
            enterTo="translate-y-0 opacity-100 scale-100"
            leave="transition-transform duration-200 ease-in"
            leaveFrom="translate-y-0 opacity-100 scale-100"
            leaveTo="translate-y-4 opacity-0 scale-95"
          >
            <DialogPanel className="w-full xl:max-w-fit box-border rounded-lg bg-white dark:bg-gray-900 shadow-xl overflow-hidden dark:border dark:border-gray-700 flex flex-col max-h-[90vh] xl:mt-5 z-[9999999999999]">
              
              {/* HEADER */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-b-gray-300 dark:border-b-gray-800 flex-shrink-0">
                <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Detail Sending Profiles
                </DialogTitle>
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* BODY */}
              <div className="px-6 py-4 overflow-y-auto flex-1">
                <ShowSendingProfileModalForm sendingProfile={sendingProfile!}/>
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-200 dark:text-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
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