import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  value?: string;
  label?: string;
  required?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  value = "",
  label,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0, height: 0, positionType: 'relative' as 'relative' | 'fixed' });
  const [selectedOption, setSelectedOption] = useState<Option | null>(
    options.find(opt => opt.value === value) || null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownListRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Constants for dropdown height calculation
  const OPTION_HEIGHT = 48;
  const DROPDOWN_VERTICAL_PADDING = 8;
  const MAX_DROPDOWN_HEIGHT = 240;
  const SEARCH_INPUT_HEIGHT = 44;

  // Update selected option when value prop changes (for controlled component)
  useEffect(() => {
    const newSelectedOption = options.find(opt => opt.value === value) || null;
    setSelectedOption(newSelectedOption);
  }, [value, options]);

  const calculateAndSetDropdownPosition = useCallback(() => {
    if (!selectRef.current) return;

    const rect = selectRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const requiredDropdownContentHeight = (filteredOptions.length * OPTION_HEIGHT) + DROPDOWN_VERTICAL_PADDING;
    const dropdownActualHeight = Math.min(requiredDropdownContentHeight, MAX_DROPDOWN_HEIGHT);
    
    const totalDropdownHeight = dropdownActualHeight + SEARCH_INPUT_HEIGHT; 
    const dropdownWidth = rect.width;

    let newTop, newLeft;
    const PADDING = 10;

    const currentPositionType = 'fixed';

    newTop = (viewportHeight / 2) - (totalDropdownHeight / 2);
    newLeft = (viewportWidth / 2) - (dropdownWidth / 2);

    if (newTop < PADDING) newTop = PADDING;
    if (newLeft < PADDING) newLeft = PADDING;
    if (newTop + totalDropdownHeight > viewportHeight - PADDING) {
      newTop = viewportHeight - totalDropdownHeight - PADDING;
      if (newTop < PADDING) newTop = PADDING; 
    }
    if (newLeft + dropdownWidth > viewportWidth - PADDING) {
      newLeft = viewportWidth - dropdownWidth - PADDING;
      if (newLeft < PADDING) newLeft = PADDING; 
    }
    
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow >= totalDropdownHeight + PADDING && spaceBelow > spaceAbove) {
      newTop = rect.bottom + 4; 
      newLeft = rect.left;
    } else if (spaceAbove >= totalDropdownHeight + PADDING && spaceAbove > spaceBelow) {
      newTop = rect.top - totalDropdownHeight - 4; 
      newLeft = rect.left;
    }

    setDropdownPosition({
      top: newTop,
      left: newLeft,
      width: dropdownWidth,
      height: dropdownActualHeight,
      positionType: currentPositionType,
    });
  }, [filteredOptions.length, options.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    const handleResize = () => {
      if (isOpen) {
        calculateAndSetDropdownPosition(); 
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, calculateAndSetDropdownPosition]);

  useEffect(() => {
    setFilteredOptions(options.filter(opt => {
      const lbl = String(opt.label || "");
      return lbl.toLowerCase().includes(searchTerm.toLowerCase());
    }));
    setFocusedIndex(-1);
  }, [searchTerm, options]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (focusedIndex !== -1 && dropdownListRef.current) {
      const focusedElement = dropdownListRef.current.children[focusedIndex] as HTMLElement;
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    }
  }, [focusedIndex]);

  const handleSelect = (option: Option) => {
    setSelectedOption(option);
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm("");
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      calculateAndSetDropdownPosition(); 
    }
    setIsOpen(!isOpen);
    setSearchTerm("");
    setFocusedIndex(-1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex(prevIndex => 
          prevIndex < filteredOptions.length - 1 ? prevIndex + 1 : prevIndex
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex(prevIndex => 
          prevIndex > 0 ? prevIndex - 1 : 0
        );
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex !== -1 && filteredOptions[focusedIndex]) {
          handleSelect(filteredOptions[focusedIndex]);
        } else if (filteredOptions.length === 1 && searchTerm && focusedIndex === -1) {
          handleSelect(filteredOptions[0]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm("");
        selectRef.current?.focus();
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div ref={selectRef} className="relative">
        {isOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
               onClick={() => setIsOpen(false)} />
        )}
        
        {/* Select trigger button with enhanced selected state */}
        <button
          type="button"
          className={`
            h-11 w-full appearance-none rounded-lg border bg-white px-4 py-2.5 pr-11 text-sm shadow-sm text-left
            hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
            dark:bg-gray-900 dark:text-white dark:hover:border-gray-500 dark:focus:border-blue-400
            transition-all duration-200 ease-in-out border-gray-300 dark:border-gray-700
            ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20 dark:border-blue-400' : ''}
            ${className}
          `}
          onClick={toggleDropdown}
          onKeyDown={handleKeyDown} 
        >
          <div className="flex items-center">
            <span className={`flex-1 ${selectedOption ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          
          {/* Arrow icon */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Dropdown menu with portal */}
        {isOpen && createPortal(
          <div 
            ref={dropdownRef} 
            className="bg-white border p-1 border-gray-200 rounded-lg shadow-xl dark:bg-gray-800 dark:border-gray-600 overflow-hidden"
            style={{
              position: dropdownPosition.positionType,
              top: dropdownPosition.top,
              left: dropdownPosition.left, 
              width: dropdownPosition.width,
              zIndex: 9999, 
              display: 'flex', 
              flexDirection: 'column',
            }}
          >
            {/* Search Input */}
            <div className="p-1 flex-shrink-0" style={{height: SEARCH_INPUT_HEIGHT}}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown} 
              />
            </div>

            {/* Options List with enhanced visual indicators */}
            <div 
              ref={dropdownListRef}
              className="overflow-y-auto p-1" 
              style={{ 
                maxHeight: dropdownPosition.height,
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--scrollbar-thumb) var(--scrollbar-track)',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => {
                  const isSelected = selectedOption?.value === option.value;
                  const isFocused = focusedIndex === index;
                  
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`
                        w-full px-4 mb-2 mt-1 py-3 text-left text-sm transition-all duration-150 ease-in-out rounded-lg
                        flex items-center justify-between group
                        ${isSelected 
                          ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-200 shadow-sm' 
                          : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
                        }
                        ${isFocused && !isSelected ? 'bg-blue-50 border-blue-200 dark:bg-blue-800/30 dark:border-gray-600' : ''}
                        ${isFocused && isSelected ? 'ring-2 ring-green-300 dark:ring-green-600' : ''}
                      `}
                      onClick={() => handleSelect(option)}
                      onMouseEnter={() => setFocusedIndex(index)} 
                      onMouseLeave={() => setFocusedIndex(-1)} 
                    >
                      <div className="flex items-center flex-1">
                        {/* Check icon for selected option */}
                        <div className={`mr-3 flex-shrink-0 transition-opacity duration-150 ${
                          isSelected ? 'opacity-100' : 'opacity-0'
                        }`}>
                          <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        
                        <span className={`${isSelected ? 'font-semibold' : 'font-normal'}`}>
                          {option.label}
                        </span>
                      </div>
                      
                      {/* Selected badge */}
                      {isSelected && (
                        <div className="flex-shrink-0 ml-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">
                            Current
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No options found.</div>
              )}
            </div>
          </div>,
          document.body 
        )}
      </div>
    </div>
  );
};

export default Select;