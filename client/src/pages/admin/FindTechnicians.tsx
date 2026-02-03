import React, { useState } from 'react';
import { Card } from '../../components/shared/Card';
import { Badge } from '../../components/shared/Badge';
import { Loading } from '../../components/shared/Loading';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { AdminSidebar } from '../../components/shared/AdminSidebar';
import { issueService } from '../../services/issue.service';
import type { User } from '../../types';

interface TechnicianMatch {
  technician: User;
  score: number;
  distance: number;
  matchedSkills: string[];
}

export const FindTechnicians: React.FC = () => {
  const [issueId, setIssueId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TechnicianMatch[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!issueId.trim()) {
      setError('Please enter an issue ID');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults([]);

    try {
      const data = await issueService.findTechnicians(issueId);
      setResults(data);
      if (data.length === 0) {
        setError('No suitable technicians found');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to find technicians');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async (technicianId: string) => {
    if (!window.confirm('Are you sure you want to assign this technician?')) return;
    try {
      await issueService.assignIssue(issueId, technicianId);
      alert('Technician assigned successfully!');
      setIssueId('');
      setResults([]);
    } catch (error) {
      console.error('Error assigning technician:', error);
      alert('Failed to assign technician');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Find Technicians</h1>

          <Card className="mb-6">
            <p className="text-gray-600 mb-4">
              Enter an issue ID to find the best matching technicians based on skills,
              location, rating, and availability.
            </p>
            <div className="flex gap-4">
              <Input
                placeholder="Enter Issue ID"
                value={issueId}
                onChange={(e) => setIssueId(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleSearch}
                isLoading={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Search
              </Button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </Card>

          {isLoading && <Loading />}

          {!isLoading && results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Found {results.length} Technician{results.length > 1 ? 's' : ''}
              </h2>
              {results.map((match, index) => (
                <Card key={match.technician._id}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {match.technician.name}
                          </h3>
                          <Badge variant="success" size="lg">
                            Score: {match.score}%
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {match.technician.phone}
                          {match.technician.email && ` • ${match.technician.email}`}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-xs font-medium text-gray-600">Rating</p>
                            <p className="text-lg font-bold text-indigo-600">
                              {match.technician.rating?.toFixed(1) || 'N/A'} ⭐
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">Total Jobs</p>
                            <p className="text-lg font-bold text-indigo-600">
                              {match.technician.totalJobs || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">Distance</p>
                            <p className="text-lg font-bold text-indigo-600">
                              {match.distance.toFixed(1)} km
                            </p>
                          </div>
                        </div>

                        {match.matchedSkills.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-600 mb-1">
                              Matched Skills:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {match.matchedSkills.map((skill) => (
                                <Badge key={skill} variant="primary" size="sm">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {match.technician.workingAreas && (
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">
                              Working Areas:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {match.technician.workingAreas.map((area) => (
                                <Badge key={area} variant="info" size="sm">
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAssign(match.technician._id)}
                      className="ml-4 bg-indigo-600 hover:bg-indigo-700"
                    >
                      Assign
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
