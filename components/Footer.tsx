
import React from 'react';
import { Shield, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="glass-card border-t border-emerald-500/10 pt-16 pb-8 px-6 mt-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <Shield className="w-8 h-8 text-emerald-500" />
              <span className="text-2xl font-bold text-white tracking-tighter">
                REXDEV<span className="text-emerald-400">CYBER</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Building a global network for online account safety and beneficial learning resources. Quality and practical templates for the cyber-curious.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 glass-card rounded-lg hover:text-emerald-400 transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="p-2 glass-card rounded-lg hover:text-emerald-400 transition-colors"><Github className="w-4 h-4" /></a>
              <a href="#" className="p-2 glass-card rounded-lg hover:text-emerald-400 transition-colors"><Linkedin className="w-4 h-4" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Explore</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><button onClick={() => window.scrollTo({top: 0})} className="hover:text-emerald-400 transition-colors">Vulnerability Assessment</button></li>
              <li><button onClick={() => window.scrollTo({top: 0})} className="hover:text-emerald-400 transition-colors">Network Statistics</button></li>
              <li><button onClick={() => window.scrollTo({top: 0})} className="hover:text-emerald-400 transition-colors">Investigation Blogs</button></li>
              <li><button onClick={() => window.scrollTo({top: 0})} className="hover:text-emerald-400 transition-colors">Premium Products</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><button className="hover:text-emerald-400 transition-colors">Open Source tools</button></li>
              <li><button className="hover:text-emerald-400 transition-colors">Cyber Learning</button></li>
              <li><button className="hover:text-emerald-400 transition-colors">Investigation Docs</button></li>
              <li><button className="hover:text-emerald-400 transition-colors">Help Center</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Join Newsletter</h4>
            <p className="text-sm text-gray-400 mb-4">Stay updated with direct, important cyber news every day.</p>
            <div className="flex items-center bg-black/50 border border-emerald-500/20 rounded-lg p-1">
              <input 
                type="email" 
                placeholder="email@rexdevcyber.com"
                className="bg-transparent border-none focus:ring-0 text-sm px-3 flex-grow text-gray-200"
              />
              <button className="p-2 bg-emerald-500 rounded-md text-black">
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 text-xs text-gray-500 font-mono">
          <p>© 2025 REXDEVCYBER. All systems protected.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <button className="hover:text-emerald-400 transition-colors">Privacy Policy</button>
            <button className="hover:text-emerald-400 transition-colors">Terms of Service</button>
            <button className="hover:text-emerald-400 transition-colors uppercase font-bold text-emerald-500/80">License (MIT)</button>
            <a href="https://rexdevcyber.web.app" className="hover:text-emerald-400 transition-colors">Official Website</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
