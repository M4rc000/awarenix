import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { TiPen } from "react-icons/ti";
import { HiOutlineDocumentDuplicate } from "react-icons/hi2";
import { FaRegTrashAlt } from "react-icons/fa";

const PhisingEmail = () => {
  const [selectedCards, setSelectedCards] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState('Easy OR Moderate');
  const [sortBy, setSortBy] = useState('Popularity (Most to Least)');

  const loginCards = [
    {
      id: 'QR-Code-Office-365',
      title: 'QR-Code-Office-365',
      type: 'Global',
      image: 'office365code-screenshot.png',
    },
    {
      id: 'Spam-Filter-Quarantine',
      title: 'Spam-Filter-Quarantine',
      type: 'Global',
      image: 'spam-screenshot.png',
    },
    {
      id: 'DocuSign-Sign-Document',
      title: 'DocuSign-Sign-Document',
      type: 'Global',
      image: 'docusign-screenshot.png',
    }
  ];

  const handleCardSelection = (cardId: string, action: string) => {
    setSelectedCards(prev => ({
      ...prev,
      [cardId]: action
    }));
  };

  type LoginCard = typeof loginCards[number];

  const renderCard = (card: LoginCard) => {
    const isSelected = selectedCards[card.id];
    
    return (
      <div key={card.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">{card.title}</h2>
          <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{card.type}</span>
        </div>

        {/* Content */}
        <div className="">
          <img className='w-full h-72' src={`/images/phising-emails/${card.image}`} alt={card.title} />
        </div>
        
        {/* Action Buttons */}
        <div className="bg-gray-50 dark:bg-gray-900 px-1 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-center gap-4">
          <button 
            onClick={() => handleCardSelection(card.id, 'update')}
            className={`text-sm transition-colors rounded-lg bg-yellow-600 px-4 py-2 text-white dark:hover:bg-yellow-900 ${
              isSelected === 'update' ? 'text-blue-700 font-medium' : 'text-blue-600 hover:underline hover:bg-blue-50'
            }`}
          >
            <TiPen/>
          </button>
          <button 
            onClick={() => handleCardSelection(card.id, 'duplicate')}
            className={`text-sm transition-colors rounded-lg bg-blue-600 px-4 py-2 text-white dark:hover:bg-blue-900 ${
              isSelected === 'duplicate' ? 'text-blue-700 font-medium' : 'text-blue-600 hover:underline'
            }`}
          >
            <HiOutlineDocumentDuplicate/>
          </button>
          <button 
            onClick={() => handleCardSelection(card.id, 'delete')}
            className={`text-sm transition-colors rounded-lg bg-red-600 px-4 py-2 text-white dark:hover:bg-red-900 ${
              isSelected === 'delete' ? 'text-red-700 font-medium' : 'text-red-600 hover:underline'
            }`}
          >
            <FaRegTrashAlt/>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Controls */}
        <div className="flex gap-4 mb-6 flex-wrap">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Filter</label>
            <div className="relative">
              <select 
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="appearance-none bg-white border dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700 border-gray-300 rounded px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Sort</label>
            <div className="relative">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700 border-gray-300 rounded px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type the name of a login form"
                className="pl-8 pr-4 py-2 border dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700 border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
              />
              <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loginCards
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

export default PhisingEmail;