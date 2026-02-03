import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  WrenchScrewdriverIcon,
  ShoppingCartIcon,
  UserCircleIcon,
  PlusCircleIcon,
  ClipboardDocumentListIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  WrenchScrewdriverIcon as WrenchIconSolid,
  ShoppingCartIcon as CartIconSolid,
  UserCircleIcon as UserIconSolid,
  PlusCircleIcon as PlusIconSolid,
  ClipboardDocumentListIcon as ClipboardIconSolid,
  ShoppingBagIcon as BagIconSolid,
} from '@heroicons/react/24/solid';
import { useAuthStore } from '../../store';
import { cn } from '../../utils/helpers';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const customerNav = [
    {
      name: 'Home',
      href: '/customer',
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
    },
    {
      name: 'Create',
      href: '/customer/create-issue',
      icon: PlusCircleIcon,
      activeIcon: PlusIconSolid,
    },
    {
      name: 'Profile',
      href: '/customer/profile',
      icon: UserCircleIcon,
      activeIcon: UserIconSolid,
    },
  ];

  const technicianNav = [
    {
      name: 'Jobs',
      href: '/technician',
      icon: WrenchScrewdriverIcon,
      activeIcon: WrenchIconSolid,
    },
    {
      name: 'Shop',
      href: '/technician/shop',
      icon: ShoppingBagIcon,
      activeIcon: BagIconSolid,
    },
    {
      name: 'Cart',
      href: '/technician/cart',
      icon: ShoppingCartIcon,
      activeIcon: CartIconSolid,
    },
    {
      name: 'Orders',
      href: '/technician/orders',
      icon: ClipboardDocumentListIcon,
      activeIcon: ClipboardIconSolid,
    },
    {
      name: 'Profile',
      href: '/technician/profile',
      icon: UserCircleIcon,
      activeIcon: UserIconSolid,
    },
  ];

  const navigation = user?.role === 'customer' ? customerNav : technicianNav;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
      <nav className="flex justify-around">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = isActive ? item.activeIcon : item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex flex-col items-center py-2 px-3 text-xs',
                isActive ? 'text-emerald-900' : 'text-gray-600'
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="mt-1">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
