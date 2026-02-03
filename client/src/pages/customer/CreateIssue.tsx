import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/shared/Input';
import { Textarea } from '../../components/shared/Textarea';
import { Select } from '../../components/shared/Select';
import { Button } from '../../components/shared/Button';
import { FileUpload } from '../../components/shared/FileUpload';
import { AddressAutocomplete } from '../../components/maps/AddressAutocomplete';
import { LocationPicker } from '../../components/maps/LocationPicker';
import { Navbar } from '../../components/shared/Navbar';
import { BottomNav } from '../../components/shared/BottomNav';
import { issueService } from '../../services/issue.service';
import { APPLIANCE_TYPES, PRIORITY_LEVELS } from '../../utils/constants';

export const CreateIssue: React.FC = () => {
  const [formData, setFormData] = useState({
    applianceType: '',
    brand: '',
    model: '',
    description: '',
    priority: 'medium',
    address: '',
    location: { lat: 20.5937, lng: 78.9629 },
  });
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddressSelect = (address: string, lat: number, lng: number) => {
    setFormData({ ...formData, address, location: { lat, lng } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.applianceType) {
      setError('Please select an appliance type');
      return;
    }

    if (!formData.address) {
      setError('Please enter your address');
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('applianceType', formData.applianceType);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('model', formData.model);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('priority', formData.priority);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('location', JSON.stringify({
        type: 'Point',
        coordinates: [formData.location.lng, formData.location.lat],
      }));

      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      await issueService.createIssue(formDataToSend);
      navigate('/customer');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create issue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Service Request</h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Select
            label="Appliance Type *"
            options={[
              { value: '', label: 'Select appliance type' },
              ...APPLIANCE_TYPES.map((type) => ({ value: type, label: type })),
            ]}
            value={formData.applianceType}
            onChange={(e) => setFormData({ ...formData, applianceType: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Brand"
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="e.g., Samsung, LG, Whirlpool"
            />
            <Input
              label="Model"
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="e.g., Model number"
            />
          </div>

          <Textarea
            label="Problem Description *"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the issue in detail..."
            rows={4}
            required
          />

          <Select
            label="Priority *"
            options={PRIORITY_LEVELS.map((level) => ({
              value: level,
              label: level.charAt(0).toUpperCase() + level.slice(1),
            }))}
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            required
          />

          <FileUpload
            label="Upload Images (Optional)"
            accept="image/*"
            multiple
            maxFiles={5}
            onFilesChange={setImages}
            preview
          />

          <AddressAutocomplete
            label="Service Address *"
            onAddressSelect={handleAddressSelect}
            placeholder="Search for your address"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Location on Map *
            </label>
            <LocationPicker
              initialPosition={[formData.location.lat, formData.location.lng]}
              onLocationSelect={(lat, lng) =>
                setFormData({ ...formData, location: { lat, lng } })
              }
              height="400px"
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => navigate('/customer')}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={isLoading}>
              Submit Request
            </Button>
          </div>
        </form>
      </div>
      <BottomNav />
    </div>
  );
};
