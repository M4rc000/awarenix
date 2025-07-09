import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition,
} from '@headlessui/react'
import { Fragment } from 'react'
import NewEmailTemplateModalForm, {NewEmailTemplateModalFormRef} from './NewEmailTemplateModalForm'
import { useRef, useState } from 'react'

export type NewEmailTemplateModalProps = {
  isOpen: boolean
  onClose: () => void
  onEmailTemplateAdded: () => void
}

export default function NewEmailTemplateModal({
  isOpen,
  onClose,
  onEmailTemplateAdded,
}: NewEmailTemplateModalProps) {
  const formRef = useRef<NewEmailTemplateModalFormRef>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!formRef.current) return;
    
    try {
      setIsSubmitting(true);
      const success = await formRef.current.submitEmailTemplate();
      
      if (success) {
        onEmailTemplateAdded(); // ⬅️ panggil reload
        onClose();
      }
    } catch (error) {
      console.error('Failed to save email template:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
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
              <div className="flex items-center justify-between px-6 py-4 border-b border-b-gray-300 dark:border-b-gray-600 flex-shrink-0">
                <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  New Email Template
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
                <NewEmailTemplateModalForm ref={formRef} onSuccess={onEmailTemplateAdded}/>
              </div>

              {/* FOOTER */}
              {/* FOOTER */}
              <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-200 dark:text-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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