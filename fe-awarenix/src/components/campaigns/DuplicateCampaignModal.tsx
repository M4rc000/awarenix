import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition,
} from '@headlessui/react'
import { Fragment, useRef } from 'react'
import DuplicateCampaignModalForm, { DuplicateCampaignModalFormRef } from './DuplicateCampaignModalForm'
import { Campaign } from './TableCampaigns'

export type UpdateCamapaignModalProps = {
  isOpen: boolean
  onClose: () => void
  campaign: Campaign | null
  onUpdateSuccess: () => void
}

export default function DuplicateCampaignModal({
  isOpen,
  onClose,
  campaign,
  onUpdateSuccess,
}: UpdateCamapaignModalProps) {
  const formRef = useRef<DuplicateCampaignModalFormRef>(null);

  const handleSubmit = async () => {
    if (formRef.current) {
      const success = await formRef.current.submitCampaign(); // Perbaikan nama fungsi
      if (success) {
        onUpdateSuccess();
        onClose();
      }
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      {/* Gunakan onClose untuk DialogBackdrop agar bisa menutup modal saat klik di luar */}
      <Dialog open={isOpen} onClose={onClose} className="relative z-[999]">
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
          <DialogBackdrop className="fixed inset-0 bg-black/40 backdrop-filter backdrop-blur-xs" />
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
            {/* Hapus onClick pada DialogPanel agar tidak menghentikan event bubbling dari DialogBackdrop */}
            <DialogPanel className="w-full xl:max-w-5xl box-border rounded-lg bg-white dark:bg-gray-900 shadow-xl overflow-visible dark:border dark:border-gray-700 flex flex-col max-h-[90vh] xl:mt-5 z-[9999999999999]">
              {/* HEADER */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-b-gray-300 dark:border-b-gray-700 flex-shrink-0">
                <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  New Campaign
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
                {/* Pastikan campaign tidak null sebelum diteruskan ke DuplicateCampaignModalForm */}
                {campaign && (
                  <DuplicateCampaignModalForm ref={formRef} campaign={campaign} onUpdateSuccess={onUpdateSuccess} />
                )}
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-200 dark:text-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </DialogPanel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}