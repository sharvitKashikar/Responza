import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const Header: React.FC = () => {
  const { profile } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Emergency Services
          </h1>
          <div className="flex items-center">
            <div className="ml-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {profile ? `${profile.first_name} ${profile.last_name}` : 'Admin'}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  Administrator
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
