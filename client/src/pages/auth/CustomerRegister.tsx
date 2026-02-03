import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/shared/Input';
import { Button } from '../../components/shared/Button';
import { AddressAutocomplete } from '../../components/maps/AddressAutocomplete';
import { LocationPicker } from '../../components/maps/LocationPicker';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store';

export const CustomerRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    location: { lat: 20.5937, lng: 78.9629 },
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        role: 'customer',
        address: formData.address,
        location: {
          type: 'Point',
          coordinates: [formData.location.lng, formData.location.lat],
        },
      });
      login(response.token, response.user);
      navigate('/customer');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressSelect = (address: string, lat: number, lng: number) => {
    setFormData({ ...formData, address, location: { lat, lng } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Customer Registration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create an account to book service requests
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter your phone number"
              required
            />
          </div>
          <Input
            label="Email (Optional)"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter your email"
          />
          <AddressAutocomplete
            label="Address"
            onAddressSelect={handleAddressSelect}
            placeholder="Search for your address"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Location on Map
            </label>
            <LocationPicker
              initialPosition={[formData.location.lat, formData.location.lng]}
              onLocationSelect={(lat, lng) =>
                setFormData({ ...formData, location: { lat, lng } })
              }
              height="300px"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Create a password"
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              placeholder="Confirm your password"
              required
            />
          </div>
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Register
          </Button>
          <div className="text-center">
            <Link
              to="/login"
              className="text-emerald-900 hover:text-emerald-700 font-medium"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
