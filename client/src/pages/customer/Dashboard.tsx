import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/shared/Card';
import { Badge } from '../../components/shared/Badge';
import { Loading } from '../../components/shared/Loading';
import { Navbar } from '../../components/shared/Navbar';
import { BottomNav } from '../../components/shared/BottomNav';
import { issueService } from '../../services/issue.service';
import { Issue } from '../../types';
import { formatDate } from '../../utils/helpers';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

export const CustomerDashboard: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    try {
      const data = await issueService.getMyIssues();
      setIssues(data);
    } catch (error) {
      console.error('Error loading issues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'warning',
      assigned: 'info',
      accepted: 'info',
      'in-progress': 'primary',
      completed: 'success',
      rejected: 'danger',
    };
    return variants[status] || 'secondary';
  };

  const getPriorityVariant = (priority: string) => {
    const variants: Record<string, any> = {
      low: 'secondary',
      medium: 'info',
      high: 'warning',
      urgent: 'danger',
    };
    return variants[priority] || 'secondary';
  };

  const filteredIssues = issues.filter((issue) => {
    if (filter === 'all') return true;
    return issue.status === filter;
  });

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Service Requests</h1>
          <button
            onClick={() => navigate('/customer/create-issue')}
            className="md:hidden bg-emerald-900 text-white p-3 rounded-full shadow-lg"
          >
            <PlusCircleIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {['all', 'pending', 'assigned', 'in-progress', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                filter === status
                  ? 'bg-emerald-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {filteredIssues.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No service requests found</p>
              <button
                onClick={() => navigate('/customer/create-issue')}
                className="mt-4 px-6 py-3 bg-emerald-900 text-white rounded-lg hover:bg-emerald-800"
              >
                Create Your First Request
              </button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue) => (
              <Card
                key={issue._id}
                onClick={() => navigate(`/customer/issues/${issue._id}`)}
                className="cursor-pointer hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {issue.applianceType}
                  </h3>
                  <Badge variant={getStatusVariant(issue.status)}>
                    {issue.status}
                  </Badge>
                </div>
                {issue.brand && (
                  <p className="text-sm text-gray-600 mb-2">
                    Brand: {issue.brand} {issue.model && `(${issue.model})`}
                  </p>
                )}
                <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                  {issue.description}
                </p>
                <div className="flex justify-between items-center">
                  <Badge variant={getPriorityVariant(issue.priority)} size="sm">
                    {issue.priority}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatDate(issue.createdAt)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};
