import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MdOutlineArrowBack,
  MdOutlineRefresh,
  MdCheckCircleOutline,
  MdGroup,
  MdSchedule,
  MdSend,
} from 'react-icons/md';
import { FiMail, FiAlertCircle, FiCalendar, FiUser, FiGlobe } from 'react-icons/fi';
import { HiOutlineMail, HiOutlineMailOpen } from 'react-icons/hi';
import { LuMousePointerClick } from 'react-icons/lu';
import { IoIosSave } from 'react-icons/io';
import { BiError } from 'react-icons/bi';
import PageMeta from '../../components/common/PageMeta';
import { formatUserDate } from '../../components/utils/DateFormatter';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaDownload } from 'react-icons/fa';
import { FaWindows, FaChrome } from 'react-icons/fa';


// --- DEFINISI INTERFACE BARU UNTUK TIMELINE PESERTA ---
interface SubmittedDataDetails {
  __original_url: string;
  username: string;
  password: string;
  // Anda bisa menambahkan parameter lain di sini jika ada
}

interface ParticipantTimelineEvent {
  event: 'Campaign Created' | 'Email Sent' | 'Email Opened' | 'Clicked Link' | 'Submitted Data' | 'Reported' | 'Error' | 'Pending';
  date: string;
  os?: string;
  browser?: string;
  details?: SubmittedDataDetails;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  position: string;
  status: 'sent' | 'opened' | 'clicked' | 'submitted' | 'reported' | 'error' | 'pending';
  reported: number;
  browser: string;
  os: string;
  // Tambahkan timeline events
  timeline: ParticipantTimelineEvent[];
}

interface CampaignDetails {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  createdBy: number;
  createdByName: string;
  emailTemplateName: string;
  groupName: string;
  landingPageName: string;
  sendingProfileName: string;
  url: string;
  launch_date: string;
  email_sent: number;
  email_opened: number;
  email_clicks: number;
  email_reported: number;
  email_submitted: number;
  total_participants: number;
  participants: Participant[];
  completed_date: Date;
}


// Enhanced Loading Spinner
const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-800">
    <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-pulse"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="mt-6 text-lg text-gray-700 dark:text-gray-300 font-medium">
        {message}
      </p>
    </div>
  </div>
);

// Enhanced Error Alert
const ErrorAlert: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-800 p-6">
    <div className="container mx-auto max-w-4xl pt-20">
      <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
            <FiAlertCircle className="text-red-600 dark:text-red-400 text-2xl" />
          </div>
          <div className="ml-6 flex-1">
            <h3 className="text-xl font-bold text-red-800 dark:text-red-200">
              Error Loading Campaign Details
            </h3>
            <p className="text-red-600 dark:text-red-300 mt-2 text-base">{message}</p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="ml-6 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);


