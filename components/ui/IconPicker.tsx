import React, { useState, useRef, useEffect } from 'react';
import { iconMap } from '../Icons';
import { useLocalization } from '../../contexts/LocalizationContext';

// Helper to translate icon names with a fallback to the original name.
// Defined outside the component to ensure it's a stable, pure function.
const getTranslatedIconName = (t: (key: string, params?: { [key: string]: string | number; } | undefined) => string, iconName: string): string => {
    const key = `icons.${iconName}`;
    const translated = t(key, { defaultValue: iconName });
    // The t function returns the key if not found, so we check that
    return translated === key ? iconName : translated;
};

const ChevronDownIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ value, onChange }) => {
    const { t } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);
    const SelectedIcon = iconMap[value] || null;
    const translatedValue = getTranslatedIconName(t, value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [pickerRef]);

    const handleSelect = (iconName: string) => {
        onChange(iconName);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full md:w-48" ref={pickerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/80 p-2 rounded-md border border-gray-300 dark:border-gray-600 transition-colors w-full justify-between"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-2">
                    {SelectedIcon && <SelectedIcon className="w-5 h-5" />}
                    <span className="truncate">{translatedValue}</span>
                </div>
                <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-20 mt-1 w-[280px] bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-2 animate-fade-in">
                    <div className="grid grid-cols-6 gap-1">
                        {Object.entries(iconMap).map(([name, IconComponent]) => (
                            <button
                                key={name}
                                type="button"
                                onClick={() => handleSelect(name)}
                                className={`flex items-center justify-center p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${value === name ? 'bg-primary/10 text-primary' : ''}`}
                                aria-label={getTranslatedIconName(t, name)}
                                title={getTranslatedIconName(t, name)}
                            >
                                <IconComponent className="w-6 h-6" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};