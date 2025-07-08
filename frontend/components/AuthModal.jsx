import { useState, useEffect } from "react";
import { Dialog, Tab } from '@headlessui/react';
import AuthForm from './AuthForm';

export default function AuthModal({ open, onClose, defaultTab = 'login', onLogin, onRegister, loading, error }) {
  const [tab, setTab] = useState(defaultTab === 'register' ? 1 : 0);

  useEffect(() => {
    setTab(defaultTab === 'register' ? 1 : 0);
  }, [defaultTab, open]);

  return (
    <Dialog open={open} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-auto p-6 z-10">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
          <Tab.Group selectedIndex={tab} onChange={setTab}>
            <Tab.List className="flex space-x-2 mb-6">
              <Tab className={({ selected }) =>
                `flex-1 py-2 rounded-lg font-bold text-lg ${selected ? 'bg-[#f6c453] text-[#2d1b0e]' : 'bg-gray-100 text-gray-500'}`
              }>Login</Tab>
              <Tab className={({ selected }) =>
                `flex-1 py-2 rounded-lg font-bold text-lg ${selected ? 'bg-[#f6c453] text-[#2d1b0e]' : 'bg-gray-100 text-gray-500'}`
              }>Register</Tab>
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel>
                <AuthForm mode="login" onSubmit={onLogin} loading={loading && tab === 0} error={tab === 0 ? error : undefined} />
              </Tab.Panel>
              <Tab.Panel>
                <AuthForm mode="register" onSubmit={onRegister} loading={loading && tab === 1} error={tab === 1 ? error : undefined} />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </Dialog>
  );
} 