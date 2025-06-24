import { useState } from 'react';
import { IoInformationCircleOutline } from "react-icons/io5";


type TooltipProps = {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
};

const Tooltip = ({ children, content, position = 'top' }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-slate-800',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-slate-800',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-slate-800'
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-2 text-sm text-white bg-slate-800 rounded-lg shadow-lg whitespace-nowrap transition-opacity duration-200 ${positionClasses[position]}`}
        >
          {content}
          <div className={`absolute w-0 h-0 ${arrowClasses[position]}`}></div>
        </div>
      )}
    </div>
  );
};


// Label component with tooltip
type LabelWithTooltipProps = {
  children: React.ReactNode;
  tooltip?: React.ReactNode;
  required?: boolean;
};

const LabelWithTooltip = ({ children, tooltip, required = false }: LabelWithTooltipProps) => (
  <div className="flex items-center gap-2 mb-2">
    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
    {tooltip && (
      <Tooltip content={tooltip} position="right">
        <div className="cursor-help text-slate-700 dark:text-slate-400 hover:text-blue-400 transition-colors">
          <IoInformationCircleOutline className = "w-4 h-4 mt-[1px]"/>
        </div>
      </Tooltip>
    )}
  </div>
);

export default LabelWithTooltip;