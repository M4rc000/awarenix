import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition,
} from '@headlessui/react'
import { Fragment, useState, useRef } from 'react'
import UpdateSendingProfilesModalForm, {UpdateSendingProfileModalFormRef} from './UpdateSendingProfilesModalForm'

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

export type UpdateSendingProfilesModalFormProps = {
  isOpen: boolean
  onClose: () => void
  onSendingProfileUpdated: () => void
  sendingProfile: SendingProfile
}

const UpdateSendingProfilesModal = (props: UpdateSendingProfilesModalFormProps) => {
  const formRef = useRef<UpdateSendingProfileModalFormRef>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi untuk menangani penyimpanan (update) data
  const handleSave = async () => {
    if (!formRef.current) return;
    
    try {
      setIsSubmitting(true);
      const success = await formRef.current.submitSendingProfile();
      console.log('Success: ', success);
      
      if (success) {
        props.onSendingProfileUpdated(); 
        props.onClose();
      }
    } catch (error) {
      console.error('Failed to update sending profile template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition show={props.isOpen} as={Fragment}>
      <Dialog open={props.isOpen} onClose={()=>{}} className="relative z-[999]">
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
            <DialogPanel className="w-full xl:max-w-fit box-border rounded-lg bg-white dark:bg-gray-900 shadow-xl overflow-hidden dark:border dark:border-gray-700 flex flex-col max-h-[90vh] xl:mt-5 z-[9999999999999]">
              
              {/* HEADER */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-b-gray-300 dark:border-b-gray-800 flex-shrink-0">
                <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Update Sending Profiles
                </DialogTitle>
                <button
                  onClick={props.onClose}
                  aria-label="Close modal"
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* BODY */}
              <div className="px-6 py-4 overflow-y-auto flex-1">
                <UpdateSendingProfilesModalForm ref={formRef} sendingProfile={props.sendingProfile}/>
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
                <button
                  onClick={props.onClose}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-200 dark:text-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {isSubmitting && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </DialogPanel>

          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}

export default UpdateSendingProfilesModal;