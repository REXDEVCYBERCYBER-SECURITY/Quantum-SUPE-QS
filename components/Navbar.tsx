import React from 'react';
import { Shield, ShoppingBag, Radio, Cpu, BookOpen, Database, Atom } from 'lucide-react';

interface NavbarProps {
  activeTab: 'HOME' | 'STORE' | 'SCAN' | 'NEWS' | 'RESOURCES' | 'VAULT' | 'QUANTUM';
  setActiveTab: (tab: 'HOME' | 'STORE' | 'SCAN' | 'NEWS' | 'RESOURCES' | 'VAULT' | 'QUANTUM') => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'HOME', label: 'Network', icon: <Cpu className="w-4 h-4" /> },
    { id: 'VAULT', label: 'Fiber Vault', icon: <Database className="w-4 h-4" /> },
    { id: 'QUANTUM', label: 'Quantum Lab', icon: <Atom className="w-4 h-4" /> },
    { id: 'STORE', label: 'REX Store', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'SCAN', label: 'Security Test', icon: <Shield className="w-4 h-4" /> },
    { id: 'NEWS', label: 'Intelligence', icon: <Radio className="w-4 h-4" /> },
    { id: 'RESOURCES', label: 'Knowledge', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-emerald-500/20 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('HOME')}>
          <div className="bg-emerald-500 p-1.5 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            <Shield className="w-6 h-6 text-black" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">
            REXDEV<span className="text-emerald-400">CYBER</span>
          </span>
        </div>

        <div className="hidden lg:flex items-center space-x-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center space-x-2 text-sm font-bold transition-all hover:text-emerald-400 px-3 py-2 rounded-lg ${
                activeTab === item.id ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-400'
              }`}
            >
              {item.icon}
              <span className="uppercase tracking-widest text-[10px]">{item.label}</span>
            </button>
          ))}
        </div>

        <button className="hidden sm:block px-5 py-2 text-[10px] font-black border-2 border-emerald-500/50 text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-black transition-all uppercase tracking-[0.2em]">
          Access Terminal
        </button>
      </div>
    </nav>
  );
};

export default Navbar;