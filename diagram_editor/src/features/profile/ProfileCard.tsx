// filepath: src/features/profile/ProfileCard.tsx

import React, { useState, useCallback } from 'react';
import { Card } from '@/shared/components/Card';
import { Avatar } from '@/shared/components/Avatar';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Icon } from '@/shared/components/Icon';
import { useAuth } from '@/hooks/useAuth';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';
import { publishEvent } from '@/core/events';
import { runHook } from '@/core/hooks';
import { config } from '@/app/config';
import type { User } from '@/core/contracts';

// =============================
// TYPES & INTERFACES
// =============================

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
}

interface ProfileCardProps {
  className?: string;
  showEditButton?: boolean;
  compact?: boolean;
}

// =============================
// PROFILE EDIT MODAL COMPONENT
// =============================

interface ProfileEditModalProps {
  user: User;
  onSave: (data: ProfileFormData) => Promise<void>;
  onCancel: () => void;
}

function ProfileEditModal({ user, onSave, onCancel }: ProfileEditModalProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || '',
    bio: user.bio || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<ProfileFormData>>({});

  const handleInputChange = useCallback((field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<ProfileFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.phone && !/^[\+]?[\d\s\-\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSave, validateForm]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  }, [onCancel]);

  return (
    <div 
      className="profile-edit-modal"
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-labelledby="profile-edit-title"
      aria-describedby="profile-edit-description"
    >
      <div className="modal-backdrop" onClick={onCancel} />
      <div className="modal-content">
        <header className="modal-header">
          <h2 id="profile-edit-title" className="modal-title">
            Edit Profile
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            aria-label="Close dialog"
          >
            <Icon name="x" size="sm" />
          </Button>
        </header>

        <div id="profile-edit-description" className="modal-description">
          Update your profile information below. Changes will be saved to your account.
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-row">
            <div className="form-field">
              <Input
                id="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={(value) => handleInputChange('firstName', value)}
                error={errors.firstName}
                required
                disabled={isSubmitting}
                autoComplete="given-name"
              />
            </div>
            <div className="form-field">
              <Input
                id="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={(value) => handleInputChange('lastName', value)}
                error={errors.lastName}
                required
                disabled={isSubmitting}
                autoComplete="family-name"
              />
            </div>
          </div>

          <Input
            id="email"
            type="email"
            label="Email Address"
            value={formData.email}
            onChange={(value) => handleInputChange('email', value)}
            error={errors.email}
            required
            disabled={isSubmitting}
            autoComplete="email"
          />

          <Input
            id="phone"
            type="tel"
            label="Phone Number"
            value={formData.phone}
            onChange={(value) => handleInputChange('phone', value)}
            error={errors.phone}
            disabled={isSubmitting}
            autoComplete="tel"
            placeholder="+1 (555) 123-4567"
          />

          <div className="form-field">
            <label htmlFor="bio" className="form-label">
              Bio
            </label>
            <textarea
              id="bio"
              className="form-textarea"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              disabled={isSubmitting}
              placeholder="Tell us a bit about yourself..."
              rows={3}
              maxLength={500}
            />
            <div className="character-count">
              {formData.bio.length}/500 characters
            </div>
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .profile-edit-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: var(--z-index-modal, 50);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }

        .modal-content {
          position: relative;
          background: var(--color-background, #ffffff);
          border-radius: 12px;
          box-shadow: var(--shadow-lg, 0 25px 50px -12px rgba(0, 0, 0, 0.25));
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 1.5rem 0;
        }

        .modal-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-text-primary, #000000);
        }

        .modal-description {
          padding: 0.5rem 1.5rem 1rem;
          color: var(--color-text-secondary, #6b7280);
          font-size: 0.875rem;
        }

        .profile-form {
          padding: 0 1.5rem 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-field {
          margin-bottom: 1rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-primary, #000000);
        }

        .form-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--color-border, #d1d5db);
          border-radius: 6px;
          font-size: 0.875rem;
          background-color: var(--color-background, #ffffff);
          color: var(--color-text-primary, #000000);
          resize: vertical;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .form-textarea:focus {
          outline: none;
          border-color: var(--color-primary, #3b82f6);
          box-shadow: 0 0 0 3px var(--color-primary-alpha, rgba(59, 130, 246, 0.1));
        }

        .form-textarea:disabled {
          background-color: var(--color-background-muted, #f9fafb);
          cursor: not-allowed;
        }

        .character-count {
          margin-top: 0.25rem;
          font-size: 0.75rem;
          color: var(--color-text-tertiary, #9ca3af);
          text-align: right;
        }

        .form-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--color-border, #e5e7eb);
        }

        @media (max-width: 640px) {
          .profile-edit-modal {
            padding: 0.5rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column-reverse;
          }
        }
      `}</style>
    </div>
  );
}

// =============================
// MAIN PROFILE CARD COMPONENT
// =============================

export function ProfileCard({ 
  className = '',
  showEditButton = true,
  compact = false 
}: ProfileCardProps) {
  const { user, updateUser } = useAuth();
  const { openModal, closeModal } = useModal();
  const { showToast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  // =============================
  // PROFILE UPDATE HANDLER
  // =============================

  const handleProfileUpdate = useCallback(async (formData: ProfileFormData) => {
    if (!user) return;

    setIsUpdating(true);
    
    try {
      // Simulate API call delay in development
      if (config.development_mode.verbose_logs) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Update user data
      const updatedUser: User = {
        ...user,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        bio: formData.bio || undefined,
      };

      // Update auth context
      updateUser(updatedUser);

      // Publish analytics event
      await publishEvent('analytics:event', {
        name: 'profile_updated',
        payload: {
          userId: user.id,
          fields: Object.keys(formData),
        },
      });

      // Run profile update hook
      await runHook('onProfileUpdate', { user: updatedUser });

      // Show success feedback
      showToast({
        type: 'success',
        message: 'Profile updated successfully',
      });

      // Close modal
      closeModal();

    } catch (error) {
      console.error('Failed to update profile:', error);
      
      showToast({
        type: 'error',
        message: 'Failed to update profile. Please try again.',
      });

      // Publish error event
      await publishEvent('analytics:event', {
        name: 'profile_update_error',
        payload: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } finally {
      setIsUpdating(false);
    }
  }, [user, updateUser, showToast, closeModal]);

  // =============================
  // MODAL HANDLERS
  // =============================

  const handleEditClick = useCallback(() => {
    if (!user) return;

    openModal(
      <ProfileEditModal
        user={user}
        onSave={handleProfileUpdate}
        onCancel={closeModal}
      />
    );
  }, [user, openModal, closeModal, handleProfileUpdate]);

  // =============================
  // RENDER HELPERS
  // =============================

  const getDisplayName = useCallback(() => {
    if (!user) return 'Unknown User';
    return `${user.firstName} ${user.lastName}`.trim() || user.email;
  }, [user]);

  const getInitials = useCallback(() => {
    if (!user) return 'U';
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase() || user.email[0]?.toUpperCase() || 'U';
  }, [user]);

  // =============================
  // RENDER
  // =============================

  if (!user) {
    return (
      <Card className={`profile-card ${className}`}>
        <div className="profile-loading">
          <div className="loading-avatar" />
          <div className="loading-text">
            <div className="loading-line loading-line-long" />
            <div className="loading-line loading-line-short" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`profile-card ${compact ? 'compact' : ''} ${className}`}>
      <div className="profile-header">
        <Avatar
          src={user.avatar}
          alt={`${getDisplayName()} profile picture`}
          fallback={getInitials()}
          size={compact ? 'md' : 'lg'}
        />
        
        <div className="profile-info">
          <h3 className="profile-name">
            {getDisplayName()}
          </h3>
          <p className="profile-email">
            {user.email}
          </p>
          {user.role && (
            <span className="profile-role">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          )}
        </div>

        {showEditButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditClick}
            disabled={isUpdating}
            aria-label="Edit profile"
            className="edit-button"
          >
            <Icon name="edit" size="sm" />
            {!compact && 'Edit'}
          </Button>
        )}
      </div>

      {!compact && (
        <div className="profile-details">
          {user.phone && (
            <div className="profile-detail">
              <Icon name="phone" size="sm" className="detail-icon" />
              <span className="detail-text">{user.phone}</span>
            </div>
          )}
          
          {user.bio && (
            <div className="profile-detail">
              <Icon name="user" size="sm" className="detail-icon" />
              <p className="detail-bio">{user.bio}</p>
            </div>
          )}

          <div className="profile-detail">
            <Icon name="calendar" size="sm" className="detail-icon" />
            <span className="detail-text">
              Member since {new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long'
              })}
            </span>
          </div>
        </div>
      )}

      <style jsx>{`
        .profile-card {
          padding: 1.5rem;
        }

        .profile-card.compact {
          padding: 1rem;
        }

        .profile-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .profile-card.compact .profile-header {
          margin-bottom: 0;
        }

        .profile-info {
          flex: 1;
          min-width: 0;
        }

        .profile-name {
          margin: 0 0 0.25rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-text-primary, #000000);
          line-height: 1.4;
        }

        .profile-card.compact .profile-name {
          font-size: 1rem;
        }

        .profile-email {
          margin: 0 0 0.5rem 0;
          font-size: 0.875rem;
          color: var(--color-text-secondary, #6b7280);
          word-break: break-word;
        }

        .profile-role {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
          background-color: var(--color-primary-alpha, rgba(59, 130, 246, 0.1));
          color: var(--color-primary, #3b82f6);
          border-radius: 9999px;
          text-transform: capitalize;
        }

        .edit-button {
          flex-shrink: 0;
          gap: 0.5rem;
        }

        .profile-details {
          border-top: 1px solid var(--color-border, #e5e7eb);
          padding-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .profile-detail {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .detail-icon {
          flex-shrink: 0;
          margin-top: 0.125rem;
          color: var(--color-text-tertiary, #9ca3af);
        }

        .detail-text {
          font-size: 0.875rem;
          color: var(--color-text-secondary, #6b7280);
          line-height: 1.4;
        }

        .detail-bio {
          margin: 0;
          font-size: 0.875rem;
          color: var(--color-text-secondary, #6b7280);
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .profile-loading {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .loading-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(
            90deg,
            var(--color-background-muted, #f3f4f6) 25%,
            var(--color-background-hover, #e5e7eb) 50%,
            var(--color-background-muted, #f3f4f6) 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .loading-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .loading-line {
          height: 0.75rem;
          background: linear-gradient(
            90deg,
            var(--color-background-muted, #f3f4f6) 25%,
            var(--color-background-hover, #e5e7eb) 50%,
            var(--color-background-muted, #f3f4f6) 75%
          );
          background-size: 200% 100%;
          border-radius: 4px;
          animation: shimmer 1.5s infinite;
        }

        .loading-line-long {
          width: 80%;
        }

        .loading-line-short {
          width: 60%;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        /* Dark mode adjustments */
        :global(.dark) .profile-role {
          background-color: var(--color-primary-alpha-dark, rgba(59, 130, 246, 0.2));
          color: var(--color-primary-light, #60a5fa);
        }

        /* Responsive adjustments */
        @media (max-width: 480px) {
          .profile-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 0.75rem;
          }

          .edit-button {
            align-self: stretch;
            justify-content: center;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .loading-avatar,
          .loading-line {
            animation: none;
            background: var(--color-background-muted, #f3f4f6);
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .profile-details {
            border-top-width: 2px;
          }
          
          .profile-role {
            border: 1px solid currentColor;
          }
        }
      `}</style>
    </Card>
  );
}

export default ProfileCard;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
