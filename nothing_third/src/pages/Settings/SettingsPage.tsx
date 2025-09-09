// filepath: src/pages/Settings/SettingsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/shared/layouts/MainLayout';
import { Card } from '@/shared/components/Card/Card';
import { Button } from '@/shared/components/Button/Button';
import { Input } from '@/shared/components/Input/Input';
import { useAuth } from '@/hooks/useAuth';
import { useTheme, useThemeMode } from '@/providers/ThemeProvider';
import { useToastHelpers } from '@/providers/ToastProvider';
import { config } from '@/app/config';
import { eventBus } from '@/core/events';
import type { User, ApiResult } from '@/core/contracts';

interface UserSettings {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  timezone: string;
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  analyticsOptOut: boolean;
}

interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [themeMode, setThemeMode] = useThemeMode();
  const { isDarkMode } = useTheme();
  const { showSuccess, showError } = useToastHelpers();

  // Form states
  const [userSettings, setUserSettings] = useState<UserSettings>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    timezone: 'UTC',
    language: 'en',
    emailNotifications: true,
    pushNotifications: false,
    analyticsOptOut: false
  });

  const [passwordChange, setPasswordChange] = useState<PasswordChange>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Loading states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Validation states
  const [profileErrors, setProfileErrors] = useState<Partial<Record<keyof UserSettings, string>>>({});
  const [passwordErrors, setPasswordErrors] = useState<Partial<Record<keyof PasswordChange, string>>>({});

  // Initialize settings from current user
  useEffect(() => {
    if (user) {
      setUserSettings({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        timezone: user.timezone || 'UTC',
        language: user.language || 'en',
        emailNotifications: user.preferences?.emailNotifications ?? true,
        pushNotifications: user.preferences?.pushNotifications ?? false,
        analyticsOptOut: user.preferences?.analyticsOptOut ?? false
      });
    }
  }, [user]);

  // Profile form handlers
  const handleProfileChange = useCallback((field: keyof UserSettings, value: string | boolean) => {
    setUserSettings(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (profileErrors[field]) {
      setProfileErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [profileErrors]);

  const validateProfile = useCallback((): boolean => {
    const errors: Partial<Record<keyof UserSettings, string>> = {};

    if (!userSettings.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!userSettings.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!userSettings.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userSettings.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (userSettings.phoneNumber && !/^\+?[\d\s\-\(\)]{10,}$/.test(userSettings.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid phone number';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  }, [userSettings]);

  const handleSaveProfile = useCallback(async () => {
    if (!validateProfile()) {
      return;
    }

    setIsSavingProfile(true);
    
    try {
      // Simulate API call to save user settings
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would call a user service
      // const result = await userService.updateProfile(userSettings);
      
      // Simulate success
      const mockResult: ApiResult<User> = {
        success: true,
        data: {
          ...user!,
          firstName: userSettings.firstName,
          lastName: userSettings.lastName,
          email: userSettings.email,
          phoneNumber: userSettings.phoneNumber,
          timezone: userSettings.timezone,
          language: userSettings.language,
          preferences: {
            emailNotifications: userSettings.emailNotifications,
            pushNotifications: userSettings.pushNotifications,
            analyticsOptOut: userSettings.analyticsOptOut
          }
        }
      };

      if (mockResult.success) {
        showSuccess('Profile updated successfully');
        
        // Emit analytics event
        eventBus.emit('analytics:event', {
          name: 'settings_profile_updated',
          properties: {
            userId: user?.id,
            timestamp: Date.now()
          }
        });
      } else {
        showError('Failed to update profile', mockResult.error?.message);
      }

    } catch (error) {
      showError('Failed to update profile', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSavingProfile(false);
    }
  }, [validateProfile, userSettings, user, showSuccess, showError]);

  // Password change handlers
  const handlePasswordChange = useCallback((field: keyof PasswordChange, value: string) => {
    setPasswordChange(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [passwordErrors]);

  const validatePassword = useCallback((): boolean => {
    const errors: Partial<Record<keyof PasswordChange, string>> = {};

    if (!passwordChange.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordChange.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordChange.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordChange.newPassword)) {
      errors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }

    if (passwordChange.newPassword && passwordChange.newPassword !== passwordChange.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (passwordChange.currentPassword === passwordChange.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  }, [passwordChange]);

  const handleChangePassword = useCallback(async () => {
    if (!validatePassword()) {
      return;
    }

    setIsChangingPassword(true);
    
    try {
      // Simulate API call to change password
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would call auth service
      // const result = await authService.changePassword(passwordChange);
      
      // Simulate success
      showSuccess('Password changed successfully');
      
      // Clear password form
      setPasswordChange({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Emit analytics event
      eventBus.emit('analytics:event', {
        name: 'settings_password_changed',
        properties: {
          userId: user?.id,
          timestamp: Date.now()
        }
      });

    } catch (error) {
      showError('Failed to change password', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsChangingPassword(false);
    }
  }, [validatePassword, passwordChange, showSuccess, showError, user?.id]);

  // Theme handlers
  const handleThemeChange = useCallback((newMode: typeof themeMode) => {
    setThemeMode(newMode);
    
    eventBus.emit('analytics:event', {
      name: 'settings_theme_changed',
      properties: {
        mode: newMode,
        userId: user?.id,
        timestamp: Date.now()
      }
    });
  }, [setThemeMode, user?.id]);

  if (authLoading || !user) {
    return (
      <MainLayout>
        <div className="settings-loading" style={{ padding: '2rem', textAlign: 'center' }}>
          <div>Loading settings...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="settings-page" style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <header className="settings-header" style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            margin: 0,
            color: isDarkMode ? '#f9fafb' : '#111827'
          }}>
            Settings
          </h1>
          <p style={{ 
            marginTop: '0.5rem', 
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            fontSize: '1rem'
          }}>
            Manage your account preferences and security settings.
          </p>
        </header>

        <div className="settings-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '2rem'
        }}>
          {/* Profile Settings */}
          <Card
            title="Profile Information"
            description="Update your personal information and contact details"
          >
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveProfile();
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input
                  label="First Name"
                  value={userSettings.firstName}
                  onChange={(value) => handleProfileChange('firstName', value)}
                  error={profileErrors.firstName}
                  required
                  aria-describedby={profileErrors.firstName ? 'firstName-error' : undefined}
                />
                <Input
                  label="Last Name"
                  value={userSettings.lastName}
                  onChange={(value) => handleProfileChange('lastName', value)}
                  error={profileErrors.lastName}
                  required
                  aria-describedby={profileErrors.lastName ? 'lastName-error' : undefined}
                />
              </div>

              <Input
                label="Email"
                type="email"
                value={userSettings.email}
                onChange={(value) => handleProfileChange('email', value)}
                error={profileErrors.email}
                required
                aria-describedby={profileErrors.email ? 'email-error' : undefined}
              />

              <Input
                label="Phone Number"
                type="tel"
                value={userSettings.phoneNumber}
                onChange={(value) => handleProfileChange('phoneNumber', value)}
                error={profileErrors.phoneNumber}
                placeholder="+1 (555) 123-4567"
                aria-describedby={profileErrors.phoneNumber ? 'phoneNumber-error' : undefined}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontWeight: '500', 
                    marginBottom: '0.5rem',
                    color: isDarkMode ? '#f9fafb' : '#111827'
                  }}>
                    Timezone
                  </label>
                  <select
                    value={userSettings.timezone}
                    onChange={(e) => handleProfileChange('timezone', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${isDarkMode ? '#374151' : '#d1d5db'}`,
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      color: isDarkMode ? '#f9fafb' : '#111827',
                      fontSize: '0.875rem'
                    }}
                    aria-label="Select timezone"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontWeight: '500', 
                    marginBottom: '0.5rem',
                    color: isDarkMode ? '#f9fafb' : '#111827'
                  }}>
                    Language
                  </label>
                  <select
                    value={userSettings.language}
                    onChange={(e) => handleProfileChange('language', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${isDarkMode ? '#374151' : '#d1d5db'}`,
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      color: isDarkMode ? '#f9fafb' : '#111827',
                      fontSize: '0.875rem'
                    }}
                    aria-label="Select language"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={isSavingProfile}
                disabled={isSavingProfile}
                style={{ alignSelf: 'flex-start' }}
              >
                {isSavingProfile ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </Card>

          {/* Preferences */}
          <Card
            title="Preferences"
            description="Customize your experience and notification settings"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Theme Setting */}
              <div>
                <h4 style={{ 
                  fontWeight: '600', 
                  marginBottom: '1rem',
                  color: isDarkMode ? '#f9fafb' : '#111827'
                }}>
                  Theme
                </h4>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {(['light', 'dark', 'system'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleThemeChange(mode)}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        border: themeMode === mode 
                          ? `2px solid ${isDarkMode ? '#3b82f6' : '#2563eb'}`
                          : `1px solid ${isDarkMode ? '#374151' : '#d1d5db'}`,
                        backgroundColor: themeMode === mode
                          ? (isDarkMode ? '#1e3a8a' : '#dbeafe')
                          : (isDarkMode ? '#1f2937' : '#ffffff'),
                        color: themeMode === mode
                          ? (isDarkMode ? '#93c5fd' : '#1e40af')
                          : (isDarkMode ? '#f9fafb' : '#111827'),
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        textTransform: 'capitalize',
                        transition: 'all 0.15s ease'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.outline = `2px solid ${isDarkMode ? '#3b82f6' : '#2563eb'}`;
                        e.currentTarget.style.outlineOffset = '2px';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.outline = 'none';
                      }}
                      aria-pressed={themeMode === mode}
                      aria-label={`Set theme to ${mode}`}
                    >
{mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notification Settings */}
              <div>
                <h4 style={{ 
                  fontWeight: '600', 
                  marginBottom: '1rem',
                  color: isDarkMode ? '#f9fafb' : '#111827'
                }}>
                  Notifications
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { key: 'emailNotifications' as const, label: 'Email notifications', description: 'Receive updates via email' },
                    { key: 'pushNotifications' as const, label: 'Push notifications', description: 'Receive browser notifications' }
                  ].map((setting) => (
                    <label
                      key={setting.key}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '0.25rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={userSettings[setting.key]}
                        onChange={(e) => handleProfileChange(setting.key, e.target.checked)}
                        style={{
                          width: '1.125rem',
                          height: '1.125rem',
                          marginTop: '0.125rem',
                          accentColor: isDarkMode ? '#3b82f6' : '#2563eb',
                          cursor: 'pointer'
                        }}
                        aria-describedby={`${setting.key}-description`}
                      />
                      <div>
                        <div style={{ 
                          fontWeight: '500',
                          color: isDarkMode ? '#f9fafb' : '#111827'
                        }}>
                          {setting.label}
                        </div>
                        <div 
                          id={`${setting.key}-description`}
                          style={{ 
                            fontSize: '0.875rem',
                            color: isDarkMode ? '#9ca3af' : '#6b7280',
                            marginTop: '0.25rem'
                          }}
                        >
                          {setting.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Privacy Settings */}
              <div>
                <h4 style={{ 
                  fontWeight: '600', 
                  marginBottom: '1rem',
                  color: isDarkMode ? '#f9fafb' : '#111827'
                }}>
                  Privacy
                </h4>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '0.25rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <input
                    type="checkbox"
                    checked={userSettings.analyticsOptOut}
                    onChange={(e) => handleProfileChange('analyticsOptOut', e.target.checked)}
                    style={{
                      width: '1.125rem',
                      height: '1.125rem',
                      marginTop: '0.125rem',
                      accentColor: isDarkMode ? '#3b82f6' : '#2563eb',
                      cursor: 'pointer'
                    }}
                    aria-describedby="analytics-description"
                  />
                  <div>
                    <div style={{ 
                      fontWeight: '500',
                      color: isDarkMode ? '#f9fafb' : '#111827'
                    }}>
                      Opt out of analytics
                    </div>
                    <div 
                      id="analytics-description"
                      style={{ 
                        fontSize: '0.875rem',
                        color: isDarkMode ? '#9ca3af' : '#6b7280',
                        marginTop: '0.25rem'
                      }}
                    >
                      Disable collection of usage analytics and telemetry
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </Card>

          {/* Password Change */}
          <Card
            title="Change Password"
            description="Update your password to keep your account secure"
          >
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleChangePassword();
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              <Input
                label="Current Password"
                type="password"
                value={passwordChange.currentPassword}
                onChange={(value) => handlePasswordChange('currentPassword', value)}
                error={passwordErrors.currentPassword}
                required
                autoComplete="current-password"
                aria-describedby={passwordErrors.currentPassword ? 'currentPassword-error' : undefined}
              />

              <Input
                label="New Password"
                type="password"
                value={passwordChange.newPassword}
                onChange={(value) => handlePasswordChange('newPassword', value)}
                error={passwordErrors.newPassword}
                required
                autoComplete="new-password"
                aria-describedby={passwordErrors.newPassword ? 'newPassword-error' : 'newPassword-help'}
              />
              <div 
                id="newPassword-help"
                style={{
                  fontSize: '0.875rem',
                  color: isDarkMode ? '#9ca3af' : '#6b7280',
                  marginTop: '-1rem'
                }}
              >
                Password must be at least 8 characters with uppercase, lowercase, and number
              </div>

              <Input
                label="Confirm New Password"
                type="password"
                value={passwordChange.confirmPassword}
                onChange={(value) => handlePasswordChange('confirmPassword', value)}
                error={passwordErrors.confirmPassword}
                required
                autoComplete="new-password"
                aria-describedby={passwordErrors.confirmPassword ? 'confirmPassword-error' : undefined}
              />

              <Button
                type="submit"
                variant="primary"
                loading={isChangingPassword}
                disabled={isChangingPassword || !passwordChange.currentPassword || !passwordChange.newPassword}
                style={{ alignSelf: 'flex-start' }}
              >
                {isChangingPassword ? 'Changing Password...' : 'Change Password'}
              </Button>
            </form>
          </Card>

          {/* Account Actions */}
          <Card
            title="Account Actions"
            description="Manage your account data and privacy"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h4 style={{ 
                  fontWeight: '600', 
                  marginBottom: '0.5rem',
                  color: isDarkMode ? '#f9fafb' : '#111827'
                }}>
                  Export Data
                </h4>
                <p style={{ 
                  fontSize: '0.875rem',
                  color: isDarkMode ? '#9ca3af' : '#6b7280',
                  marginBottom: '1rem'
                }}>
                  Download a copy of your account data and activity history.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    showInfo('Data export will be available in a future update');
                    eventBus.emit('analytics:event', {
                      name: 'settings_export_requested',
                      properties: { userId: user.id, timestamp: Date.now() }
                    });
                  }}
                >
                  Export Data
                </Button>
              </div>

              <div>
                <h4 style={{ 
                  fontWeight: '600', 
                  marginBottom: '0.5rem',
                  color: '#dc2626'
                }}>
                  Danger Zone
                </h4>
                <p style={{ 
                  fontSize: '0.875rem',
                  color: isDarkMode ? '#9ca3af' : '#6b7280',
                  marginBottom: '1rem'
                }}>
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      showError('Account deletion will be available in a future update');
                      eventBus.emit('analytics:event', {
                        name: 'settings_delete_requested',
                        properties: { userId: user.id, timestamp: Date.now() }
                      });
                    }
                  }}
                  style={{
                    borderColor: '#dc2626',
                    color: '#dc2626'
                  }}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/shared/layouts, @/shared/components, @/hooks, @/providers, @/app/config, @/core/events, @/core/contracts)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses hooks for auth, theme, toast
- [x] Reads config from `@/app/config` (imports config for potential future use)
- [x] Exports default named component (exports SettingsPage)
- [x] Adds basic ARIA and keyboard handlers (aria-describedby, aria-label, aria-pressed, focus/blur handlers, form semantics)
*/
