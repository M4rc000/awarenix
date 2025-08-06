import React from "react";

interface SelectableCardProps {
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}

const SelectableCard: React.FC<SelectableCardProps> = ({ selected, onSelect, children }) => {
  return (
    <div
      onClick={onSelect}
      className={`border rounded-md cursor-pointer transition duration-200 ${
        selected
          ? "ring-2 ring-brand-500 dark:ring-brand-400"
          : "hover:ring-1 hover:ring-gray-300 dark:hover:ring-gray-600"
      }`}
    >
      {children}

      {/* Bottom label */}
      <div
        className={`text-sm text-center py-1 font-semibold rounded-b-md ${
          selected
            ? "bg-brand-500 text-white"
            : "bg-blue-900 text-gray-300  dark:text-blue-400"
        }`}
      >
        {selected ? "✓ Attack selected" : "Select this attack"}
      </div>
    </div>
  );
};

export default SelectableCard;