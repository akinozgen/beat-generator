import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Navigation from './components/Navigation';
import VirtualPiano from './components/Piano';
import BinauralBeatGenerator from './components/BeatGenerator';
import AlarmClock from './components/AlarmClock';
import CodeEditor from './components/CodeEditor';
import About from './components/About';
import { Piano, Waves, Clock, Code2, Search, Filter, Twitter, Mail, Github } from 'lucide-react';

const TOOLS = [
  {
    name: 'Virtual Piano',
    description: 'Play music with your keyboard',
    icon: Piano,
    path: '/piano',
    category: 'audio'
  },
  {
    name: 'Beat Generator',
    description: 'Generate binaural beats',
    icon: Waves,
    path: '/beats',
    category: 'audio'
  },
  {
    name: 'Alarm Clock',
    description: 'Set alarms and timers',
    icon: Clock,
    path: '/alarm',
    category: 'tools'
  },
  {
    name: 'Code Editor',
    description: 'Browser based code editor',
    icon: Code2,
    path: '/editor',
    category: 'development'
  }
];

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get unique categories
  const categories = ['all', ...new Set(TOOLS.map(tool => tool.category))];

  // Filter tools based on search and category
  const filteredTools = TOOLS.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-white">
      <div className="flex items-center gap-2 p-4 text-cyan-400">
        <span className="text-sm">🧪 useless.fun</span>
        <span className="text-xs text-cyan-400/50">Experiments in digital curiosity</span>
      </div>
      <Navigation />
      <div className="flex-1 flex flex-col pt-16">
        <Routes>
          <Route 
            path="/"
            element={
              <div className="flex-1 flex">
                {/* Sidebar */}
                <div className="w-64 border-r border-cyan-500/10 p-4 space-y-6">
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/50" />
                    <input
                      type="text"
                      placeholder="Search tools..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-cyan-500/5 border border-cyan-500/10 rounded-lg text-sm focus:outline-none focus:border-cyan-500/20"
                    />
                  </div>

                  {/* Categories */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-cyan-400/70 px-2">
                      <Filter className="w-4 h-4" />
                      <h2 className="text-xs font-medium uppercase tracking-wider">Categories</h2>
                    </div>
                    <div className="space-y-1">
                      {categories.map(category => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                            selectedCategory === category 
                              ? 'bg-cyan-500/10 text-cyan-400' 
                              : 'text-cyan-400/70 hover:bg-cyan-500/5'
                          }`}
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8">
                  <div className="max-w-7xl mx-auto">
                    {/* Grid of Tools */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredTools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <button
                            key={tool.path}
                            onClick={() => navigate(tool.path)}
                            className="text-left p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10 hover:bg-cyan-500/10 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                <Icon className="w-5 h-5 text-cyan-400" />
                              </div>
                              <div>
                                <div className="font-medium">{tool.name}</div>
                                <div className="text-sm text-white/50">{tool.description}</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            } 
          />
          <Route path="/piano" element={<VirtualPiano />} />
          <Route path="/beats" element={<BinauralBeatGenerator />} />
          <Route path="/alarm" element={<AlarmClock />} />
          <Route path="/editor" element={<CodeEditor />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
      {location.pathname === '/' && (
        <footer className="border-t border-cyan-500/10 mt-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <a 
                  href="https://twitter.com/akin0zgen" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-400/50 hover:text-cyan-400 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a 
                  href="mailto:akinozgen@protonmail.com"
                  className="text-cyan-400/50 hover:text-cyan-400 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
              
              <div className="text-sm text-cyan-400/50">
                built with <span className="text-blue-400">💙</span> by{' '}
                <a 
                  href="https://github.com/akinozgen" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  @akinozgen
                </a>
              </div>

              <a 
                href="https://github.com/akinozgen/uselessfun" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cyan-400/50 hover:text-cyan-400 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
