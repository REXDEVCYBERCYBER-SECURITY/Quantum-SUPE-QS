
import React from 'react';
import { ShoppingCart, Star, Tag, Download } from 'lucide-react';

const products = [
  {
    id: '1',
    name: 'Fiber-Network Statistics Core',
    description: 'Advanced dashboard templates for monitoring high-speed fiber data statistics.',
    price: 49.99,
    category: 'PREMIUM',
    image: 'https://picsum.photos/seed/cyber1/600/400'
  },
  {
    id: '2',
    name: 'Secure-Login Boilerplate',
    description: 'OAuth2 and JWT based authentication system for secure account portals.',
    price: 0,
    category: 'FREE',
    image: 'https://picsum.photos/seed/cyber2/600/400'
  },
  {
    id: '3',
    name: 'Vulnerability Scanner Kit',
    description: 'Pre-configured scripts for automated network port and vulnerability assessment.',
    price: 89.00,
    category: 'PREMIUM',
    image: 'https://picsum.photos/seed/cyber3/600/400'
  },
  {
    id: '4',
    name: 'Investigation Log Toolkit',
    description: 'Tools for forensics and investigating data breaches in local networks.',
    price: 0,
    category: 'FREE',
    image: 'https://picsum.photos/seed/cyber4/600/400'
  }
];

const ProductStore: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-4 md:space-y-0">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2">The REX Store</h2>
          <p className="text-gray-400">Quality templates and practical security tools for everyone.</p>
        </div>
        <div className="flex space-x-4">
          <div className="px-4 py-2 glass-card rounded-lg flex items-center space-x-2 text-sm text-gray-300">
            <Tag className="w-4 h-4 text-emerald-400" />
            <span>Premium Assets</span>
          </div>
          <div className="px-4 py-2 glass-card rounded-lg flex items-center space-x-2 text-sm text-gray-300">
            <Download className="w-4 h-4 text-blue-400" />
            <span>Open Source</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <div key={product.id} className="glass-card group rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all flex flex-col">
            <div className="relative aspect-video overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                  product.category === 'FREE' ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-black'
                }`}>
                  {product.category}
                </span>
              </div>
            </div>
            
            <div className="p-6 flex-grow flex flex-col">
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                {product.name}
              </h3>
              <p className="text-gray-400 text-sm mb-6 flex-grow">
                {product.description}
              </p>
              
              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="font-mono text-xl font-bold text-white">
                  {product.price === 0 ? 'FREE' : `$${product.price}`}
                </div>
                <button className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all">
                  {product.price === 0 ? <Download className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductStore;
