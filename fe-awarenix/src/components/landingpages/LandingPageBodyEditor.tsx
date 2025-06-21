import { useState } from "react";
import { FaPager } from "react-icons/fa";
import Swal from "sweetalert2";

const LandingPageBodyEditor = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [htmlContent, setHtmlContent] = useState(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Landing Page Template</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
    </body>
</html>`);

  const tabs = ["HTML Editor", "Live Preview"];

  const handleImportSite = async () => {
    const { value: url } = await Swal.fire({
      title: "Import Site",
      input: "url",
      inputLabel: "Enter a URL to import HTML",
      inputPlaceholder: "https://example.com",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'You need to enter a URL!';
        }
        try {
          new URL(value); // Validasi format URL dasar
        } catch (_) {
          return 'Please enter a valid URL!';
        }
        return null;
      }
    });

    if (!url) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_URL}/landing-page/clone-site`, { // Ubah URL: tidak perlu query param
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: 'POST', // UBAH MENJADI POST
        body: JSON.stringify({ // Kirim data di body sebagai JSON
          url: url,
          include_resources: false // Sesuai dengan logika gophish
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch site");
      }

      const data = await res.json();
      setHtmlContent(data.html);
      Swal.fire("Success", "Site imported successfully!", "success"); // Tambahkan notifikasi sukses
    } catch (err: any) {
      Swal.fire("Error", err.message || "Failed to import site", "error");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg">
      {/* Tab Navigation */}
      <div className="flex space-x-1 rounded-t-xl bg-gray-100 dark:bg-gray-800 p-1 mb-0">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all ${
              activeTab === index
                ? "bg-white text-blue-600 shadow dark:bg-gray-700 dark:text-blue-400"
                : "text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-b-xl min-h-[500px]">
        {activeTab === 0 ? (
          <div className="p-4 h-full">
            <div className="mb-4 flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Edit HTML Landing Page Template:
              </label>
              <button
                onClick={handleImportSite}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs"
              >
                🌐 Import Site
              </button>
            </div>
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              className="w-full h-96 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan HTML content di sini..."
            />

            <div className="flex flex-wrap gap-2 mb-4 mt-4">
              <button
                onClick={() => setHtmlContent(prev => prev + '\n<p style="color: #666; margin: 10px 0;">New paragraph</p>')}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                + Paragraph
              </button>
              <button
                onClick={() => setHtmlContent(prev => prev + '\n<h2 style="color: #333; margin: 15px 0;">New Heading</h2>')}
                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                + Heading
              </button>
              <button
                onClick={() => setHtmlContent(prev => prev + '\n<a href="#" style="color: #667eea; text-decoration: none;">Link Text</a>')}
                className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
              >
                + Link
              </button>
              <button
                onClick={() => setHtmlContent(prev => prev + '\n<div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">Box Content</div>')}
                className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
              >
                + Box
              </button>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <strong>Tips:</strong>
              <ul className="mt-1 space-y-1 list-disc list-inside">
                <li>Gunakan table-based layout untuk kompatibilitas landing page client</li>
                <li>Selalu gunakan inline CSS untuk styling</li>
                <li>Gunakan width dalam pixel untuk table utama (max 600px)</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="p-4 h-full">
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong className="flex"><FaPager className="mt-[3px] mr-2"/> Landing Page Preview</strong>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                <div><strong>Template:</strong></div>
              </div>
            </div>

            <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white min-h-[400px] overflow-auto">
              {htmlContent ? (
                <iframe
                  srcDoc={htmlContent}
                  className="w-full h-96 border-none"
                  title="Landing Page Preview"
                  sandbox="allow-same-origin"
                />
              ) : (
                <div className="p-8 text-gray-400 text-center">
                  <div className="text-4xl mb-4">📧</div>
                  <div>Preview akan muncul di sini setelah Anda menambahkan HTML content...</div>
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>✅ Desktop Preview</strong><br/>
                  Tampilan saat ini menunjukkan bagaimana landing page akan terlihat di desktop client.
                </div>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-xs text-orange-700 dark:text-orange-300">
                  <strong>⚠️ Mobile Compatibility</strong><br/>
                  Pastikan menggunakan responsive design dengan media queries untuk tampilan mobile yang optimal.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPageBodyEditor;