import React from 'react';

const GlobalLoadingSpinner: React.FC = () => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-[100] flex justify-center items-center animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-primary"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default GlobalLoadingSpinner;
