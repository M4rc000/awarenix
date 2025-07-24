import { useState, useEffect, useRef, useCallback } from "react";
import Swal from "../utils/AlertContainer";
import Select from "../form/Select";



const EMAIL_TEMPLATES_STATIC: { name: string; content: string }[] = [];


type EmailBodyEditorTemplateProps = {
  templateName?: string;
  envelopeSender?: string;
  subject?: string;
  initialContent?: string;
  initialTrackerValue?: number;
  onBodyChange?: (body: string) => void;
};



const replaceLinksWithUrlPlaceholder = (htmlString: string): string => {

   const linkRegex = /(<a\s+(?:[^>]*?\s+)?href=["']?)([^"'>]+)(["']?[^>]*>)/gi;

   return htmlString.replace(linkRegex, `$1{{.URL}}$3`);

};



interface FetchedEmailTemplate {

   name: string;

   body: string;

}



const EmailBodyEditorTemplate = ({

   templateName,

   envelopeSender,

   subject,

   onBodyChange,

   initialContent = "",

}: EmailBodyEditorTemplateProps) => {

   const fileInputRef = useRef<HTMLInputElement>(null);



   const [activeTab, setActiveTab] = useState(0);

   const [availableTemplates, setAvailableTemplates] = useState(EMAIL_TEMPLATES_STATIC);



   // ⭐ Inisialisasi state htmlContent dan selectedTemplate di sini

   // Ini akan dijalankan sekali saat komponen pertama kali di-mount

   const [htmlContent, setHtmlContent] = useState<string>(() => {

     let contentToUse = initialContent;

     if (initialContent === "") {

        const defaultTemplate = EMAIL_TEMPLATES_STATIC.find(t => t.name === "Welcome Email");

        contentToUse = defaultTemplate ? defaultTemplate.content : "";

     }

     return replaceLinksWithUrlPlaceholder(contentToUse);

   });



   const [selectedTemplate, setSelectedTemplate] = useState<string>(() => {

     const matchedTemplate = EMAIL_TEMPLATES_STATIC.find(template => template.content === initialContent);

     return matchedTemplate ? matchedTemplate.name : "Custom";

   });



   // GET DEFAULT TEMPLATE API (tidak berubah)

   async function getEmailTemplates() {
     const token = localStorage.getItem("token");
     const API_URL = import.meta.env.VITE_API_URL;

     try {
        const response = await fetch(`${API_URL}/email-template/default`, {
          credentials: 'include',
          method: 'GET',
          headers: {
             "Content-Type": "application/json",
             Authorization: `Bearer ${token}`,
          },
        });

        console.log('response: ', response);
        

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }



        const responseData = await response.json();



        if (!Array.isArray(responseData.data)) {

          throw new Error("API response data is not an array.");

        }

   

        const fetchedTemplates: FetchedEmailTemplate[] = responseData.data.map((template: { name: string; body: string }) => ({

          name: template.name,

          body: template.body,

        }));



        return {

          status: 'success',

          message: responseData.message || 'Data template email berhasil diambil.',

          data: fetchedTemplates,

        };

     } catch (error) {

        console.error("Error fetching email templates:", error);

        let errorMessage = "Unknown error";

        if (error instanceof Error) {

          errorMessage = error.message;

        }

        return {

          status: 'error',

          message: `Gagal mengambil data template email: ${errorMessage}`,

          data: null,

        };

     }

   }



   // Effect untuk mengambil template dari API dan memperbarui availableTemplates

   // Juga untuk sinkronisasi awal `selectedTemplate` setelah template dimuat

   useEffect(() => {

     getEmailTemplates().then((result) => {

        if (result.status === 'success' && result.data) {

          const newTemplates = result.data

             .filter((apiT: { name: string; }) => !EMAIL_TEMPLATES_STATIC.some(staticT => staticT.name === apiT.name))

             .map((apiT: FetchedEmailTemplate) => ({

               name: apiT.name,

               content: apiT.body,

             }));

     

          // Gabungkan statis dan dari API, lalu set

          const allTemplates = [...EMAIL_TEMPLATES_STATIC, ...newTemplates];

          setAvailableTemplates(allTemplates);



          // ⭐ Set initial selectedTemplate dan htmlContent HANYA jika initialContent kosong

          // atau jika initialContent sesuai dengan salah satu template yang baru dimuat

          if (initialContent === "") {

             const defaultTemplate = allTemplates.find(t => t.name === "Welcome Email");

             if (defaultTemplate) {

               setHtmlContent(replaceLinksWithUrlPlaceholder(defaultTemplate.content));

               setSelectedTemplate(defaultTemplate.name);

             } else if (allTemplates.length > 0) {

               // Jika tidak ada "Welcome Email" tapi ada template lain, set yang pertama

               setHtmlContent(replaceLinksWithUrlPlaceholder(allTemplates[0].content));

               setSelectedTemplate(allTemplates[0].name);

             }

          } else {

               // Jika initialContent sudah ada dari prop, cek apakah cocok dengan template yang ada

               const matchedInitial = allTemplates.find(t => t.content === initialContent);

               setSelectedTemplate(matchedInitial ? matchedInitial.name : "Custom");

               setHtmlContent(replaceLinksWithUrlPlaceholder(initialContent));

          }



        } else {

          console.error('Failed to fetch email templates:', result.message);

          Swal.fire({

             text: result.message,

             icon: 'error',

             duration: 3000,

          });

          // Opsional: jika fetch gagal, mungkin Anda ingin kembali ke template statis atau kosong

          setAvailableTemplates(EMAIL_TEMPLATES_STATIC);

          setSelectedTemplate("Custom"); // Kembali ke custom jika gagal fetch

          setHtmlContent(""); // Kosongkan konten

        }

     });

   }, []); // [] agar hanya berjalan sekali saat komponen di-mount





   // Effect untuk memanggil onBodyChange setiap kali htmlContent (state internal) berubah

   useEffect(() => {

     if (onBodyChange) {

        onBodyChange(htmlContent);

     }

   }, [htmlContent, onBodyChange]);



   // ⭐ Gunakan useCallback untuk handleTemplateChange

   const handleTemplateChange = useCallback((value: string) => {

     const newTemplateName = value;

     setSelectedTemplate(newTemplateName); // Set pilihan baru dari user



     if (newTemplateName === "Custom") {

        setHtmlContent("");

        // Jangan langsung memanggil onBodyChange("") di sini, biarkan useEffect di atas yang menangani

        // perubahan htmlContent

        return;

     }



     const template = availableTemplates.find(t => t.name === newTemplateName);

     if (template) {

        // ⭐ Pastikan konten yang diset ke htmlContent juga melalui replaceLinksWithUrlPlaceholder

        setHtmlContent(replaceLinksWithUrlPlaceholder(template.content));

     }

   }, [availableTemplates]); // Dependencies untuk useCallback: availableTemplates



   // handleFileChange dan extractHtmlFromEml tidak berubah, tetapi pastikan mereka juga memanggil replaceLinksWithUrlPlaceholder

   // handleFileChange sudah benar memanggil extractHtmlFromEml yang di dalamnya ada replaceLinksWithUrlPlaceholder



   const handleImportButtonClick = () => {

     fileInputRef.current?.click();

   };



   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {

     const file = event.target.files?.[0];

     if (!file) {

        return;

     }



     if (file.type !== "message/rfc822" && !file.name.toLowerCase().endsWith(".eml")) {

        Swal.fire({

          text: "Please select a valid EML file (.eml).",

          icon: 'error',

          duration: 3000,

        });

        if (fileInputRef.current) {

          fileInputRef.current.value = '';

        }

        return;

     }



     const reader = new FileReader();

     reader.onload = (e) => {

        const emlContent = e.target?.result as string;

        const extractedHtml = extractHtmlFromEml(emlContent);



        if (extractedHtml) {

          setHtmlContent(extractedHtml);

          setSelectedTemplate("Custom");

          Swal.fire({

             text: "EML file imported successfully!",

             icon: 'success',

             duration: 2000,

          });

        } else {

          Swal.fire({

             text: "Could not find HTML content in the EML file. Please ensure it contains an HTML part.",

             icon: 'warning',

             duration: 4000,

          });

        }

        if (fileInputRef.current) {

          fileInputRef.current.value = '';

        }

     };

     reader.onerror = () => {

        Swal.fire({

          text: "Failed to read EML file. Please try again.",

          icon: 'error',

          duration: 3000,

        });

        if (fileInputRef.current) {

          fileInputRef.current.value = '';

        }

     };

     reader.readAsText(file);

   };



   const extractHtmlFromEml = (emlString: string): string | null => {

     const htmlPartRegex = /Content-Type: text\/html;(?:\s*charset=["']?utf-8["']?)?(?:;.*)?\s*\r?\n\r?\n([\s\S]*?)(?=\r?\n--|$)/i;

     const match = emlString.match(htmlPartRegex);



     if (match && match[1]) {

        const encodingMatch = emlString.match(/Content-Transfer-Encoding: (\S+)/i);

        const encoding = encodingMatch ? encodingMatch[1].toLowerCase() : '';



        let htmlContentPart = match[1].trim();



        if (encoding === 'quoted-printable') {

          htmlContentPart = htmlContentPart.replace(/=\r?\n/g, '').replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

        } else if (encoding === 'base64') {

          try {

             htmlContentPart = atob(htmlContentPart);

          } catch (e) {

             console.error("Base64 decoding failed:", e);

             return null;

          }

        }

        return replaceLinksWithUrlPlaceholder(htmlContentPart);

     }



     const fallbackHtmlRegex = /(<html[\s\S]*<\/html>)/i;

     const fallbackMatch = emlString.match(fallbackHtmlRegex);

     if (fallbackMatch && fallbackMatch[1]) {

        return replaceLinksWithUrlPlaceholder(fallbackMatch[1]);

     }



     return null;

   };



   const tabs = ["HTML Editor", "Live Preview"];



   // Persiapkan opsi untuk komponen Select kustom

   const templateOptions = [

     { value: "Custom", label: "Custom Template" },

     ...availableTemplates.map(template => ({

        value: template.name,

        label: template.name

     }))

   ];



   return (

     <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

          {/* Template Selector */}

          <div className="p-4">

             <Select

               label="Default Email Template"

               value={selectedTemplate}

               options={templateOptions}

               onChange={handleTemplateChange}

               placeholder="Select a template"

               required={false}

             />

          </div>



          {/* Import Template Button and hidden file input */}

          <div className="p-4 mx-5 flex items-end">

             <button

               onClick={handleImportButtonClick}

               className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 w-full md:w-auto rounded-lg text-sm font-medium transition-colors duration-200 shadow-md flex items-center justify-center gap-2 h-12"

             >

               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">

                  <path fillRule="evenodd" d="M.07 7.07l2.94 2.94a1.5 1.5 0 002.12 0L8.07 7.07a1.5 1.5 0 000-2.12L5.95 2.83a.5.5 0 00-.7-.07l-4 3.75a.5.5 0 00-.07.7zM10 12a1 1 0 100 2h7a1 1 0 100-2h-7z" clipRule="evenodd" />

               </svg>

               <span>Import EML File</span>

             </button>

             <input

               type="file"

               ref={fileInputRef}

               onChange={handleFileChange}

               accept=".eml,message/rfc822"

               className="hidden"

             />

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

                    Edit HTML Email Template:

                  </label>

                  <textarea

                    id="html-editor-textarea"

                    value={htmlContent}

                    onChange={(e) => {

                       setHtmlContent(e.target.value);

                       setSelectedTemplate("Custom"); // Tetap set ke Custom jika user edit manual

                    }}

                    className="w-full h-96 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-sm"

                    placeholder="Masukkan HTML content di sini..."

                  />

               </div>



               {/* Quick Insert Buttons */}

               <div className="flex flex-wrap gap-2 mb-4">

                  <button

                    onClick={() => setHtmlContent(prev => prev + '\n<p style="color: #666; margin: 10px 0;">New paragraph</p>')}

                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors duration-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60"

                    title="Insert a new paragraph tag"

                  >

                    + Paragraph

                  </button>

                  <button

                    onClick={() => setHtmlContent(prev => prev + '\n<h2 style="color: #333; margin: 15px 0;">New Heading</h2>')}

                    className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors duration-200 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60"

                    title="Insert a new heading (H2) tag"

                  >

                    + Heading

                  </button>

                  <button

                    onClick={() => setHtmlContent(prev => prev + '\n<a href="#" style="color: #667eea; text-decoration: none;">Link Text</a>')}

                    className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors duration-200 dark:bg-purple-900/40 dark:text-purple-300 dark:hover:bg-purple-900/60"

                    title="Insert a new anchor (link) tag"

                  >

                    + Link

                  </button>

                  <button

                    onClick={() => setHtmlContent(prev => prev + '\n<div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">Box Content</div>')}

                    className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors duration-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:hover:bg-yellow-900/60"

                    title="Insert a new content box div"

                  >

                    + Box

                  </button>

               </div>



               <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md shadow-inner">

                  <strong className="block mb-1 text-gray-700 dark:text-gray-300">💡 Important Tips for Email HTML:</strong>

                  <ul className="mt-1 space-y-1 list-disc list-inside">

                    <li><strong>Replacement:</strong> Use {`{{.Name}}`} or {`{{.Email}}`} for replacement user's information.</li>

                    <li><strong>Security:</strong> Link and script tags are disabled in the preview for security reasons.</li>

                    <li><strong>Layout:</strong> Always use a table-based layout for maximum email client compatibility.</li>

                    <li><strong>Styling:</strong> Prefer inline CSS for styling elements, as external stylesheets might not be supported.</li>

                    <li><strong>Testing:</strong> Crucially, test your email on various email clients (e.g., Gmail, Outlook, Apple Mail, etc.) and devices.</li>

                    <li><strong>Responsiveness:</strong> Use media queries and fluid layouts for optimal mobile viewing.</li>

                    <li><strong>Width:</strong> Use fixed widths in pixels for main content tables (e.g., `max-width: 600px`).</li>

                  </ul>

               </div>

             </div>

          ) : (

             // Live Preview Tab

             <div className="p-4 h-full">

               {/* Email Header Info */}

               <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">

                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold">

                    <strong>📧 Email Preview Details:</strong>

                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">

                    <div><strong>From:</strong> <span className="text-gray-700 dark:text-gray-300">{templateName || "Welcome Email"}</span></div>

                    <div><strong>From:</strong> <span className="text-gray-700 dark:text-gray-300">{envelopeSender || "your-team@company.com"}</span></div>

                    <div><strong>Subject:</strong> <span className="text-gray-700 dark:text-gray-300">{subject || "Welcome to Our Platform!"}</span></div>

                  </div>

               </div>



               {/* Live Preview */}

               <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 min-h-[400px] overflow-hidden flex items-center justify-center relative">

                  {htmlContent ? (

                    <iframe

                       srcDoc={htmlContent}

                       className="w-full h-full min-h-[400px] border-none"

                       title="Email Preview"

                       sandbox="allow-same-origin allow-popups"

                       style={{ background: '#ffffff' }}

                    />

                  ) : (

                    <div className="p-8 text-gray-400 text-center">

                       <div className="text-6xl mb-4 animate-bounce">✉️</div>

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

                       This preview reflects how your email will likely appear in common desktop email clients (e.g., Outlook, Thunderbird, Mail for Mac).

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

     </div>

   );

};



export default EmailBodyEditorTemplate;