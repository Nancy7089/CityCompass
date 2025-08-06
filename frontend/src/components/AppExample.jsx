import React, { useState } from 'react';
import IntroPage from './intro/IntroPage';
import AccountDetails from './account/AccountDetails';

const AppExample = () => {
  const [currentView, setCurrentView] = useState('intro'); // 'intro' or 'main'
  const [showAccountDetails, setShowAccountDetails] = useState(false);

  const handleGetStarted = () => {
    setCurrentView('main');
  };

  const handleLogout = () => {
    setShowAccountDetails(false);
    setCurrentView('intro');
  };

  const handleOpenAccount = () => {
    setShowAccountDetails(true);
  };

  const handleCloseAccount = () => {
    setShowAccountDetails(false);
  };

  if (currentView === 'intro') {
    return <IntroPage onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main App Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                CityCompass
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleOpenAccount}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Account
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to your CityCompass Dashboard!
          </h2>
          <p className="text-gray-600 mb-6">
            This is your main application view. Click the Account button above to access your profile.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Plan Journey</h3>
              <p className="text-blue-600 text-sm">Find the best routes for your trip</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Live Updates</h3>
              <p className="text-green-600 text-sm">Real-time transit information</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">My Trips</h3>
              <p className="text-purple-600 text-sm">View your travel history</p>
            </div>
          </div>
        </div>
      </main>

      {/* Account Details Modal */}
      <AccountDetails 
        isOpen={showAccountDetails}
        onClose={handleCloseAccount}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default AppExample;
