import { useState } from 'react';
import Radio from "../form/input/Radio"; // Pastikan path ini benar

export function PhishSettingsForm() {
    const [selectedAction, setSelectedAction] = useState('canlphish-redirect'); 
    const [customRedirectUrl, setCustomRedirectUrl] = useState(''); // State untuk URL kustom

    // Definisi pilihan untuk radio button group
    const actionOptions = [
        {
            id: "canlphish-redirect",
            label: "Redirect to the Awarenix education website",
            value: "canlphish-redirect",
        },
        {
            id: "my-own-redirect",
            label: "Redirect to my own education website",
            value: "my-own-redirect",
        },
        {
            id: "do-nothing",
            label: "Don't do anything",
            value: "do-nothing",
        }
    ];

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
    };

    return (
        <div className="space-y-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                If an employee falls victim to a phishing website, what action should be taken?
                Note: This setting configures the default selection for new campaigns. This setting can be modified on a campaign-by-campaign basis.
            </p>
            
            {/* Menggunakan grid untuk layout radio options */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1 lg:gap-7 2xl:gap-x-32">
                {actionOptions.map((option) => (
                    <Radio
                        key={option.id}
                        id={option.id}
                        name="phishingAction"
                        value={option.value}
                        label={option.label}
                        checked={selectedAction === option.value}
                        onChange={setSelectedAction}
                        className="form-radio"
                    />
                ))}
            </div>

            {/* Input URL Kondisional */}
            {selectedAction === 'my-own-redirect' && (
                <div className="mt-4">
                    <label htmlFor="customRedirectUrl" className="sr-only">Custom Redirect URL</label> {/* Label untuk aksesibilitas */}
                    <input
                        type="url"
                        id="customRedirectUrl"
                        value={customRedirectUrl}
                        onChange={(e) => setCustomRedirectUrl(e.target.value)}
                        placeholder="https://authwebmail.com/index" // Placeholder sesuai gambar
                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            )}

            {/* Tombol Update Education */}
            <div className="mt-8">
                <button
                    type="submit" 
                    onClick={handleSubmit}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                >
                    Update Education
                </button>
            </div>
        </div>
    );
}