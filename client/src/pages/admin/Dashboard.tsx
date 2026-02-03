import React, { useEffect, useState } from 'react';
import { Card } from '../../components/shared/Card';
import { Loading } from '../../components/shared/Loading';
import { AdminSidebar } from '../../components/shared/AdminSidebar';
import { issueService } from '../../services/issue.service';
import { userService } from '../../services/user.service';
import {
  WrenchScrewdriverIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalIssues: 0,
    pendingIssues: 0,
    completedIssues: 0,
    totalTechnicians: 0,
    totalCustomers: 0,
    activeJobs: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [issues, technicians, customers] = await Promise.all([
        issueService.getAllIssues(),
        userService.getTechnicians(),
        userService.getUsers({ role: 'customer' }),
      ]);

      setStats({
        totalIssues: issues.length,
        pendingIssues: issues.filter((i) => i.status === 'pending').length,
        completedIssues: issues.filter((i) => i.status === 'completed').length,
        totalTechnicians: technicians.length,
        totalCustomers: customers.length,
        activeJobs: issues.filter(
          (i) => i.status === 'accepted' || i.status === 'in-progress'
        ).length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  const statCards = [
    {
      title: 'Total Issues',
      value: stats.totalIssues,
      icon: WrenchScrewdriverIcon,
      color: 'bg-indigo-500',
    },
    {
      title: 'Pending Issues',
      value: stats.pendingIssues,
      icon: ClockIcon,
      color: 'bg-yellow-500',
    },
    {
      title: 'Completed Issues',
      value: stats.completedIssues,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
    },
    {
      title: 'Active Jobs',
      value: stats.activeJobs,
      icon: WrenchScrewdriverIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Technicians',
      value: stats.totalTechnicians,
      icon: UsersIcon,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: UsersIcon,
      color: 'bg-pink-500',
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat) => (
              <Card key={stat.title}>
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
