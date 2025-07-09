import { useState, useEffect, useCallback } from "react"; // Tambahkan useCallback
import Swal from "../utils/AlertContainer";
import { CiGlobe } from "react-icons/ci";
import { RiPagesLine } from "react-icons/ri";
import UrlImportModal from "./UrlImportModal";

interface FetchedLandingPage {
  name: string;
  body: string;
}

const LANDING_PAGES_STATIC: { name: string; content: string }[] = [];

type LandingPageBodyEditorProps = {
  templateName?: string;
  initialContent?: string;
  onBodyChange: (body: string) => void;
};

const LandingPageBodyEditor = ({
  onBodyChange,
  initialContent = "",
}: LandingPageBodyEditorProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  // availableTemplates akan menyimpan gabungan template statis dan dari API
  const [availableTemplates, setAvailableTemplates] = useState(LANDING_PAGES_STATIC);

  // State lokal untuk HTML content editor
  // Ini akan menjadi "sumber kebenaran" internal untuk konten HTML yang sedang diedit/ditampilkan.
  const [htmlContent, setHtmlContent] = useState<string>(initialContent);

  // Fungsi untuk mengambil template dari API
  const getLandingPages = useCallback(async () => { // Bungkus dengan useCallback
    const token = localStorage.getItem("token");
    const API_URL = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${API_URL}/landing-page/default`, {
        credentials: 'include',
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      // PERBAIKAN: Pastikan responseData.data adalah array
      if (!Array.isArray(responseData.data)) {
        throw new Error("API response data is not an array.");
      }

      const fetchedTemplates: FetchedLandingPage[] = responseData.data.map((template: { name: string; body: string }) => ({
        name: template.name,
        body: template.body,
      }));

      return {
        status: 'success',
        message: responseData.message || 'Data template landing page berhasil diambil.',
        data: fetchedTemplates,
      };
    } catch (error) {
      console.error("Error fetching landing page templates:", error); // Ubah pesan error
      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return {
        status: 'error',
        message: `Gagal mengambil data template landing page: ${errorMessage}`, // Ubah pesan error
        data: null,
      };
    }
  }, []); // Dependensi kosong, fungsi ini tidak akan dibuat ulang

  // Effect untuk mengambil template dari API dan memperbarui availableTemplates
  useEffect(() => {
    getLandingPages().then((result) => {
      if (result.status === 'success' && result.data) {
        // Menggabungkan template statis (jika ada) dengan template dari API
        const newTemplates = result.data.map((apiT: FetchedLandingPage) => ({
            name: apiT.name,
            content: apiT.body, 
        }));

        setAvailableTemplates([...LANDING_PAGES_STATIC, ...newTemplates]);
      } else {
        console.error('Failed to fetch landing page templates:', result.message);
        Swal.fire({
          text: result.message,
          icon: 'error',
          duration: 3000,
        });
      }
    });
  }, [getLandingPages]); // getLandingPages sekarang adalah dependensi yang stabil karena useCallback

  // State untuk template yang dipilih di dropdown
  const [selectedTemplate, setSelectedTemplate] = useState<string>(() => {
    // Inisialisasi awal based on initialContent
    const matchedTemplate = LANDING_PAGES_STATIC.find(template => template.content === initialContent);
    return matchedTemplate ? matchedTemplate.name : "Custom";
  });

  // Effect untuk mensinkronkan htmlContent internal dan selectedTemplate dengan initialContent dari parent
  useEffect(() => {
    // Hanya update state internal jika ada perbedaan dari prop initialContent
    if (htmlContent !== initialContent) {
      setHtmlContent(initialContent);
    }
    // Perbarui selectedTemplate saat initialContent atau availableTemplates berubah
    const matchedTemplate = availableTemplates.find(template => template.content === initialContent);
    setSelectedTemplate(matchedTemplate ? matchedTemplate.name : "Custom");
  }, [initialContent, availableTemplates, htmlContent]); // Tambahkan htmlContent ke dependensi untuk menghindari loop


  // Handler saat memilih template dari dropdown
  const handleTemplateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newTemplateName = event.target.value;
    setSelectedTemplate(newTemplateName);

    if (newTemplateName === "Custom") {
      setHtmlContent(""); // Kosongkan editor jika memilih "Custom"
      onBodyChange(""); // Beri tahu parent bahwa konten dikosongkan
      return;
    }

    // Cari di `availableTemplates` (yang sudah mencakup template API)
    const template = availableTemplates.find(t => t.name === newTemplateName);
    if (template) {
      setHtmlContent(template.content); // Perbarui state internal
      onBodyChange(template.content); // Beri tahu parent tentang perubahan konten
    }
  };

  const handleImportButtonClick = () => {
    setIsModalOpen(true);
  };

  const handleImportFromUrl = async (url: string) => {
    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/landing-page/clone-site`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch content from URL.');
      }

      const data = await response.json();
      setHtmlContent(data.html); // Perbarui state internal
      onBodyChange(data.html); // Beri tahu parent
      setSelectedTemplate("Custom");
      setIsModalOpen(false);

      Swal.fire({
        text: "URL imported successfully!",
        icon: 'success',
        duration: 2000,
      });

    } catch (error) {
      console.error('Error importing URL: ', error); // Gunakan console.error
      let errorMessage = "Terjadi kesalahan saat mengimpor URL.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Swal.fire({
        text: errorMessage,
        icon: 'error',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = ["HTML Editor", "Live Preview"];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Template Selector */}
        <div className="p-4">
          <label htmlFor="email-template-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Default Landing Page Template:
          </label>
          <div className="relative">
            <select
              id="email-template-select"
              value={selectedTemplate}
              onChange={handleTemplateChange}
              className="
                appearance-none
                block w-full px-4 py-3
                text-base
                border border-gray-300 dark:border-gray-700
                rounded-lg
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                shadow-sm
                transition-all duration-200 ease-in-out
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                dark:focus:ring-blue-400 dark:focus:border-blue-400
                cursor-pointer
                pr-10
              "
            >
              <option value="Custom">Custom Template</option>
              {availableTemplates.map((template) => (
                <option key={template.name} value={template.name}>
                  {template.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.29a.75.75 0 010-1.08z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Import Template Button and hidden file input */}
        <div className="p-4 flex items-end"> {/* Align button to the bottom if content above is taller */}
          <button
            onClick={handleImportButtonClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 w-full md:w-auto rounded-lg text-sm font-medium transition-colors duration-200 shadow-md flex items-center justify-center gap-2 h-12"
          >
            <CiGlobe className="w-5 h-5"/>
            <span>Import Site</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mx-4 bg-gray-100 dark:bg-gray-800 p-1 mb-0 rounded-lg">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 ease-in-out ${
              activeTab === index
                ? "bg-white text-blue-600 shadow-md dark:bg-gray-700 dark:text-blue-400"
                : "text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="rounded-b-xl min-h-[500px]">
        {activeTab === 0 ? (
          // HTML Editor Tab
          <div className="p-4 h-full">
            <div className="mb-4">
              <label htmlFor="html-editor-textarea" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Edit HTML Landing Page Template:
              </label>
              <textarea
                id="html-editor-textarea"
                value={initialContent}
                onChange={(e) => onBodyChange(e.target.value)}
                className="w-full h-96 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-sm"
                placeholder="Masukkan HTML content di sini..."
              />
            </div>

            {/* Quick Insert Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => onBodyChange(initialContent + '\n<p style="color: #666; margin: 10px 0;">New paragraph</p>')}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors duration-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
                title="Insert a new paragraph tag"
              >
                + Paragraph
              </button>
              <button
                onClick={() => onBodyChange(initialContent + '\n<h2 style="color: #333; margin: 15px 0;">New Heading</h2>')}
                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors duration-200 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60"
                title="Insert a new heading (H2) tag"
              >
                + Heading
              </button>
              <button
                onClick={() => onBodyChange(initialContent + '\n<a href="#" style="color: #667eea; text-decoration: none;">Link Text</a>')}
                className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors duration-200 dark:bg-purple-900/40 dark:text-purple-300 dark:hover:bg-purple-900/60"
                title="Insert a new anchor (link) tag"
              >
                + Link
              </button>
              <button
                onClick={() => onBodyChange(initialContent + '\n<div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">Box Content</div>')}
                className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors duration-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:hover:bg-yellow-900/60"
                title="Insert a new content box div"
              >
                + Box
              </button>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md shadow-inner">
              <strong className="block mb-1 text-gray-700 dark:text-gray-300">💡 Important Tips for Email HTML:</strong>
              <ul className="mt-1 space-y-1 list-disc list-inside">
                <li><strong>Security:</strong> Link and script tags are disabled in the preview for security reasons.</li>
                <li><strong>Styling:</strong> Prefer inline CSS for styling elements, as external stylesheets might not be supported.</li>
                <li><strong>Responsiveness:</strong> Use media queries and fluid layouts for optimal mobile viewing.</li>
                <li><strong>Width:</strong> Use fixed widths in pixels for main content tables (e.g., `max-width: 600px`).</li>
              </ul>
            </div>
          </div>
        ) : (
          // Live Preview Tab
          <div className="p-4 h-full">
            {/* Live Preview */}
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 min-h-[400px] overflow-hidden flex items-center justify-center relative">
              {initialContent ? (
                <iframe
                  srcDoc={initialContent}
                  className="w-full h-full min-h-[400px] border-none"
                  title="Email Preview"
                  sandbox="allow-same-origin allow-popups"
                  style={{ background: '#ffffff' }}
                />
              ) : (
                <div className="p-8 text-gray-400 text-center">
                  <div className="text-6xl mb-4 animate-bounce flex justify-center">
                    <RiPagesLine />
                  </div>
                  <div className="text-lg font-medium">No HTML content to display.</div>
                  <div className="text-sm mt-2">Start typing in the HTML editor or choose a template!</div>
                </div>
              )}
            </div>

            {/* Preview Notes */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900">
                <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  <strong><span className="text-base">🖥️</span> Desktop View Insight</strong><br/>
                  This preview reflects how your email will likely appear in common desktop clients (e.g., Chrome, Edge, Safari).
                </div>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-900">
                <div className="text-xs text-orange-700 dark:text-orange-300 font-medium">
                  <strong><span className="text-base">📱</span> Mobile Responsiveness Reminder</strong><br/>
                  For optimal mobile experience, ensure you incorporate responsive design techniques like media queries. This preview may not fully represent mobile rendering.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* URL MODAL IMPORT SITE */}
      <UrlImportModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onImport={handleImportFromUrl}
        isLoading={isLoading}
      />
    </div>
  );
}

export default LandingPageBodyEditor;