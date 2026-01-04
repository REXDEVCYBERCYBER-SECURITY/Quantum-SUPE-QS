import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import AIAssistant from './components/AIAssistant';
import ProductStore from './components/ProductStore';
import NewsFeed from './components/NewsFeed';
import Resources from './components/Resources';
import Vault from './components/Vault';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'HOME' | 'STORE' | 'SCAN' | 'NEWS' | 'RESOURCES' | 'VAULT'>('HOME');

  return (
    <div className="min-h-screen flex flex-col cyber-grid text-gray-200">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-grow pt-20">
        {activeTab === 'HOME' && (
          <>
            <Hero />
            <Dashboard />
          </>
        )}
        
        {activeTab === 'STORE' && (
          <ProductStore />
        )}
        
        {activeTab === 'SCAN' && (
          <AIAssistant />
        )}
        
        {activeTab === 'NEWS' && (
          <NewsFeed />
        )}

        {activeTab === 'RESOURCES' && (
          <Resources />
        )}

        {activeTab === 'VAULT' && (
          <Vault />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;