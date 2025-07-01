import { useState, useRef } from 'react'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition,
} from '@headlessui/react'
import { Fragment } from 'react'
import DeleteEmailTemplateForm, {DeleteEmailTemplateFormRef} from './DeleteEmailTemplateModalForm'
import Swal from '../utils/AlertContainer'

export type EmailTemplate = {
  id: number;
  name: string;
  envelopeSender: string;
  subject: string;
}

export type DeleteEmailTemplatesModalProps = {
  isOpen: boolean
  onClose: () => void
  emailTemplate: EmailTemplate | null
  onSuccess?: () => void
  onEmailTemplateDeleted?: () => void
}

export default function DeleteEmailTemplateModal({
  isOpen,
  onClose,
  emailTemplate,
  onEmailTemplateDeleted,
}: DeleteEmailTemplatesModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string>('');
  // const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<DeleteEmailTemplateFormRef>(null);


  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');
  const handleDelete = async () => {
    if (!emailTemplate) return;
    // setIsDeleting(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/email-template/${emailTemplate.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to delete email template');
        Swal.fire({
          text: 'Failed to delete email template',
          icon: 'error',
          duration: 2000
        });
        return;
      }
      onClose();         // ❎ close modal
      if (onEmailTemplateDeleted) {
        onEmailTemplateDeleted();
      }
    } catch (err) {
      setError('Unexpected error occurred');
      console.log('Error: ', err);
      
      Swal.fire({
        text: `Unexpected error occurred while deleting email template`,
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
              <div className="flex items-center justify-between px-6 py-4 border-b border-b-gray-700 flex-shrink-0">
                    <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Confirmation Delete Email Template ?
                    </DialogTitle>
                </div>

              {/* BODY */}
              <div className="px-6 py-4 overflow-y-auto flex-1">
                <DeleteEmailTemplateForm
                  emailTemplate={emailTemplate!}
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
                      // setIsLoading(true);                      
                      const success = await formRef.current?.submitDelete();
                      
                      if (success) {
                        onClose();
                        Swal.fire({
                          text: 'Email template deleted successfully',
                          icon: "success",
                          duration: 2000
                        });
                        
                        // Panggil callback untuk refresh data
                        if (onEmailTemplateDeleted) {
                          onEmailTemplateDeleted();
                        }
                      } else {
                        Swal.fire({
                          text: 'Failed to delete email template. Please try again!',
                          icon: "error",
                          duration: 2000
                        })
                      }
                    } catch (error) {
                      console.log('Error: ', error);
                      Swal.fire({
                        text: `An error occurred while updating email template!`,
                        icon: "error",
                        duration: 2000
                      })
                    } finally {
                      // setIsLoading(false);
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