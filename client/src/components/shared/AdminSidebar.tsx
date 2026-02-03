import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  WrenchScrewdriverIcon,
  UsersIcon,
  UserGroupIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store';
import { cn } from '../../utils/helpers';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Issues', href: '/admin/issues', icon: WrenchScrewdriverIcon },
    { name: 'Technicians', href: '/admin/technicians', icon: UserGroupIcon },
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Inventory', href: '/admin/inventory', icon: CubeIcon },
    { name: 'Find Technicians', href: '/admin/find-technicians', icon: MagnifyingGlassIcon },
  ];

  return (
    <div className="flex flex-col h-screen w-64 bg-indigo-600 text-white">
      <div className="flex items-center justify-center h-16 bg-indigo-700">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="mt-6 px-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center px-4 py-3 mb-2 rounded-lg transition-colors',
                  isActive
                    ? 'bg-indigo-700 text-white'
                    : 'text-indigo-100 hover:bg-indigo-700'
                )}
              >
                <item.icon className="h-6 w-6 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-indigo-700">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-800 flex items-center justify-center">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-indigo-300">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};
