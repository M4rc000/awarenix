import { useState } from 'react';
import { UserProfileForm } from './UserProfileForm';
import { PhishSettingsForm } from './PhishSettingsForm';

const AccountSettingsTabs = () => {
  const [activeTab, setActiveTab] = useState('user-profile');

  const tabs = [
    {
      id: 'user-profile',
      label: 'User Profile',
      content: <UserProfileForm />,
    },
    {
      id: 'phish-settings',
      label: 'Phish Settings',
      content: <PhishSettingsForm />,
    }
  ];

  // Temukan objek tab yang aktif
  const activeTabObject = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="w-full max-w-5xl dark:bg-gray-900 border-1 border-gray-300 dark:border-gray-800 rounded-xl">
      <div className="rounded-lg p-6">
        {/* Tab Navigation */}
        <div className="flex space-x-8 border-b-1 border-b-gray-300 dark:border-b-gray-700">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 pb-4 px-1 relative transition-colors duration-200
                  ${isActive 
                    ? 'text-blue-600' 
                    : 'text-gray-400 hover:text-gray-700'
                  }
                `}
              >
                <span className="font-medium">{tab.label}</span>
                
                {/* Active tab underline */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="mt-8 rounded-lg p-6 bg-white dark:bg-gray-900">
          <div>
            {activeTabObject?.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsTabs;