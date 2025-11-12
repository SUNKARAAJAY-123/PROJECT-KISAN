import React from 'react';

interface ResponsiveCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const ResponsiveCard: React.FC<ResponsiveCardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white" tabIndex={0} aria-label={title}>{title}</h3>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default ResponsiveCard;