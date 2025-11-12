import React from 'react';


interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  ariaLabel?: string;
}

const ToolCard: React.FC<ToolCardProps> = ({ icon, title, description, onClick, ariaLabel }) => {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-start text-left bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 rounded-3xl shadow-2xl hover:shadow-3xl dark:shadow-green-900 dark:hover:shadow-green-800 hover:-translate-y-2 hover:scale-105 transition-all duration-300 border border-gray-200/80 dark:border-green-900 hover:border-green-400 dark:hover:border-green-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-400/60"
      aria-label={ariaLabel || title}
      tabIndex={0}
      style={{ perspective: '800px' }}
    >
      <div className="p-4 bg-gradient-to-tr from-green-200 via-green-100 to-green-50 dark:from-green-900 dark:via-green-800 dark:to-gray-900 rounded-xl text-green-700 dark:text-green-300 mb-4 transition-colors duration-300 group-hover:bg-green-600 group-hover:text-white dark:group-hover:bg-green-600 dark:group-hover:text-white shadow-lg group-hover:rotate-y-6" style={{ transform: 'rotateY(0deg)', transition: 'transform 0.3s' }}>
        {icon}
      </div>
      <h3 className="font-extrabold text-xl text-gray-800 dark:text-green-200 mb-2 drop-shadow-lg group-hover:scale-105 transition-transform duration-300">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-base flex-grow group-hover:text-green-900 dark:group-hover:text-green-100 transition-colors duration-300">{description}</p>
      <div className="mt-4 text-green-700 dark:text-green-300 font-semibold text-base flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="drop-shadow">Open Tool</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </button>
  );
};

export default ToolCard;