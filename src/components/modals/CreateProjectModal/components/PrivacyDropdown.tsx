import React from 'react';
import { ChevronDown } from 'lucide-react';
import { PrivacyOption } from '../types';
import { PRIVACY_OPTIONS } from '../constants';

interface PrivacyDropdownProps {
    selectedPrivacy: PrivacyOption;
    isOpen: boolean;
    onSelect: (privacy: PrivacyOption) => void;
    onToggle: (open: boolean) => void;
}

export const PrivacyDropdown: React.FC<PrivacyDropdownProps> = ({
    selectedPrivacy,
    isOpen,
    onSelect,
    onToggle
}) => {
    return (
        <div className="relative">
            <button
                onClick={() => onToggle(!isOpen)}
                className="w-full p-5 rounded-xl border-2 bg-gray-800/60 backdrop-blur-sm border-gray-600/50 flex items-center justify-between transition-all duration-300 text-lg text-white hover:border-gray-500/70 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-lg"
                type="button"
            >
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                        <span className="text-2xl">{selectedPrivacy.icon}</span>
                    </div>
                    <div className="text-left">
                        <div className="font-semibold">{selectedPrivacy.label}</div>
                        <div className="text-sm text-gray-400">{selectedPrivacy.description}</div>
                    </div>
                </div>
                <ChevronDown 
                    className={`w-5 h-5 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                    }`} 
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 border-2 rounded-xl shadow-2xl z-50 bg-gray-900/95 backdrop-blur-sm border-gray-600/50 overflow-hidden">
                    {PRIVACY_OPTIONS.map((option, index) => (
                        <button
                            key={option.id}
                            onClick={() => onSelect(option)}
                            className={`w-full p-4 text-left hover:bg-gray-800/80 transition-all duration-200 ${
                                selectedPrivacy.id === option.id 
                                    ? 'bg-blue-500/20 border-l-4 border-blue-500' 
                                    : ''
                            } ${
                                index !== PRIVACY_OPTIONS.length - 1 
                                    ? 'border-b border-gray-700/50' 
                                    : ''
                            }`}
                            type="button"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                                    <span className="text-xl">{option.icon}</span>
                                </div>
                                <div>
                                    <div className="font-semibold text-white">{option.label}</div>
                                    <div className="text-sm text-gray-400">{option.description}</div>
                                </div>
                                {selectedPrivacy.id === option.id && (
                                    <div className="ml-auto">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};