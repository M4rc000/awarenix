import React from 'react';
import { Tab } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

interface TabItem {
  label: React.ReactNode;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultIndex?: number;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, defaultIndex = 0, className }) => {
  return (
    <Tab.Group defaultIndex={defaultIndex}>
      <Tab.List
        className={twMerge(
          'flex space-x-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800',
          className
        )}
      >
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            className={({ selected }) =>
              clsx(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'transition-all duration-200 ease-in-out',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                selected
                  ? 'bg-white text-blue-600 shadow dark:bg-gray-700 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600'
              )
            }
          >
            {tab.label}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className="mt-2">
        {tabs.map((tab, index) => (
          <Tab.Panel
            key={index}
            className={clsx(
              'rounded-xl bg-white p-3 dark:bg-gray-800',
              'transition-all duration-300 ease-in-out',
              'focus:outline-none'
            )}
          >
            {tab.content}
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
};

export default Tabs;