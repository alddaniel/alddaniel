
import React from 'react';

interface FloatingActionButtonProps {
  label: string;
  icon: React.FC<{ className?: string }>;
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ label, icon: Icon, onClick }) => {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={onClick}
        className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-xl hover:bg-primary-hover transition-transform duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary active:scale-95"
        aria-label={label}
      >
        <Icon className="w-8 h-8" />
      </button>
    </div>
  );
};

export default FloatingActionButton;
