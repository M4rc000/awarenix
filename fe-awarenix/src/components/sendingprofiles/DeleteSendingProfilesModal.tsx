import { useState, useRef } from 'react'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition,
} from '@headlessui/react'
import { Fragment } from 'react'
import DeleteSendingProfileModalForm, {DeleteSendingProfileModalFormRef} from './DeleteSendingProfilesModalForm'
import Swal from '../utils/AlertContainer'

type SendingProfile = {
  id: number;
  name: string;
	interfaceType: string;
	smtpFrom     : string;
	username     : string;
	password     : string;
	host         : string;
	createdAt    : string;
	createdBy    : number;
	createdByName    : string;
	updatedAt    : string;
	updatedBy    : number; 
	updatedByName    : string; 
  senderAddress: string;
	EmailHeaders : string;
}

export type DeleteSendingProfileModalProps = {
  isOpen: boolean
  onClose: () => void
  sendingProfile: SendingProfile | null
  onSuccess?: () => void
  onSendingProfileDeleted?: () => void
}

export default function DeleteSendingProfileModal({
  isOpen,
  onClose,
  sendingProfile,
  onSendingProfileDeleted,
}: DeleteSendingProfileModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string>('');
  const formRef = useRef<DeleteSendingProfileModalFormRef>(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');
  const handleDelete = async () => {
    if (!sendingProfile) return;
    
    setIsDeleting(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/sending-profile/${sendingProfile.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || data.status == 'error') {
        setError(data.message || 'Failed to delete sending profile');
        Swal.fire({
          text: 'Failed to delete sending profile',
          icon: 'error',
          duration: 2000
        });
        return;
      }
      onSendingProfileDeleted?.(); 
      onClose();         

    } catch (err) {
      setError('Unexpected error occurred');
      console.log('Error: ', err);
      
      Swal.fire({
        text: `Unexpected error occurred while deleting sending profile`,
        icon: 'error',
        duration: 2000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog open={isOpen} onClose={()=>{}} className="relative z-[999]">
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

        <div className="fixed inset-0 flex items-center justify-center p-4"  onClick={(e) => e.stopPropagation()}>
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
            <DialogPanel className="w-full max-w-fit box-border rounded-lg bg-white dark:bg-gray-900 shadow-xl overflow-hidden dark:border dark:border-gray-700 flex flex-col max-h-[90vh] xl:mt-5 z-[9999999999999]" onClick={(e) => e.stopPropagation()}>
              {/* HEADER */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-b-gray-300 dark:border-b-gray-600 flex-shrink-0">
                    <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Confirmation Delete Sending Profile ?
                    </DialogTitle>
                </div>

              {/* BODY */}
              <div className="px-6 py-4 overflow-y-auto flex-1">
                <DeleteSendingProfileModalForm
                  sendingProfile={sendingProfile!}
                  ref={formRef}
                  onDelete={handleDelete}
                  error={error}
                  isDeleting={isDeleting}
                />
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-200 dark:text-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  disabled={isDeleting}
                  onClick={async () => {
                    try {
                      const success = await formRef.current?.submitDelete();
                      
                      if (success) {
                        onClose();
                        Swal.fire({
                          text: 'Sending Profile deleted successfully',
                          icon: "success",
                          duration: 2000
                        });
                        
                        // Panggil callback untuk refresh data
                        if (onSendingProfileDeleted) {
                          onSendingProfileDeleted();
                        }
                      } else {
                        Swal.fire({
                          text: 'Failed to delete sending profile. Please try again!',
                          icon: "error",
                          duration: 2000
                        })
                      }
                    } catch (error) {
                      console.log('Error: ', error);
                      Swal.fire({
                        text: `An error occurred while updating sending profile!`,
                        icon: "error",
                        duration: 2000
                      })
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm'}
                </button>
              </div>
            </DialogPanel>

          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}