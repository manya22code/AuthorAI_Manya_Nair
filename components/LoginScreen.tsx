import React from 'react';
import { LogIn } from 'lucide-react';

interface LoginScreenProps {
    onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin();
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in">
            <div className="w-full max-w-md bg-base-200 p-8 rounded-2xl shadow-2xl">
                <div className="text-center mb-8">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mx-auto mb-4">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                        <path d="M2 17l10 5 10-5"></path>
                        <path d="M2 12l10 5 10-5"></path>
                    </svg>
                    <h1 className="text-3xl font-bold text-base-content">AuthorAI</h1>
                    <p className="text-base-content/70 mt-2">Welcome back! Please sign in to continue.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-base-content/80 mb-2">Username</label>
                        <input 
                            type="text" 
                            id="username" 
                            defaultValue="demo.user"
                            className="w-full p-3 bg-base-300 rounded-md focus:ring-2 focus:ring-primary outline-none" 
                        />
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-base-content/80 mb-2">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            defaultValue="password"
                            className="w-full p-3 bg-base-300 rounded-md focus:ring-2 focus:ring-primary outline-none" 
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary-focus text-primary-content font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-transform transform hover:scale-105"
                    >
                        <LogIn className="mr-2 h-5 w-5" />
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginScreen;