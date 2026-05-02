import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FileText, 
  Zap, 
  BarChart3, 
  AlertCircle, 
  Search,
  Settings,
  Plus,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'workspace', label: 'Workspace', icon: FileText },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'risks', label: 'Risk Oracle', icon: AlertCircle },
    { id: 'automation', label: 'Workflow', icon: Zap },
  ];

  return (
    <div className="flex h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="border-r border-[#E5E1DA] bg-white flex flex-col overflow-hidden"
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#1A1A1A] rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="font-bold text-xl tracking-tight">Newton</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-[#1A1A1A] rounded flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-lg">N</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors group ${
                  isActive ? 'bg-[#F3F0EC] text-[#1A1A1A]' : 'text-[#706E6B] hover:bg-[#F9F8F6] hover:text-[#1A1A1A]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#1A1A1A]' : 'group-hover:text-[#1A1A1A]'}`} />
                {isSidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#E5E1DA]">
          <div className="flex items-center gap-3">
            <img src={user?.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-[#E5E1DA]" />
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.displayName}</p>
                <button onClick={onLogout} className="text-xs text-[#706E6B] hover:text-red-500">Sign out</button>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-bottom border-[#E5E1DA] bg-white flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-[#F3F0EC] rounded-lg">
              <Menu className="w-5 h-5 text-[#706E6B]" />
            </button>
            <div className="relative max-w-xl w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A09E9B]" />
              <input 
                type="text" 
                placeholder="Ask Newton... (e.g. 'What is Project Orion's status?')" 
                className="w-full bg-[#F3F0EC] border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-[#1A1A1A] transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-[#F3F0EC] rounded-lg relative">
              <Bell className="w-5 h-5 text-[#706E6B]" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="bg-[#1A1A1A] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-black transition-colors">
              <Plus className="w-4 h-4" />
              <span>Quick Intake</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Layout;
