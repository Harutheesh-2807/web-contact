/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { PublicWebsite } from './components/PublicWebsite';

type AppView = 'website' | 'admin-login' | 'admin-dashboard';

const MainAppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('website');

  // Handle URL hash changes for deep linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#admin' || hash === '#dashboard') {
        if (user) {
          setCurrentView('admin-dashboard');
        } else {
          setCurrentView('admin-login');
        }
      } else if (hash === '#login' || hash === '#admin-login') {
        setCurrentView('admin-login');
      } else {
        // default or #site
        if (!user && currentView === 'admin-dashboard') {
          setCurrentView('website');
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user]);

  // Redirect to dashboard upon successful user login
  useEffect(() => {
    if (user && currentView === 'admin-login') {
      setCurrentView('admin-dashboard');
      window.location.hash = '#admin';
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090b10] flex items-center justify-center text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <span className="text-xs font-mono tracking-wider text-purple-300">Initializing AuraDev Systems...</span>
        </div>
      </div>
    );
  }

  if (currentView === 'admin-dashboard') {
    if (!user) {
      // Guard: unauthenticated user trying to view dashboard is routed to login
      return (
        <AdminLogin
          onSuccess={() => {
            setCurrentView('admin-dashboard');
            window.location.hash = '#admin';
          }}
          onBackToWebsite={() => {
            setCurrentView('website');
            window.location.hash = '';
          }}
        />
      );
    }
    return (
      <AdminDashboard
        onViewPublicSite={() => {
          setCurrentView('website');
          window.location.hash = '';
        }}
      />
    );
  }

  if (currentView === 'admin-login') {
    return (
      <AdminLogin
        onSuccess={() => {
          setCurrentView('admin-dashboard');
          window.location.hash = '#admin';
        }}
        onBackToWebsite={() => {
          setCurrentView('website');
          window.location.hash = '';
        }}
      />
    );
  }

  // Default: Public Agency Portal
  return (
    <PublicWebsite
      onGoToAdmin={() => {
        if (user) {
          setCurrentView('admin-dashboard');
          window.location.hash = '#admin';
        } else {
          setCurrentView('admin-login');
          window.location.hash = '#login';
        }
      }}
    />
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
