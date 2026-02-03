import React, { useEffect, useState } from 'react';
import { Card } from '../../components/shared/Card';
import { Badge } from '../../components/shared/Badge';
import { Loading } from '../../components/shared/Loading';
import { Button } from '../../components/shared/Button';
import { Select } from '../../components/shared/Select';
import { Modal } from '../../components/shared/Modal';
import { AdminSidebar } from '../../components/shared/AdminSidebar';
import { issueService } from '../../services/issue.service';
import { userService } from '../../services/user.service';
import { Issue, User } from '../../types';
import { formatDate } from '../../utils/helpers';

export const Issues: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [issuesData, techniciansData] = await Promise.all([
        issueService.getAllIssues(),
        userService.getTechnicians(),
      ]);
      setIssues(issuesData);
      setTechnicians(techniciansData.filter((t) => t.isVerified && !t.isBlocked));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignIssue = async () => {
    if (!selectedIssue || !selectedTechnician) return;
    setIsSubmitting(true);
    try {
      await issueService.assignIssue(selectedIssue._id, selectedTechnician);
      await loadData();
      setShowAssignModal(false);
      setSelectedIssue(null);
      setSelectedTechnician('');
    } catch (error) {
      console.error('Error assigning issue:', error);
    } finally {
      setIsSubmitting(false);
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

  const filteredIssues = issues.filter((issue) => {
    if (filter === 'all') return true;
    return issue.status === filter;
  });

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Issues Management</h1>

          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            {['all', 'pending', 'assigned', 'accepted', 'in-progress', 'completed', 'rejected'].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                    filter === status
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                </button>
              )
            )}
          </div>

          {filteredIssues.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No issues found</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredIssues.map((issue) => {
                const customer = issue.customer as User;
                const technician = issue.technician as User | undefined;
                return (
                  <Card key={issue._id}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {issue.applianceType}
                          </h3>
                          <Badge variant={getStatusVariant(issue.status)}>
                            {issue.status}
                          </Badge>
                          <Badge variant="warning" size="sm">
                            {issue.priority}
                          </Badge>
                        </div>
                        {issue.brand && (
                          <p className="text-sm text-gray-600 mb-2">
                            Brand: {issue.brand} {issue.model && `(${issue.model})`}
                          </p>
                        )}
                        <p className="text-sm text-gray-700 mb-3">{issue.description}</p>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs font-medium text-gray-600">Customer</p>
                            <p className="text-sm text-gray-900">{customer.name}</p>
                            <p className="text-xs text-gray-600">{customer.phone}</p>
                          </div>
                          {technician && (
                            <div>
                              <p className="text-xs font-medium text-gray-600">Technician</p>
                              <p className="text-sm text-gray-900">{technician.name}</p>
                              <p className="text-xs text-gray-600">{technician.phone}</p>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{issue.address}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Created: {formatDate(issue.createdAt)}
                        </p>
                      </div>
                      {issue.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedIssue(issue);
                            setShowAssignModal(true);
                          }}
                          className="ml-4 bg-indigo-600 hover:bg-indigo-700"
                        >
                          Assign
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedIssue(null);
          setSelectedTechnician('');
        }}
        title="Assign Technician"
      >
        <div className="space-y-4">
          <Select
            label="Select Technician"
            options={[
              { value: '', label: 'Choose a technician' },
              ...technicians.map((tech) => ({
                value: tech._id,
                label: `${tech.name} - ${tech.phone} (${tech.rating?.toFixed(1) || 'N/A'} ⭐)`,
              })),
            ]}
            value={selectedTechnician}
            onChange={(e) => setSelectedTechnician(e.target.value)}
          />
          <Button
            onClick={handleAssignIssue}
            isLoading={isSubmitting}
            disabled={!selectedTechnician}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            Assign Technician
          </Button>
        </div>
      </Modal>
    </div>
  );
};
