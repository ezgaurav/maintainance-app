import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/shared/Card';
import { Badge } from '../../components/shared/Badge';
import { Loading } from '../../components/shared/Loading';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { Textarea } from '../../components/shared/Textarea';
import { FileUpload } from '../../components/shared/FileUpload';
import { Modal } from '../../components/shared/Modal';
import { Navbar } from '../../components/shared/Navbar';
import { BottomNav } from '../../components/shared/BottomNav';
import { issueService } from '../../services/issue.service';
import { Issue, User } from '../../types';
import { formatDate } from '../../utils/helpers';

export const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({ date: '', time: '' });
  const [completionData, setCompletionData] = useState({
    summary: '',
    cost: '',
  });
  const [completionImages, setCompletionImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    if (!id) return;
    try {
      const data = await issueService.getIssueById(id);
      setIssue(data);
    } catch (error) {
      console.error('Error loading job:', error);
      navigate('/technician');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await issueService.acceptIssue(id);
      setShowScheduleModal(true);
      await loadJob();
    } catch (error) {
      console.error('Error accepting job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!id || !window.confirm('Are you sure you want to reject this job?')) return;
    setIsSubmitting(true);
    try {
      await issueService.rejectIssue(id);
      navigate('/technician');
    } catch (error) {
      console.error('Error rejecting job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleSubmit = async () => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await issueService.scheduleIssue(id, scheduleData);
      setShowScheduleModal(false);
      await loadJob();
    } catch (error) {
      console.error('Error scheduling job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartJob = async () => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await issueService.startIssue(id);
      await loadJob();
    } catch (error) {
      console.error('Error starting job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteSubmit = async () => {
    if (!id) return;
    if (completionImages.length < 3) {
      alert('Please upload at least 3 images');
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('summary', completionData.summary);
      formData.append('cost', completionData.cost);
      completionImages.forEach((image) => {
        formData.append('images', image);
      });
      await issueService.completeIssue(id, formData);
      setShowCompleteModal(false);
      await loadJob();
    } catch (error) {
      console.error('Error completing job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (!issue) {
    return null;
  }

  const customer = issue.customer as User;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <button
          onClick={() => navigate('/technician')}
          className="mb-4 text-emerald-900 hover:text-emerald-700 font-medium"
        >
          ← Back to Jobs
        </button>

        <Card>
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{issue.applianceType}</h1>
            <Badge variant="info" size="lg">
              {issue.status}
            </Badge>
          </div>

          <div className="space-y-4">
            {issue.brand && (
              <div>
                <h3 className="text-sm font-medium text-gray-700">Brand & Model</h3>
                <p className="text-gray-900">
                  {issue.brand} {issue.model && `- ${issue.model}`}
                </p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-700">Description</h3>
              <p className="text-gray-900">{issue.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700">Priority</h3>
              <Badge variant="warning">{issue.priority}</Badge>
            </div>

            {issue.images && issue.images.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {issue.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Issue ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Details</h3>
              <p className="text-gray-900 font-medium">{customer.name}</p>
              <p className="text-gray-600">{customer.phone}</p>
              {customer.email && <p className="text-gray-600">{customer.email}</p>}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700">Service Address</h3>
              <p className="text-gray-900">{issue.address}</p>
            </div>

            {issue.scheduledDate && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700">Scheduled For</h3>
                <p className="text-gray-900">
                  {formatDate(issue.scheduledDate)} at {issue.scheduledTime}
                </p>
              </div>
            )}

            {issue.completionDetails && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Completion Details
                </h3>
                <p className="text-gray-700 mb-2">{issue.completionDetails.summary}</p>
                <p className="text-xl font-bold text-emerald-900">
                  Cost: ₹{issue.completionDetails.cost}
                </p>
              </div>
            )}

            <div className="border-t pt-4 space-y-3">
              {issue.status === 'assigned' && (
                <div className="flex gap-3">
                  <Button onClick={handleAccept} isLoading={isSubmitting} className="flex-1">
                    Accept Job
                  </Button>
                  <Button
                    onClick={handleReject}
                    variant="danger"
                    isLoading={isSubmitting}
                    className="flex-1"
                  >
                    Reject Job
                  </Button>
                </div>
              )}

              {issue.status === 'accepted' && (
                <Button onClick={handleStartJob} isLoading={isSubmitting} className="w-full">
                  Start Job
                </Button>
              )}

              {issue.status === 'in-progress' && (
                <Button
                  onClick={() => setShowCompleteModal(true)}
                  className="w-full"
                >
                  Complete Job
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
      <BottomNav />

      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Job"
      >
        <div className="space-y-4">
          <Input
            label="Date"
            type="date"
            value={scheduleData.date}
            onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
            required
          />
          <Input
            label="Time"
            type="time"
            value={scheduleData.time}
            onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
            required
          />
          <Button onClick={handleScheduleSubmit} isLoading={isSubmitting} className="w-full">
            Confirm Schedule
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Complete Job"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <Textarea
            label="Work Summary"
            value={completionData.summary}
            onChange={(e) =>
              setCompletionData({ ...completionData, summary: e.target.value })
            }
            placeholder="Describe the work done..."
            rows={4}
            required
          />
          <Input
            label="Total Cost (₹)"
            type="number"
            value={completionData.cost}
            onChange={(e) =>
              setCompletionData({ ...completionData, cost: e.target.value })
            }
            placeholder="Enter total cost"
            required
          />
          <FileUpload
            label="Upload Images (Min 3 required)"
            accept="image/*"
            multiple
            maxFiles={10}
            onFilesChange={setCompletionImages}
            preview
          />
          <Button
            onClick={handleCompleteSubmit}
            isLoading={isSubmitting}
            className="w-full"
          >
            Submit & Complete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