const CampaignTimeline: React.FC<{ campaign: CampaignDetails }> = ({ campaign }) => {
  const timelineEvents = [
    {
      title: "Campaign Created",
      date: formatUserDate(campaign.createdAt),
      description: ``,
      icon: <FiUser className="text-blue-600" />,
      color: "blue"
    },
    {
      title: "Campaign Launched",
      date: formatUserDate(campaign.launch_date),
      description: ``,
      icon: <MdSend className="text-green-600" />,
      color: "green"
    },
    {
      title: "Current Status",
      date: campaign.completed_date ? formatUserDate(campaign.completed_date) : 'N/A',
      description: `Status: ${campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}`,
      icon: <MdCheckCircleOutline className="text-purple-600" />,
      color: "purple"
    }
  ];

  return (
    <div className="space-y-6">
      {timelineEvents.map((event, index) => (
        <div key={index} className="flex items-start space-x-4">
          <div className={`flex-shrink-0 w-10 h-10 bg-${event.color}-100 dark:bg-${event.color}-900/30 rounded-xl flex items-center justify-center`}>
            {event.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                {event.title}
              </h4>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {event.date}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {event.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

const ParticipantTimelineDetails: React.FC<{ timeline: ParticipantTimelineEvent[] }> = ({ timeline }) => {
  
  const getIconForEvent = (event: string) => {
    switch (event) {
      case 'sent':
        return <HiOutlineMail className="text-xl text-green-600" />;
      case 'opened':
        return <HiOutlineMailOpen className="text-xl text-yellow-600" />;
      case 'clicked':
        return <LuMousePointerClick className="text-xl text-blue-600" />;
      case 'submitted':
        return <IoIosSave className="text-xl text-teal-600" />;
      case 'reported':
        return <BiError className="text-xl text-red-600" />;
      default:
        return <FiAlertCircle className="text-xl text-gray-400" />;
    }
  };
  
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-6 border-l-2 border-gray-200 dark:border-gray-700 ml-4 mb-4">
      <h5 className="font-bold text-gray-900 dark:text-white mb-4">Participant Activity Timeline</h5>
      <ul className="relative mx-3">
        {timeline.map((event, index) => (
          <li key={index} className="mb-6 ml-6">
            <span className="absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 ring-1 dark:ring-gray-400 ring-gray-700 bg-gray-100 dark:bg-gray-700">
              {getIconForEvent(event.event)}
            </span>
            <div className="flex justify-between items-center">
              <h3 className="flex items-center text-base font-semibold text-gray-900 dark:text-white">
                {event.event}
              </h3>
              <time className="block text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                {formatUserDate(event.date)}
              </time>
            </div>
            
            {(event.os || event.browser) && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {event.os && (
                  <div className="flex items-center gap-2 mt-1">
                    <FaWindows className="text-blue-500" />
                    <span>{event.os}</span>
                  </div>
                )}
                {event.browser && (
                  <div className="flex items-center gap-2 mt-1">
                    <FaChrome className="text-green-500" />
                    <span>{event.browser}</span>
                  </div>
                )}
              </div>
            )}
            
            {event.details && (
              <div className="mt-3 bg-white dark:bg-gray-900 rounded-lg shadow-inner p-4 border border-gray-200 dark:border-gray-700">
                <h6 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-2">Submitted Data</h6>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span className="font-medium">Username:</span>
                    <span>{event.details.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Password:</span>
                    <span>{event.details.password}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Original URL:</span>
                    <a href={event.details.__original_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate max-w-[200px]">{event.details.__original_url}</a>
                  </div>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};


const ParticipantsTable: React.FC<{ participants: Participant[] }> = ({ participants }) => {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  
  const handleRowClick = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };
  
  const getStatusColor = (status: Participant['status']) => {
    switch (status) {
      case 'sent': return 'bg-green-300 text-green-700 dark:bg-green-900/100 dark:text-green-100';
      case 'opened': return 'bg-yellow-300 text-yellow-700 dark:bg-yellow-900/100 dark:text-yellow-100';
      case 'clicked': return 'bg-blue-300 text-blue-700 dark:bg-blue-900/100 dark:text-blue-100';
      case 'submitted': return 'bg-cyan-300 text-cyan-700 dark:bg-cyan-900/100 dark:text-cyan-100';
      case 'reported': return 'bg-red-300 text-red-700 dark:bg-red-900/100 dark:text-red-100';
      case 'error': return 'bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-3 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">#</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Participant</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Email Address</th>
              <th className="px-3 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Position</th>
              <th className="px-2 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {participants.map((participant, index) => (
              <React.Fragment key={participant.id}>
                <tr
                  onClick={() => handleRowClick(participant.id)}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                >
                  <td className="px-3 py-4 whitespace-nowrap"><div className="text-sm font-semibold text-gray-900 dark:text-white">{index + 1}</div></td>
                  <td className="px-4 py-4 whitespace-nowrap"><div className="text-sm font-semibold text-gray-900 dark:text-white">{participant.name}</div></td>
                  <td className="px-4 py-4 whitespace-nowrap"><div className="text-sm text-gray-600 dark:text-gray-300 font-medium">{participant.email}</div></td>
                  <td className="px-3 py-4 whitespace-nowrap"><div className="text-sm text-gray-600 dark:text-gray-300">{participant.position}</div></td>
                  <td className="px-2 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(participant.status)}`}>
                      {participant.status}
                    </span>
                  </td>
                </tr>
                {expandedRowId === participant.id && (
                  <tr>
                    <td colSpan={7}>
                      <ParticipantTimelineDetails timeline={participant.timeline} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


const EnhancedMetricCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    description?: string;
  }> = ({ title, value, icon, color, description }) => {
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-center mb-4">
        <div className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900/30 rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
          {value.toLocaleString()}
        </h3>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 text-center">
          {title}
        </p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

const CampaignDetail: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchCampaignData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_URL}/campaigns/${campaignId}`, { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch campaign details.');
      }

      const data = await response.json();
      
      if (data.status === 'success') {
          setCampaign(data.data);
      } else {
          throw new Error(data.message || 'Failed to fetch campaign details.');
      }

    } catch (err: unknown) {
    setIsError(true);
    if (err instanceof Error) { // Periksa jika itu adalah instance Error
        setError(err.message);
        console.error("Error fetching campaign details:", err);
    } else if (typeof err === 'string') { // Jika itu string
        setError(err);
        console.error("Error fetching campaign details:", err);
    } else {
        setError('An unexpected error occurred.');
        console.error("Error fetching campaign details:", err);
    }
      setCampaign(null);
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, API_URL]);

  useEffect(() => {
    if (campaignId) {
      fetchCampaignData();
    }
  }, [campaignId, fetchCampaignData]);

  const handleBack = () => navigate('/dashboard');
  
  const handleExport = () => {
    if (!campaign) {
      console.warn("No campaign data to export.");
      return;
    }

    const headers = [
      "#",
      "Campaign Name",
      "Campaign Launch Date",
      "Campaign Complete Date",
      "Name",
      "Email",
      "Position",
      "Status",
      "Browser", 
      "OS",      
    ];

    const dataToExport = campaign.participants.map((p, index) => ({
      "#": index + 1,
      "Campaign Name": campaign.name,
      "Campaign Launch Date": formatUserDate(campaign.launch_date),
      "Campaign Complete Date": campaign.completed_date ? formatUserDate(campaign.completed_date) : 'N/A',
      "Name": p.name,
      "Email": p.email,
      "Position": p.position,
      "Status": p.status,
      "Browser": p.browser,
      "OS": p.os,      
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Campaign Participants");

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, `${campaign.name} campaign report.xlsx`);

  };

  const handleRefresh = () => fetchCampaignData();

  if (isLoading) {
    return <LoadingSpinner message="Loading campaign details..." />;
  }

  if (isError) {
    return <ErrorAlert message={error || 'Unknown error occurred'} onRetry={handleRefresh} />;
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-white rounded dark:bg-800 p-6">
        <div className="container mx-auto max-w-4xl pt-20">
          <div className="bg-white dark:bg-gray-800 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <FiAlertCircle className="text-yellow-600 dark:text-yellow-400 text-2xl" />
              </div>
              <div className="ml-6 flex-1">
                <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200">
                  Campaign Not Found
                </h3>
                <p className="text-yellow-600 dark:text-yellow-300 mt-2">
                  The requested campaign details could not be found.
                </p>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Campaign Detail" description=""></PageMeta>
      <div className="min-h-screen bg-white dark:bg-gray-800/50 rounded-lg">
        <div className="container mx-auto px-3 py-8">
          
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div className="mb-4 lg:mb-0">
                <div className="flex items-center space-x-3 mb-2">
                  <button
                    onClick={handleBack}
                    className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    <MdOutlineArrowBack className="mr-2 text-lg" />
                    Back
                  </button>
                </div>
                
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 mt-5 mx-4">
                  {campaign.name}
                </h1>
                <div className={`px-3 py-1 text-sm font-semibold rounded-full w-fit mx-4 ${
                  campaign.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                  campaign.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 pt-4 mx-4">
                  <div className="flex items-center space-x-2">
                    <FiCalendar className="text-gray-500" />
                    <span>Created: { formatUserDate(campaign.createdAt) }</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MdGroup className="text-gray-500" />
                    <span>Group: {campaign.groupName}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 px-5">
                <button
                  onClick={handleRefresh}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <MdOutlineRefresh className="mr-2 text-lg" />
                  Refresh
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <FaDownload className="mr-2 text-lg" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Campaign Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mx-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <FiMail className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Email Template</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-medium mx-[7px]">{campaign.emailTemplateName}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <FiGlobe className="text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Landing Page</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-medium mx-[7px]">{campaign.landingPageName}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <MdSend className="text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Sending Profile</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-medium mx-[7px]">{campaign.sendingProfileName}</p>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8 mx-4">
            <EnhancedMetricCard
              title="Participant(s)"
              value={campaign.total_participants || 0}
              icon={<MdGroup className="text-2xl text-blue-600 dark:text-blue-400" />}
              color="blue"
            />
            
            <EnhancedMetricCard
              title="Email Sent"
              value={campaign.email_sent}
              icon={<div className='bg-green-500/10 px-3 py-3 rounded-lg'><HiOutlineMail className="text-xl text-green-400" /></div>}
              color=""
              />
            
            <EnhancedMetricCard
              title="Opened"
              value={campaign.email_opened}
              icon={<div className='bg-yellow-500/10 px-3 py-3 rounded-lg'><HiOutlineMailOpen className="text-xl text-yellow-600" /></div>}
              color=""
            />
            
            <EnhancedMetricCard
              title="Clicked"
              value={campaign.email_clicks}
              icon={<div className='bg-blue-500/10 px-3 py-3 rounded-lg'><LuMousePointerClick className="text-2xl text-blue-600" /></div>}
              color=""
              />
            
            <EnhancedMetricCard
              title="Submitted"
              value={campaign.email_submitted}
              icon={<div className='bg-cyan-500/10 px-3 py-3 rounded-lg'><IoIosSave className="text-2xl text-cyan-600" /></div>}
              color=""
              />
            
            <EnhancedMetricCard
              title="Reported"
              value={campaign.email_reported}
              icon={<div className='bg-red-500/10 px-3 py-3 rounded-lg'><BiError className="text-2xl text-red-600" /></div>}
              color=""
            />
          </div>

          {/* Campaign Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 mb-8 mx-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <MdSchedule className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Campaign Timeline</h2>
            </div>
            <CampaignTimeline campaign={campaign} />
          </div>

          {/* Participants Table */}
          <div className="mb-8 mx-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <MdGroup className="text-purple-600 dark:text-purple-400 text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Participants Details</h2>
              </div>
            </div>
            <ParticipantsTable participants={campaign.participants || []} />
          </div>

        </div>
      </div>
    </>
  );
};

export default CampaignDetail;