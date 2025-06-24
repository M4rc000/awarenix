import { useState } from "react";

type ShowEmailBodyEditorTemplateProps = {
    templateName?: string;
    envelopeSender?: string;
    subject?: string;
    onBodyChange?: (body: string) => void;
    initialContent?: string;
};

const ShowEmailBodyEditorTemplate = ({
    templateName,
    envelopeSender,
    subject,
    initialContent = "",
}: ShowEmailBodyEditorTemplateProps) => {
    const [activeTab, setActiveTab] = useState(0);
    const [htmlContent] = useState(initialContent);
    const tabs = ["HTML Editor", "Live Preview"];

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
            {/* Tab Navigation */}
            <div className="flex space-x-1 mx-4 bg-gray-100 dark:bg-gray-800 p-1 mb-0 mt-2 rounded-lg">
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
                                readOnly
                                className="w-full h-96 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-sm"
                                placeholder="Masukkan HTML content di sini..."
                            />
                        </div>
                        
                        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md shadow-inner">
                            <strong className="block mb-1 text-gray-700 dark:text-gray-300">💡 Important Tips for Email HTML:</strong>
                            <ul className="mt-1 space-y-1 list-disc list-inside">
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
                                <div><strong>From:</strong> <span className="text-gray-700 dark:text-gray-300">{envelopeSender || "your-team@company.com"}</span></div>
                                <div><strong>Subject:</strong> <span className="text-gray-700 dark:text-gray-300">{subject || "Welcome to Our Platform!"}</span></div>
                                <div><strong>Template:</strong> <span className="text-gray-700 dark:text-gray-300">{templateName || "Custom"}</span></div>
                            </div>
                        </div>
                        
                        {/* Live Preview */}
                        <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 min-h-[400px] overflow-hidden flex items-center justify-center relative">
                            {htmlContent ? (
                                <iframe
                                    srcDoc={htmlContent}
                                    className="w-full h-full min-h-[400px] border-none"
                                    title="Email Preview"
                                    sandbox="allow-same-origin allow-popups" // Added allow-popups for potential links
                                    style={{ background: '#ffffff' }} // Ensure iframe background is white
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

export default ShowEmailBodyEditorTemplate;