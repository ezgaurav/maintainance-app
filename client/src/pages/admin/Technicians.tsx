import React, { useEffect, useState } from 'react';
import { Card } from '../../components/shared/Card';
import { Badge } from '../../components/shared/Badge';
import { Loading } from '../../components/shared/Loading';
import { Button } from '../../components/shared/Button';
import { AdminSidebar } from '../../components/shared/AdminSidebar';
import { userService } from '../../services/user.service';
import { User } from '../../types';
import { StarIcon } from '@heroicons/react/24/solid';

export const Technicians: React.FC = () => {
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    try {
      const data = await userService.getTechnicians();
      setTechnicians(data);
    } catch (error) {
      console.error('Error loading technicians:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await userService.verifyTechnician(id);
      await loadTechnicians();
    } catch (error) {
      console.error('Error verifying technician:', error);
    }
  };

  const handleBlock = async (id: string, isBlocked: boolean) => {
    try {
      await userService.blockUser(id, !isBlocked);
      await loadTechnicians();
    } catch (error) {
      console.error('Error blocking technician:', error);
    }
  };

  const filteredTechnicians = technicians.filter((tech) => {
    if (filter === 'all') return true;
    if (filter === 'verified') return tech.isVerified;
    if (filter === 'unverified') return !tech.isVerified;
    if (filter === 'blocked') return tech.isBlocked;
    return true;
  });

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Technicians Management</h1>

          <div className="mb-6 flex gap-2">
            {['all', 'verified', 'unverified', 'blocked'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {filteredTechnicians.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No technicians found</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTechnicians.map((tech) => (
                <Card key={tech._id}>
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                      {tech.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{tech.name}</h3>
                      <p className="text-sm text-gray-600">{tech.phone}</p>
                      {tech.email && (
                        <p className="text-xs text-gray-500">{tech.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    {tech.isVerified ? (
                      <Badge variant="success">Verified</Badge>
                    ) : (
                      <Badge variant="warning">Unverified</Badge>
                    )}
                    {tech.isBlocked && <Badge variant="danger">Blocked</Badge>}
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center space-x-2">
                      <StarIcon className="h-5 w-5 text-yellow-400" />
                      <span className="font-medium text-gray-900">
                        {tech.rating?.toFixed(1) || 'N/A'}
                      </span>
                      <span className="text-sm text-gray-600">
                        ({tech.totalJobs || 0} jobs)
                      </span>
                    </div>
                  </div>

                  {tech.skills && tech.skills.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {tech.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="info" size="sm">
                            {skill}
                          </Badge>
                        ))}
                        {tech.skills.length > 3 && (
                          <Badge variant="secondary" size="sm">
                            +{tech.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {tech.workingAreas && tech.workingAreas.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-600 mb-1">Areas:</p>
                      <div className="flex flex-wrap gap-1">
                        {tech.workingAreas.slice(0, 2).map((area) => (
                          <Badge key={area} variant="secondary" size="sm">
                            {area}
                          </Badge>
                        ))}
                        {tech.workingAreas.length > 2 && (
                          <Badge variant="secondary" size="sm">
                            +{tech.workingAreas.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {!tech.isVerified && (
                      <Button
                        onClick={() => handleVerify(tech._id)}
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        Verify
                      </Button>
                    )}
                    <Button
                      onClick={() => handleBlock(tech._id, tech.isBlocked || false)}
                      variant={tech.isBlocked ? 'secondary' : 'danger'}
                      size="sm"
                      className="w-full"
                    >
                      {tech.isBlocked ? 'Unblock' : 'Block'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
