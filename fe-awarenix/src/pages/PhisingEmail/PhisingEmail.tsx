import { useState } from 'react';
import { Search, ChevronDown, Lock, FileText } from 'lucide-react';
import { MailIcon } from '../../icons';
import Breadcrump from '../../components/utils/Breacrump';

const PhishingEmail = () => {
  const [selectedCards, setSelectedCards] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState('Easy OR Moderate');
  const [sortBy, setSortBy] = useState('Popularity (Most to Least)');

  const phishingCards = [
    {
      id: 'qr-code-office-365',
      title: 'QR-Code-Office-365',
      type: 'Global',
      isPremium: true,
      content: {
        heading: 'Your organization requires Multi-Factor Authentication. Your account has been temporarily blocked.',
        sender: 'john.ldoe@mybusiness[.]com',
        service: 'Office 365',
        requirement: 'Multi-Factor OTP Auth Required',
        description: 'Scan the QR code to get started',
        subtext: 'Use your phone camera app to scan the QR code. This will start the process of verifying your account with Microsoft.',
        hasQRCode: true
      }
    },
    {
      id: 'office365-password-reset',
      title: 'Office365-Password-Reset',
      type: 'Global',
      isPremium: true,
      content: {
        code: '027620',
        heading: 'Submit this code to reset your account',
        message: 'Thank you for helping us keep your account safe.',
        footer: 'The team at Microsoft',
        timeArea: 'Time and area',
        date: 'Date: {{DateTime:Now}}',
        operatingSystem: 'Operating System'
      }
    },
    {
      id: 'docusign-document',
      title: 'DocuSign-Sign-Document',
      type: 'Global',
      interactionRate: '23%',
      payload: 'Website',
      content: {
        service: 'DocuSign',
        message: 'Payroll sent you a document to review and sign',
        actionButton: 'REVIEW DOCUMENT',
        hasDocumentIcon: true
      }
    }
  ];

  const handleCardSelection = (cardId: string, action: string) => {
    setSelectedCards(prev => ({
      ...prev,
      [cardId]: action
    }));
  };

  type PhishingCard = typeof phishingCards[number];

  const renderCard = (card: PhishingCard) => {
    const isSelected = selectedCards[card.id];
    
    return (
      <div key={card.id} className="bg-white dark:bg-gray-900 dark:border-gray-600 rounded-lg shadow-md overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-gray-50 border-b dark:bg-gray-900">
          <h3 className="font-medium dark:text-gray-300">{card.title}</h3>
          <span className="text-sm text-gray-600">{card.type}</span>
        </div>

        {/* Premium Badge */}
        {card.isPremium && (
          <div className="bg-green-500 text-white text-center py-2 font-medium flex items-center justify-center gap-1">
            <Lock size={16} />
            Premium
          </div>
        )}

        <img src="/images/phising-material/quarantine.png" alt="" />

        {/* Content */}
        <div className="p-4">
          {card.id === 'qr-code-office-365' && (
            <div className="space-y-4">
              <div className="text-center text-green-600 font-medium">
                {card.content.heading}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">{card.content.sender}</span>
                <span>{card.content.service}</span>
              </div>
              <div className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded">
                {card.content.requirement}
              </div>
              <div className="text-center">
                <Lock size={48} className="mx-auto text-gray-400 mb-2" />
                <h4 className="font-medium">{card.content.description}</h4>
                <p className="text-sm text-gray-600 mt-2">{card.content.subtext}</p>
              </div>
            </div>
          )}

          {card.id === 'office365-password-reset' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800 mb-2">{card.content.code}</div>
                <div className="text-blue-600 underline cursor-pointer">{card.content.heading}</div>
              </div>
              <div className="text-center">
                <Lock size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm">{card.content.message}</p>
                <p className="text-sm font-medium">{card.content.footer}</p>
              </div>
              <div className="text-sm text-gray-600">
                <div className="font-medium">{card.content.timeArea}</div>
                <div>{card.content.date}</div>
                <div className="mt-2 font-medium">{card.content.operatingSystem}</div>
              </div>
            </div>
          )}

          {card.id === 'docusign-document' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-4">
                <div className="text-2xl font-bold">DocuSign</div>
              </div>
              <div className="bg-blue-900 text-white p-6 rounded text-center">
                <FileText size={48} className="mx-auto mb-4 text-blue-200" />
                <p className="mb-4">{card.content.message}</p>
                <button className="bg-yellow-500 text-black px-6 py-2 rounded font-medium hover:bg-yellow-400 transition-colors">
                  {card.content.actionButton}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex border-t">
          <button
            onClick={() => handleCardSelection(card.id, 'update')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              isSelected === 'update' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            Email Address
            <div className="text-xs mt-1">Update</div>
          </button>
          
          {card.content.sender && (
            <button
              onClick={() => handleCardSelection(card.id, 'duplicate')}
              className={`flex-1 py-3 text-center font-medium border-l transition-colors ${
                isSelected === 'duplicate'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-400 text-white hover:bg-gray-500'
              }`}
            >
              First Name
              <div className="text-xs mt-1">Duplicate</div>
            </button>
          )}
          
          <button
            onClick={() => handleCardSelection(card.id, 'duplicate')}
            className={`flex-1 py-3 text-center font-medium border-l transition-colors ${
              isSelected === 'duplicate'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-400 text-white hover:bg-gray-500'
            }`}
          >
            {card.content.sender ? 'Email Address' : 'Email Address'}
            <div className="text-xs mt-1">Duplicate</div>
          </button>
          
          <button
            onClick={() => handleCardSelection(card.id, 'delete')}
            className={`flex-1 py-3 text-center font-medium border-l transition-colors ${
              isSelected === 'delete'
                ? 'bg-red-500 text-white'
                : 'bg-gray-400 text-white hover:bg-gray-500'
            }`}
          >
            <div className="text-xs">Delete</div>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Breadcrump icon={<MailIcon/>} title="Phising Email" />

        {/* Controls */}
        <div className="flex gap-4 mb-6 flex-wrap">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Filter</label>
            <div className="relative">
              <select 
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="appearance-none bg-white border dark:bg-gray-900 dark:border-gray-500 dark:text-gray-400 border-gray-300 rounded px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Easy OR Moderate</option>
                <option>Easy</option>
                <option>Moderate</option>
                <option>Hard</option>
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-500">Sort</label>
            <div className="relative">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-300 dark:bg-gray-900 dark:text-gray-400  dark:border-gray-500 rounded px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Popularity (Most to Least)</option>
                <option>Popularity (Least to Most)</option>
                <option>Name (A-Z)</option>
                <option>Name (Z-A)</option>
                <option>Date Created</option>
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Search</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type the name of a phish"
                className="pl-8 pr-4 py-2 border dark:text-gray-300 border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
              <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 ">
          {phishingCards
            .filter(card => 
              searchTerm === '' || 
              card.title.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(renderCard)
          }
        </div>
      </div>
    </div>
  );
};

export default PhishingEmail;