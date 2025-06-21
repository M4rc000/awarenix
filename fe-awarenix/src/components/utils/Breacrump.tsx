import { ReactNode } from "react";

interface BreadcrumpProps {
  title: string;
  icon: ReactNode;
  className?: string;
}

export default function Breadcrump({ title, icon, className = "" }: BreadcrumpProps) {
  return (
    <h3 className={`flex items-center text-xl font-bold mb-5 dark:text-white ${className}`}>
      <span className="mr-2 dark:text-white">{icon}</span>
      {title}
    </h3>
  );
}
