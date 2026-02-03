import React, { useEffect, useState } from 'react';
import { Card } from '../../components/shared/Card';
import { Badge } from '../../components/shared/Badge';
import { Loading } from '../../components/shared/Loading';
import { Navbar } from '../../components/shared/Navbar';
import { BottomNav } from '../../components/shared/BottomNav';
import { notificationService } from '../../services/notification.service';
import { useNotificationStore } from '../../store';
import { Notification } from '../../types';
import { formatDate } from '../../utils/helpers';

export const Notifications: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { notifications, setNotifications, markAsRead } = useNotificationStore();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getMyNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      markAsRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getTypeVariant = (type: string) => {
    const variants: Record<string, any> = {
      info: 'info',
      success: 'success',
      warning: 'warning',
      error: 'danger',
    };
    return variants[type] || 'info';
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Notifications</h1>

        {notifications.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No notifications</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification._id}
                className={`${!notification.isRead ? 'border-l-4 border-emerald-900' : ''}`}
                onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant={getTypeVariant(notification.type)}>
                        {notification.type}
                      </Badge>
                      {!notification.isRead && (
                        <span className="bg-emerald-900 text-white text-xs px-2 py-1 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-gray-700">{notification.message}</p>
                  </div>
                  <span className="text-xs text-gray-500 ml-4">
                    {formatDate(notification.createdAt)}
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
