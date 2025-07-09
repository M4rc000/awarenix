import { useState, useEffect } from 'react';
import Radio from "../form/input/Radio";
import Swal from "../utils/AlertContainer"; // Asumsi path benar

export function PhishSettingsForm() {
    const [selectedAction, setSelectedAction] = useState<string>('awarenix-redirect'); // Default awal yang konsisten
    const [customRedirectUrl, setCustomRedirectUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // Definisi pilihan untuk radio button group
    // Pastikan `value` sesuai dengan mapping integer di backend Anda
    const actionOptions = [
        {
            id: "awarenix-redirect",
            label: "Redirect to the Awarenix education website",
            value: "0", // Mapping ke 0 di backend
        },
        {
            id: "my-own-redirect",
            label: "Redirect to my own education website",
            value: "1", // Mapping ke 1 di backend
        },
        {
            id: "do-nothing",
            label: "Don't do anything",
            value: "2", // Mapping ke 2 di backend
        }
    ];

    // Fungsi untuk mengonversi nilai string dari radio ke integer yang dipahami backend
    const mapActionToBackendValue = (actionString: string): number => {
        switch (actionString) {
            case "0": // Value dari option
                return 0;
            case "1": // Value dari option
                return 1;
            case "2": // Value dari option
                return 2;
            default:
                return 0; // Default jika tidak ada yang cocok
        }
    };

    // Fungsi untuk mengonversi nilai integer dari backend ke string yang dipahami frontend
    const mapBackendValueToAction = (actionNumber: number): string => {
        switch (actionNumber) {
            case 0:
                return "0"; // Sesuaikan dengan string value radio button
            case 1:
                return "1"; // Sesuaikan dengan string value radio button
            case 2:
                return "2"; // Sesuaikan dengan string value radio button
            default:
                return "0"; // Default
        }
    };

    // useEffect untuk mengambil pengaturan saat komponen dimuat
    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            const API_URL = import.meta.env.VITE_API_URL;

            try {
                const response = await fetch(`${API_URL}/profiles/phish-settings`, { // Pastikan URL sesuai routes.go Anda
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Failed to fetch settings: ${response.status}`);
                }

                const result = await response.json();

                if (result.status === 'success' && result.data) {
                    setSelectedAction(mapBackendValueToAction(result.data.phishingRedirectAction));
                    setCustomRedirectUrl(result.data.customEducationUrl || '');
                } else if (result.status === 'success' && result.data === null) {
                    setSelectedAction('0');
                    setCustomRedirectUrl('');
                } else {
                    Swal.fire({
                        icon: 'error', 
                        text: result.message || 'Failed to load settings.',
                        duration: 3000
                    });
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
                Swal.fire({
                    icon: 'error', 
                    text: (error as Error).message || 'Failed to load settings.',
                    duration: 3000
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []); // Array dependensi kosong, agar hanya berjalan sekali saat mount

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSaving(true);
        const token = localStorage.getItem("token");
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedBy = userData?.id || 0;

        const API_URL = import.meta.env.VITE_API_URL;

        const payload = {
            phishingRedirectAction: mapActionToBackendValue(selectedAction), // Konversi ke integer
            customEducationUrl: selectedAction === '1' ? customRedirectUrl : null, // Kirim null jika tidak dipilih
            updatedBy: updatedBy,
        };

        try {
            const response = await fetch(`${API_URL}/profiles/update/phish-settings`, { // Pastikan URL sesuai routes.go Anda
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to save settings: ${response.status}`);
            }

            const result = await response.json();

            if (result.status === 'success') {
                Swal.fire({
                    icon: 'success', 
                    text: result.message || 'Education settings updated successfully.',
                    duration: 3000
                });
            } else {
                Swal.fire({
                    icon: 'error', 
                    text: result.message || 'Failed to save settings.',
                    duration: 3000
                });
            }
            
        } catch (error) {
            console.error("Error saving settings:", error);
            Swal.fire({
                icon: 'error', 
                text: (error as Error).message,
                duration: 3000
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48">
                <p className="text-gray-600 dark:text-gray-300">Loading settings...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                If an employee falls victim to a phishing website, what action should be taken?
                Note: This setting configures the default selection for new campaigns. This setting can be modified on a campaign-by-campaign basis.
            </p>
            
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1 lg:gap-7 2xl:gap-x-32">
                {actionOptions.map((option) => (
                    <Radio
                        key={option.id}
                        id={option.id}
                        name="phishingAction"
                        value={option.value} // Value adalah "0", "1", atau "2"
                        label={option.label}
                        checked={selectedAction === option.value} // Membandingkan selectedAction dengan option.value
                        onChange={() => setSelectedAction(option.value)} // Mengatur selectedAction ke "0", "1", atau "2"
                        className="form-radio"
                    />
                ))}
            </div>

            {/* Input URL Kondisional */}
            {selectedAction === '1' ? ( // Menggunakan '1' (string) karena selectedAction adalah string
                <div className="mt-4">
                    <label htmlFor="customRedirectUrl" className="sr-only">Custom Redirect URL</label>
                    <input
                        type="url"
                        id="customRedirectUrl"
                        value={customRedirectUrl}
                        onChange={(e) => setCustomRedirectUrl(e.target.value)}
                        placeholder="https://authwebmail.com/index"
                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isSaving}
                    />
                </div>
            ) : null}

            <div className="mt-8">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Saving...' : 'Update Education'}
                </button>
            </div>
        </form>
    );
}