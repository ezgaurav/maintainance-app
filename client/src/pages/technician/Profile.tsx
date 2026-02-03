import React, { useState } from 'react';
import { Card } from '../../components/shared/Card';
import { Badge } from '../../components/shared/Badge';
import { Input } from '../../components/shared/Input';
import { Button } from '../../components/shared/Button';
import { Navbar } from '../../components/shared/Navbar';
import { BottomNav } from '../../components/shared/BottomNav';
import { useAuthStore } from '../../store';
import { StarIcon } from '@heroicons/react/24/solid';

export const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleSave = () => {
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center space-x-6 mb-6">
              <div className="w-24 h-24 bg-emerald-900 text-white rounded-full flex items-center justify-center text-4xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <Badge variant="primary" size="lg" className="mt-2">
                  {user.role}
                </Badge>
                {user.isVerified && (
                  <Badge variant="success" size="sm" className="ml-2">
                    Verified
                  </Badge>
                )}
                {user.isBlocked && (
                  <Badge variant="danger" size="sm" className="ml-2">
                    Blocked
                  </Badge>
                )}
              </div>
            </div>

            {user.role === 'technician' && (
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-3xl font-bold text-emerald-900">{user.totalJobs || 0}</p>
                  <p className="text-sm text-gray-600">Total Jobs</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <StarIcon className="h-6 w-6 text-yellow-400" />
                    <p className="text-3xl font-bold text-emerald-900">
                      {user.rating?.toFixed(1) || '0.0'}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">Rating</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {isEditing ? (
                <>
                  <Input
                    label="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  <div className="flex gap-3">
                    <Button onClick={handleSave} className="flex-1">
                      Save Changes
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setIsEditing(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Phone</h3>
                    <p className="text-gray-900">{user.phone}</p>
                  </div>
                  {user.email && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Email</h3>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                  )}
                  {user.address && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Address</h3>
                      <p className="text-gray-900">{user.address}</p>
                    </div>
                  )}
                  <Button onClick={() => setIsEditing(true)} variant="secondary">
                    Edit Profile
                  </Button>
                </>
              )}
            </div>
          </Card>

          {user.role === 'technician' && user.skills && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill) => (
                  <Badge key={skill} variant="primary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {user.role === 'technician' && user.workingAreas && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Working Areas</h3>
              <div className="flex flex-wrap gap-2">
                {user.workingAreas.map((area) => (
                  <Badge key={area} variant="info">
                    {area}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};
