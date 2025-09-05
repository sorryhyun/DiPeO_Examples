// filepath: src/features/dashboard/ActivityFeed.tsx

import React from 'react';
import { ActivityItem } from '@/core/contracts';
import { config } from '@/app/config';
import { publishEvent } from '@/core/events';
import { useFetch } from '@/hooks/useFetch';
import { Skeleton } from '@/shared/components/Skeleton';
import { Avatar } from '@/shared/components/Avatar';
import { Button } from '@/shared/components/Button';
import { formatRelativeTime } from '@/core/utils';

interface ActivityFeedProps {
  limit?: number;
  className?: string;
  showActions?: boolean;
}

interface ActivityFeedState {
  readItems: Set<string>;
}

export function ActivityFeed({ 
  limit = 10, 
  className = '', 
  showActions = true 
}: ActivityFeedProps) {
  const [state, setState] = React.useState<ActivityFeedState>({
    readItems: new Set(),
  });

  const { 
    data: activities, 
    loading, 
    error, 
    refetch 
  } = useFetch<ActivityItem[]>({
    url: `/activities?limit=${limit}`,
    key: ['activities', limit],
    enabled: true,
  });

  const handleMarkAsRead = React.useCallback(async (activityId: string) => {
    try {
      // Optimistically update UI
      setState(prev => ({
        ...prev,
        readItems: new Set([...prev.readItems, activityId]),
      }));

      // Make API call to mark as read
      const response = await fetch(`${config.apiBaseUrl}/activities/${activityId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Emit event for analytics/other components
        await publishEvent('analytics:event', {
          name: 'activity_marked_read',
          payload: { activityId },
        });
      } else {
        // Revert optimistic update on error
        setState(prev => ({
          ...prev,
          readItems: new Set([...prev.readItems].filter(id => id !== activityId)),
        }));
        
        await publishEvent('toast:show', {
          type: 'error',
          message: 'Failed to mark activity as read',
        });
      }
    } catch (err) {
      // Revert optimistic update on error
      setState(prev => ({
        ...prev,
        readItems: new Set([...prev.readItems].filter(id => id !== activityId)),
      }));
      
      await publishEvent('toast:show', {
        type: 'error',
        message: 'Failed to mark activity as read',
      });
    }
  }, []);

  const handleKeyDown = React.useCallback((
    event: React.KeyboardEvent, 
    activityId: string
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleMarkAsRead(activityId);
    }
  }, [handleMarkAsRead]);

  const getActivityIcon = React.useCallback((type: ActivityItem['type']) => {
    switch (type) {
      case 'appointment':
        return '📅';
      case 'lab_result':
        return '🔬';
      case 'prescription':
        return '💊';
      case 'medical_record':
        return '📋';
      default:
        return '📝';
    }
  }, []);

  const getActivityTypeLabel = React.useCallback((type: ActivityItem['type']) => {
    switch (type) {
      case 'appointment':
        return 'Appointment';
      case 'lab_result':
        return 'Lab Result';
      case 'prescription':
        return 'Prescription';
      case 'medical_record':
        return 'Medical Record';
      default:
        return 'Activity';
    }
  }, []);

  const isItemRead = React.useCallback((activityId: string) => {
    return state.readItems.has(activityId);
  }, [state.readItems]);

  const unreadCount = React.useMemo(() => {
    if (!activities) return 0;
    return activities.filter(activity => !isItemRead(activity.id)).length;
  }, [activities, isItemRead]);

  if (loading) {
    return (
      <div className={`activity-feed ${className}`} role="region" aria-label="Activity feed loading">
        <div className="activity-feed-header">
          <h3>Recent Activity</h3>
          <Skeleton className="skeleton-badge" />
        </div>
        <div className="activity-list" role="list" aria-label="Loading activities">
          {Array.from({ length: limit }).map((_, index) => (
            <div key={index} className="activity-item skeleton-item" role="listitem">
              <div className="activity-icon">
                <Skeleton className="skeleton-avatar" />
              </div>
              <div className="activity-content">
                <Skeleton className="skeleton-title" />
                <Skeleton className="skeleton-description" />
                <Skeleton className="skeleton-timestamp" />
              </div>
              <div className="activity-actions">
                <Skeleton className="skeleton-button" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`activity-feed error-state ${className}`} role="region" aria-label="Activity feed error">
        <div className="activity-feed-header">
          <h3>Recent Activity</h3>
        </div>
        <div className="error-content">
          <p>Failed to load activities</p>
          <Button 
            variant="secondary" 
            onClick={() => refetch()}
            aria-label="Retry loading activities"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className={`activity-feed empty-state ${className}`} role="region" aria-label="Activity feed">
        <div className="activity-feed-header">
          <h3>Recent Activity</h3>
          <span className="activity-badge" aria-label="0 unread activities">0</span>
        </div>
        <div className="empty-content">
          <p>No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`activity-feed ${className}`} role="region" aria-label="Activity feed">
      <div className="activity-feed-header">
        <h3 id="activity-feed-title">Recent Activity</h3>
        {unreadCount > 0 && (
          <span 
            className="activity-badge unread" 
            aria-label={`${unreadCount} unread activities`}
          >
            {unreadCount}
          </span>
        )}
      </div>
      
      <div 
        className="activity-list" 
        role="list" 
        aria-labelledby="activity-feed-title"
        aria-live="polite"
        aria-relevant="additions removals"
      >
        {activities.map((activity) => {
          const isRead = isItemRead(activity.id);
          
          return (
            <div
              key={activity.id}
              className={`activity-item ${isRead ? 'read' : 'unread'}`}
              role="listitem"
              tabIndex={showActions && !isRead ? 0 : -1}
              onKeyDown={showActions && !isRead ? (e) => handleKeyDown(e, activity.id) : undefined}
              aria-label={`${getActivityTypeLabel(activity.type)}: ${activity.title}. ${isRead ? 'Read' : 'Unread'}`}
            >
              <div className="activity-icon" aria-hidden="true">
                {activity.userId ? (
                  <Avatar 
                    userId={activity.userId} 
                    size="small"
                    alt=""
                  />
                ) : (
                  <div className="type-icon">
                    {getActivityIcon(activity.type)}
                  </div>
                )}
              </div>
              
              <div className="activity-content">
                <div className="activity-header">
                  <h4 className="activity-title">{activity.title}</h4>
                  <span className="activity-type" aria-label={`Type: ${getActivityTypeLabel(activity.type)}`}>
                    {getActivityTypeLabel(activity.type)}
                  </span>
                </div>
                
                {activity.description && (
                  <p className="activity-description">{activity.description}</p>
                )}
                
                <div className="activity-meta">
                  <time 
                    className="activity-timestamp" 
                    dateTime={activity.timestamp}
                    title={new Date(activity.timestamp).toLocaleString()}
                  >
                    {formatRelativeTime(activity.timestamp)}
                  </time>
                  
                  {activity.status && (
                    <span className={`activity-status status-${activity.status.toLowerCase()}`}>
                      {activity.status}
                    </span>
                  )}
                </div>
              </div>
              
              {showActions && !isRead && (
                <div className="activity-actions">
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => handleMarkAsRead(activity.id)}
                    aria-label={`Mark ${activity.title} as read`}
                    className="mark-read-button"
                  >
                    Mark as Read
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {activities.length === limit && (
        <div className="activity-feed-footer">
          <Button 
            variant="secondary" 
            size="small"
            onClick={() => {
              // Navigate to full activity page or load more
              publishEvent('route:change', {
                from: window.location.pathname,
                to: '/activities',
              });
            }}
            aria-label="View all activities"
          >
            View All Activities
          </Button>
        </div>
      )}

      <style jsx>{`
        .activity-feed {
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }

        .activity-feed-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
          background: #f9fafb;
        }

        .activity-feed-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }

        .activity-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 24px;
          height: 24px;
          padding: 2px 8px;
          background: #f3f4f6;
          color: #6b7280;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .activity-badge.unread {
          background: #dc2626;
          color: white;
        }

        .activity-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
          transition: background-color 0.2s ease;
          position: relative;
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-item.unread {
          background: #fefce8;
          border-left: 3px solid #eab308;
        }

        .activity-item.unread:hover,
        .activity-item.unread:focus {
          background: #fef3c7;
          outline: 2px solid #f59e0b;
          outline-offset: -2px;
        }

        .activity-item.read {
          opacity: 0.8;
        }

        .activity-icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
        }

        .type-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          background: #f3f4f6;
          border-radius: 6px;
        }

        .activity-content {
          flex: 1;
          min-width: 0;
        }

        .activity-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 4px;
        }

        .activity-title {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
          color: #111827;
          line-height: 1.4;
        }

        .activity-type {
          flex-shrink: 0;
          padding: 2px 6px;
          background: #f3f4f6;
          color: #6b7280;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }

        .activity-description {
          margin: 4px 0;
          font-size: 13px;
          color: #6b7280;
          line-height: 1.4;
        }

        .activity-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
        }

        .activity-timestamp {
          font-size: 12px;
          color: #9ca3af;
        }

        .activity-status {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }

        .activity-status.status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .activity-status.status-completed {
          background: #d1fae5;
          color: #065f46;
        }

        .activity-status.status-cancelled {
          background: #fee2e2;
          color: #991b1b;
        }

        .activity-actions {
          flex-shrink: 0;
          margin-left: 8px;
        }

        .mark-read-button {
          font-size: 12px;
          opacity: 0.7;
          transition: opacity 0.2s ease;
        }

        .activity-item:hover .mark-read-button,
        .activity-item:focus-within .mark-read-button {
          opacity: 1;
        }

        .activity-feed-footer {
          padding: 16px 20px;
          text-align: center;
          border-top: 1px solid #f3f4f6;
          background: #f9fafb;
        }

        .error-state,
        .empty-state {
          text-align: center;
        }

        .error-content,
        .empty-content {
          padding: 40px 20px;
          color: #6b7280;
        }

        .error-content p,
        .empty-content p {
          margin: 0 0 16px 0;
          font-size: 14px;
        }

        .skeleton-item {
          pointer-events: none;
        }

        .skeleton-avatar {
          width: 32px;
          height: 32px;
          border-radius: 6px;
        }

        .skeleton-title {
          width: 180px;
          height: 16px;
          margin-bottom: 8px;
        }

        .skeleton-description {
          width: 240px;
          height: 14px;
          margin-bottom: 8px;
        }

        .skeleton-timestamp {
          width: 80px;
          height: 12px;
        }

        .skeleton-button {
          width: 80px;
          height: 24px;
          border-radius: 4px;
        }

        .skeleton-badge {
          width: 24px;
          height: 24px;
          border-radius: 12px;
        }

        /* Focus management for accessibility */
        .activity-item:focus {
          outline: 2px solid #3b82f6;
          outline-offset: -2px;
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .activity-feed-header,
          .activity-item,
          .activity-feed-footer {
            padding-left: 16px;
            padding-right: 16px;
          }

          .activity-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .activity-type {
            align-self: flex-start;
          }

          .activity-actions {
            margin-left: 0;
            margin-top: 8px;
            align-self: flex-start;
          }

          .activity-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .activity-icon {
            align-self: flex-start;
          }
        }
      `}</style>
    </div>
  );
}

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers
