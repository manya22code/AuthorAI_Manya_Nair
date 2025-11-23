import React from 'react';
import { LogOut } from 'lucide-react';

interface HeaderProps {
    onLogoClick: () => void;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick, onLogout }) => {
    return (
        <header className="bg-base-200 shadow-md">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <button onClick={onLogoClick} className="flex items-center space-x-3 cursor-pointer" aria-label="Back to dashboard">
                     <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                        <path d="M2 17l10 5 10-5"></path>
                        <path d="M2 12l10 5 10-5"></path>
                    </svg>
                    <h1 className="text-2xl font-bold text-base-content">AuthorAI</h1>
                </button>
                <button onClick={onLogout} className="bg-error hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                    <LogOut className="mr-2 h-5 w-5" />
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;