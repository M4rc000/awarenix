import { useState } from 'react';
import { HiOutlineMail } from "react-icons/hi";

interface TestRecipient {
  name: string;
  email: string;
  position: string;
}

interface SendTestEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendTestEmail: (recipient: TestRecipient) => void;
  isLoading: boolean;
}

const SendTestEmailModal = ({ isOpen, onClose, onSendTestEmail, isLoading }: SendTestEmailModalProps) => {
  // State untuk menyimpan nama, email, dan posisi penerima
  const [recipient, setRecipient] = useState<TestRecipient>({
    name: '',
    email: '',
    position: '',
  });

  // State untuk menyimpan error validasi
  const [errors, setErrors] = useState<Partial<TestRecipient>>({});

  if (!isOpen) {
    return null;
  }

  // Fungsi validasi sederhana
  const validate = () => {
    const newErrors: Partial<TestRecipient> = {};
    if (!recipient.name.trim()) {
      newErrors.name = 'Nama wajib diisi.';
    }
    if (!recipient.email.trim()) {
      newErrors.email = 'Email wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.email)) {
      newErrors.email = 'Format email tidak valid.';
    }
    if (!recipient.position.trim()) {
      newErrors.position = 'Posisi wajib diisi.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendClick = () => {
    if (validate()) {
      onSendTestEmail(recipient);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRecipient(prev => ({
      ...prev,
      [name]: value
    }));
    // Hapus error setelah pengguna mulai mengetik
    if (errors[name as keyof TestRecipient]) {
      setErrors(prev => ({
        ...prev,
        [name as keyof TestRecipient]: undefined
      }));
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
        <div className="flex">
            <HiOutlineMail className="text-white mx-2 -mt-[1px]" size={30}/>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Send Test Email</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Enter recipient details to send a test email.
        </p>
        <div className="space-y-4">
          <div>
            <label htmlFor="recipient-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              id="recipient-name"
              name="name"
              type="text"
              value={recipient.name}
              onChange={handleChange}
              placeholder="John Doe"
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'}`}
              disabled={isLoading}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="recipient-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              id="recipient-email"
              name="email"
              type="email"
              value={recipient.email}
              onChange={handleChange}
              placeholder="john.doe@example.com"
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'}`}
              disabled={isLoading}
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="recipient-position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
            <input
              id="recipient-position"
              name="position"
              type="text"
              value={recipient.position}
              onChange={handleChange}
              placeholder="Software Engineer"
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 ${errors.position ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'}`}
              disabled={isLoading}
            />
            {errors.position && <p className="mt-1 text-sm text-red-500">{errors.position}</p>}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSendClick}
            disabled={isLoading || !recipient.name.trim() || !recipient.email.trim() || !recipient.position.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendTestEmailModal;