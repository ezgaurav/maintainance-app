import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/shared/Input';
import { Button } from '../../components/shared/Button';
import { FileUpload } from '../../components/shared/FileUpload';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store';
import { APPLIANCE_TYPES, WORKING_AREAS } from '../../utils/constants';

export const TechnicianRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    skills: [] as string[],
    workingAreas: [] as string[],
  });
  const [govtIdFile, setGovtIdFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleAreaToggle = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      workingAreas: prev.workingAreas.includes(area)
        ? prev.workingAreas.filter((a) => a !== area)
        : [...prev.workingAreas, area],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.skills.length === 0) {
      setError('Please select at least one skill');
      return;
    }

    if (formData.workingAreas.length === 0) {
      setError('Please select at least one working area');
      return;
    }

    if (!govtIdFile) {
      setError('Please upload your government ID');
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('role', 'technician');
      formDataToSend.append('skills', JSON.stringify(formData.skills));
      formDataToSend.append('workingAreas', JSON.stringify(formData.workingAreas));
      formDataToSend.append('govtId', govtIdFile);

      const response = await authService.registerTechnician(formDataToSend);
      login(response.token, response.user);
      navigate('/technician');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Technician Registration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Register to start receiving service jobs
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills (Select your expertise)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {APPLIANCE_TYPES.map((type) => (
                <label
                  key={type}
                  className="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={formData.skills.includes(type)}
                    onChange={() => handleSkillToggle(type)}
                    className="rounded text-emerald-900 focus:ring-emerald-500"
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Working Areas
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {WORKING_AREAS.map((area) => (
                <label
                  key={area}
                  className="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={formData.workingAreas.includes(area)}
                    onChange={() => handleAreaToggle(area)}
                    className="rounded text-emerald-900 focus:ring-emerald-500"
                  />
                  <span className="text-sm">{area}</span>
                </label>
              ))}
            </div>
          </div>
          <FileUpload
            label="Government ID (Aadhar/PAN/Driving License)"
            accept="image/*,.pdf"
            onFilesChange={(files) => setGovtIdFile(files[0] || null)}
            preview={true}
          />
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
              to="/technician/login"
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
