import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div
      className={`rounded-tl-md rounded-tr-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden ${className ?? ""}`}
    >
      {children}
    </div>
  );
};

export default Card;