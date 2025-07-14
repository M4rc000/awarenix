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
  // Jika Anda tetap ingin melewati modalScrollContainerRef,
  // tambahkan kembali definisi di sini:
  // modalScrollContainerRef?: React.RefObject<HTMLDivElement>;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  value = "",
  label,
  required = false
  // Jika Anda tetap ingin melewati modalScrollContainerRef,
  // terima kembali di sini:
  // modalScrollContainerRef
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
  const OPTION_HEIGHT = 48; // Tinggi estimasi setiap item opsi
  const DROPDOWN_VERTICAL_PADDING = 8; // Padding vertikal dropdown
  const MAX_DROPDOWN_HEIGHT = 240; // Tinggi maksimum dropdown sebelum scroll
  const SEARCH_INPUT_HEIGHT = 44; // Tinggi input pencarian (estimasi, termasuk padding/margin)

  const calculateAndSetDropdownPosition = useCallback(() => {
    if (!selectRef.current) return;

    const rect = selectRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const requiredDropdownContentHeight = (filteredOptions.length * OPTION_HEIGHT) + DROPDOWN_VERTICAL_PADDING;
    const dropdownActualHeight = Math.min(requiredDropdownContentHeight, MAX_DROPDOWN_HEIGHT);
    
    // Tambahkan tinggi search input jika ada pencarian
    const totalDropdownHeight = dropdownActualHeight + SEARCH_INPUT_HEIGHT; 
    const dropdownWidth = rect.width;

    let newTop, newLeft;
    const PADDING = 10; // Padding dari tepi viewport

    // Default positioning: fixed ke tengah layar jika memungkinkan
    const currentPositionType = 'fixed'; // Selalu gunakan fixed untuk portal

    newTop = (viewportHeight / 2) - (totalDropdownHeight / 2);
    newLeft = (viewportWidth / 2) - (dropdownWidth / 2);

    // Batasi agar tidak keluar dari viewport
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
    
    // Logika untuk menempatkan di atas/bawah input jika lebih cocok
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow >= totalDropdownHeight + PADDING && spaceBelow > spaceAbove) {
      newTop = rect.bottom + 4; 
      newLeft = rect.left;
    } else if (spaceAbove >= totalDropdownHeight + PADDING && spaceAbove > spaceBelow) {
      newTop = rect.top - totalDropdownHeight - 4; 
      newLeft = rect.left;
    } 
    // Jika tidak ada cukup ruang di atas atau bawah, tetap pusatkan (sesuai perhitungan awal)
    // dan biarkan overflow-y-auto bekerja jika opsi banyak

    setDropdownPosition({
      top: newTop,
      left: newLeft,
      width: dropdownWidth,
      height: dropdownActualHeight, // Hanya tinggi konten opsi yang discroll
      positionType: currentPositionType,
    });
  }, [filteredOptions.length, options.length]); // Dependencies untuk useCallback

  // Effect untuk menangani klik di luar, resize, dan scroll modal parent
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm(""); // Reset search term on close
      }
    };

    const handleResize = () => {
      if (isOpen) {
        calculateAndSetDropdownPosition(); 
      }
    };

    // Ini adalah bagian penting untuk menutup dropdown saat modal parent di-scroll.
    // Kita perlu mendengarkan event scroll pada elemen scrollable modal.
    // const handleParentScroll = () => { // Komentar ini tetap ada sesuai permintaan
    //   if (isOpen) {
    //     setIsOpen(false);
    //     setSearchTerm("");
    //   }
    // };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    // Jika Anda ingin mempertahankan fungsionalitas penutupan dropdown saat
    // modal parent di-scroll, Anda perlu meneruskan 'modalScrollContainerRef'
    // dari komponen induk ke sini. Bagian ini dikomentari berdasarkan kode terakhir Anda,
    // yang tidak lagi menerima 'modalScrollContainerRef'.
    /*
    const modalParent = modalScrollContainerRef?.current;
    if (modalParent) {
      modalParent.addEventListener('scroll', handleParentScroll);
    }
    */
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
      /*
      if (modalParent) {
        modalParent.removeEventListener('scroll', handleParentScroll);
      }
      */
    };
  }, [isOpen, calculateAndSetDropdownPosition]); // 'modalScrollContainerRef' dihapus dari dependencies jika tidak digunakan

  // Effect untuk filtering opsi berdasarkan searchTerm
  useEffect(() => {
    setFilteredOptions(
      options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFocusedIndex(-1); // Reset focused index on search
  }, [searchTerm, options]);

  // Effect untuk memfokuskan search input saat dropdown terbuka
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Effect untuk scroll to focused option
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
    setSearchTerm(""); // Reset search term after selection
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      calculateAndSetDropdownPosition(); 
    }
    setIsOpen(!isOpen);
    setSearchTerm(""); // Reset search term when opening
    setFocusedIndex(-1); // Reset focused index
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
          // If only one option left after typing and not yet focused, select it
          handleSelect(filteredOptions[0]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm("");
        selectRef.current?.focus(); // Kembali fokus ke tombol select
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
        {/* Backdrop untuk menutup dropdown saat klik di luar */}
        {isOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
               onClick={() => setIsOpen(false)} />
        )}
        
        {/* Select trigger button */}
        <button
          type="button"
          className={`
            h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm shadow-sm text-left
            hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
            dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-500 dark:focus:border-blue-400
            transition-all duration-200 ease-in-out
            ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20 dark:border-blue-400' : ''}
            ${className}
          `}
          onClick={toggleDropdown}
          onKeyDown={handleKeyDown} 
        >
          <span className={selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          
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

            {/* Options List with custom scrollbar */}
            <div 
              ref={dropdownListRef}
              className="overflow-y-auto p-1" 
              style={{ 
                maxHeight: dropdownPosition.height,
                // Custom Scrollbar Styles
                scrollbarWidth: 'thin', // For Firefox
                scrollbarColor: 'var(--scrollbar-thumb) var(--scrollbar-track)', // For Firefox
                WebkitOverflowScrolling: 'touch' // For iOS smooth scrolling
              }}
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`
                      w-full px-4 mb-2 mt-1 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 
                      transition-colors duration-150 ease-in-out rounded-lg
                      ${selectedOption?.value === option.value 
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
                        : 'text-gray-900 dark:text-gray-100'
                      }
                      ${focusedIndex === index ? 'bg-blue-100 dark:bg-blue-800/50' : ''}
                      ${index === 0 ? 'rounded-lg' : ''}
                      ${index === filteredOptions.length - 1 ? 'rounded-lg' : ''}
                    `}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setFocusedIndex(index)} 
                    onMouseLeave={() => setFocusedIndex(-1)} 
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {selectedOption?.value === option.value && (
                        <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))
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