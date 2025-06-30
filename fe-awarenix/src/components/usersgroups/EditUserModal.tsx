import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition,
} from '@headlessui/react'
import { Fragment, useRef, useState} from 'react'
import EditUserModalForm, {EditUserModalFormRef} from './EditUserModalForm'
import Swal from '../utils/AlertContainer'

interface User {
  id: number;
  name: string;
  email: string;
  company: string;
  role: string;
  isActive: string;
  position: string;
  updatedAt: string;
}

export type EditUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated?: () => void; 
  onDismiss?: () => void;
}

export default function EditUserModal({
  isOpen,
  onClose,
  user,
  onUserUpdated, 
}: EditUserModalProps) {
  const formRef = useRef<EditUserModalFormRef>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog 
        open={isOpen} 
        onClose={() => {}}
        className="relative z-[999]"
      >
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
              className="w-full max-w-3xl box-border rounded-lg bg-white dark:bg-gray-900 shadow-xl overflow-hidden dark:border dark:border-gray-700 flex flex-col max-h-[90vh] xl:mt-5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Edit User
                </DialogTitle>
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✕
                </button>
              </div>

              {/* BODY */}
              <div className="px-6 py-4 overflow-y-auto flex-1">
                <EditUserModalForm ref={formRef} user={user!}/>
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-200 dark:text-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Close
                </button>
                <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  onClick={async () => {
                    try {
                      setIsLoading(true);
                      
                      const success = await formRef.current?.submitUsers();
                      
                      if (success) {
                        onClose();
                        Swal.fire({
                          text: 'User updated successfully',
                          icon: "success",
                          duration: 2000
                        })
                        
                        // Panggil callback untuk refresh data
                        if (onUserUpdated) {
                          onUserUpdated();
                        }
                      } else {
                        Swal.fire({
                          text: 'Failed to update user. Please try again!',
                          icon: "error",
                          duration: 2000
                        })
                      }
                    } catch (error) {
                      console.log(error);
                      Swal.fire({
                        text: 'An error occurred while updating user!',
                        icon: "error",
                        duration: 2000
                      })
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </DialogPanel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}