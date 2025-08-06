import React, { useState } from 'react';
import userIcon from '../../assets/user_icon.png';

const AccountDetails = ({ isOpen, onClose, onLogout }) => {
  const [userInfo] = useState({
    name: 'Sahil Kumar Singh',
    email: 'sahil@citycompass.com',
    phone: '+91 98765 43210',
    location: 'Pune, Maharashtra',
    joinedDate: 'January 2024',
    totalTrips: 47,
    favoriteMode: 'Metro/Train'
  });

  const [activeTab, setActiveTab] = useState('profile');

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Account Details Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        <div 
          className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20"
          style={{ width: '420px', maxHeight: '600px' }}
        >
          {/* Header */}
          <div className="relative p-6 pb-4 border-b border-gray-200/50">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src={userIcon} 
                  alt="User Avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-500/20"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{userInfo.name}</h2>
                <p className="text-gray-600 text-sm">{userInfo.email}</p>
                <p className="text-green-600 text-xs flex items-center gap-1 mt-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Active now
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200/50">
            {['profile', 'stats', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab 
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 max-h-80 overflow-y-auto">
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</label>
                    <p className="text-gray-800 mt-1">{userInfo.phone}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</label>
                    <p className="text-gray-800 mt-1">{userInfo.location}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Member Since</label>
                  <p className="text-gray-800 mt-1">{userInfo.joinedDate}</p>
                </div>

                <div className="pt-4 border-t border-gray-200/50">
                  <button 
                    onClick={onLogout}
                    className="w-full p-3 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">{userInfo.totalTrips}</div>
                    <div className="text-blue-600 text-sm">Total Trips</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">12</div>
                    <div className="text-green-600 text-sm">This Month</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Favorite Transport</div>
                  <div className="font-semibold text-purple-700">{userInfo.favoriteMode}</div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-800 mb-3">Recent Activity</h3>
                  <div className="space-y-2">
                    {[
                      { route: 'Dighi → Airport', time: '2 hours ago', mode: 'Bus' },
                      { route: 'Camp → Railway Station', time: 'Yesterday', mode: 'Metro' },
                      { route: 'Hinjewadi → Koregaon Park', time: '2 days ago', mode: 'Car' }
                    ].map((trip, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-600">{trip.mode}</span>
                          <div>
                            <div className="font-medium text-sm text-gray-800">{trip.route}</div>
                            <div className="text-xs text-gray-500">{trip.time}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-800 mb-3">Preferences</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Location Services</span>
                      <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Push Notifications</span>
                      <div className="w-12 h-6 bg-gray-300 rounded-full relative cursor-pointer">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Dark Mode</span>
                      <div className="w-12 h-6 bg-gray-300 rounded-full relative cursor-pointer">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200/50">
                  <div className="space-y-3">
                    <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 text-sm transition-colors">
                      Privacy & Security
                    </button>
                    <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 text-sm transition-colors">
                      Connected Devices
                    </button>
                    <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 text-sm transition-colors">
                      Billing & Payments
                    </button>
                    <button 
                      onClick={onLogout}
                      className="w-full text-left p-3 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 text-sm transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountDetails;
