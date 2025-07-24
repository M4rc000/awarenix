import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Asumsi Anda menggunakan React Router

interface ThankYouReportProps {
  backTo?: string; // optional: URL untuk tombol kembali
}

const ThankYouReport: React.FC<ThankYouReportProps> = ({ backTo = "/" }) => {
  const location = useLocation();
  const [textContent, setTextContent] = useState({
    title: "Thank You!",
    message: "Your report has been successfully received. Our team will follow up as soon as possible.",
    button: "Back to Home",
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const langParam = params.get("lang");

    if (langParam === "ID") {
      setTextContent({
        title: "Terima Kasih!",
        message: "Laporan Anda berhasil kami terima. Tim kami akan menindaklanjuti secepatnya.",
        button: "Kembali ke Beranda",
      });
    } else {
      setTextContent({
        title: "Thank You!",
        message: "Your report has been successfully received. Our team will follow up as soon as possible.",
        button: "Back to Home",
      });
    }
  }, [location.search]); 

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <svg
          className="mx-auto h-16 w-16 text-green-500 mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2l4-4m5 2a9 9 0 11-18 0a9 9 0 0118 0z"
          />
        </svg>

        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          {textContent.title}
        </h1>
        <p className="text-gray-600 mb-6">
          {textContent.message}
        </p>
        <a
          href={backTo}
          className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition"
        >
          {textContent.button}
        </a>
      </div>
    </div>
  );
};

export default ThankYouReport;
