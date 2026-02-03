import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/shared/Card';
import { Badge } from '../../components/shared/Badge';
import { Loading } from '../../components/shared/Loading';
import { Button } from '../../components/shared/Button';
import { Textarea } from '../../components/shared/Textarea';
import { Navbar } from '../../components/shared/Navbar';
import { BottomNav } from '../../components/shared/BottomNav';
import { issueService } from '../../services/issue.service';
import type { Issue, User } from '../../types';
import { formatDate } from '../../utils/helpers';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

export const IssueDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadIssue();
  }, [id]);

  const loadIssue = async () => {
    if (!id) return;
    try {
      const data = await issueService.getIssueById(id);
      setIssue(data);
      if (data.status === 'completed' && !data.rating) {
        setShowRatingForm(true);
      }
    } catch (error) {
      console.error('Error loading issue:', error);
      navigate('/customer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingSubmit = async () => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await issueService.rateIssue(id, { rating, review });
      await loadIssue();
      setShowRatingForm(false);
    } catch (error) {
      console.error('Error submitting rating:', error);
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

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (!issue) {
    return null;
  }

  const technician = issue.technician as User | undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <button
          onClick={() => navigate('/customer')}
          className="mb-4 text-emerald-900 hover:text-emerald-700 font-medium"
        >
          ← Back to Dashboard
        </button>

        <Card>
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{issue.applianceType}</h1>
            <Badge variant={getStatusVariant(issue.status)} size="lg">
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
              <h3 className="text-sm font-medium text-gray-700">Address</h3>
              <p className="text-gray-900">{issue.address}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Priority</h3>
                <Badge variant="warning">{issue.priority}</Badge>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Created</h3>
                <p className="text-gray-900">{formatDate(issue.createdAt)}</p>
              </div>
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

            {technician && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Assigned Technician
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-emerald-900 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    {technician.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{technician.name}</p>
                    <p className="text-sm text-gray-600">{technician.phone}</p>
                    {technician.rating && (
                      <div className="flex items-center mt-1">
                        <StarIcon className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm text-gray-600 ml-1">
                          {technician.rating.toFixed(1)} ({technician.totalJobs} jobs)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

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
                <p className="text-gray-700 mb-3">{issue.completionDetails.summary}</p>
                <p className="text-xl font-bold text-emerald-900 mb-3">
                  Cost: ₹{issue.completionDetails.cost}
                </p>
                {issue.completionDetails.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {issue.completionDetails.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Completion ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {showRatingForm && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Rate the Service
                </h3>
                <div className="flex items-center space-x-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      {star <= rating ? (
                        <StarIcon className="h-8 w-8 text-yellow-400" />
                      ) : (
                        <StarOutlineIcon className="h-8 w-8 text-gray-300" />
                      )}
                    </button>
                  ))}
                </div>
                <Textarea
                  label="Review (Optional)"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your experience..."
                  rows={3}
                />
                <Button
                  onClick={handleRatingSubmit}
                  isLoading={isSubmitting}
                  className="mt-4"
                >
                  Submit Rating
                </Button>
              </div>
            )}

            {issue.rating && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Rating</h3>
                <div className="flex items-center space-x-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`h-6 w-6 ${
                        star <= issue.rating! ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                {issue.review && <p className="text-gray-700">{issue.review}</p>}
              </div>
            )}
          </div>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};
