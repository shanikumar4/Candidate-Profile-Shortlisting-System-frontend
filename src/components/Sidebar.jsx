import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Zap, Sparkles, X } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Candidates', path: '/candidates', icon: Users },
    { name: 'Shortlist', path: '/shortlist', icon: Zap },
    { name: 'AI Analysis', path: '/ai', icon: Sparkles },
  ];

  return (
    <div className={`w-64 h-screen bg-navy fixed left-0 top-0 flex flex-col pt-8 border-r border-navy-heading text-white z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <div className="px-8 mb-10 flex justify-between items-center">
        <h1 className="text-2xl font-black tracking-[-0.03em]">GSSoC Hire</h1>
        <button onClick={() => setIsOpen(false)} className="md:hidden text-white/60 hover:text-white p-1">
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 flex flex-col gap-2 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'bg-navy-heading text-brand border-l-2 border-brand'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <item.icon size={18} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
