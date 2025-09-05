// filepath: src/pages/Settings/SettingsPage.tsx
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/shared/layouts/MainLayout';
import { Card } from '@/shared/components/Card/Card';
import { Button } from '@/shared/components/Button/Button';
import { Input } from '@/shared/components/Input/Input';
import { Spinner } from '@/shared/components/Spinner/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useTheme } from '@/providers/ThemeProvider';
import { config } from '@/app/config';
import { eventBus } from '@/core/events';
import type { User, ApiResult } from '@/core/contracts';
import { typedApiClient } from '@/services/apiClient';
import { analytics } from '@/services/analytics';

// Settings form data interface
interface SettingsFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  specialization?: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisible: boolean;
    shareAnalytics: boolean;
  };
}

// Form validation errors
interface FormErrors {
  [key: string]: string | undefined;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

// Settings sections enum for navigation
const SETTINGS_SECTIONS = {
  PROFILE: 'profile',
  ACCOUNT: 'account',
  NOTIFICATIONS: 'notifications',
  PRIVACY: 'privacy',
  APPEARANCE: 'appearance',
  SECURITY: 'security',
} as const;

type SettingsSection = typeof SETTINGS_SECTIONS[keyof typeof SETTINGS_SECTIONS];

export function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const { theme, setTheme, themes } = useTheme();

  // State management
  const [activeSection, setActiveSection] = useState<SettingsSection>(SETTINGS_SECTIONS.PROFILE);
  const [formData, setFormData] = useState<SettingsFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    specialization: '',
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    privacy: {
      profileVisible: true,
      shareAnalytics: true,
    },
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        department: user.profile?.department || '',
        specialization: user.profile?.specialization || '',
      }));
    }
  }, [user]);

  // Track analytics for settings page views
  useEffect(() => {
    analytics.track('settings_page_viewed', {
      section: activeSection,
      userId: user?.id,
    });
  }, [activeSection, user?.id]);

  // Form validation
  const validateForm = (data: SettingsFormData): FormErrors => {
    const newErrors: FormErrors = {};

    if (!data.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!data.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!data.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (data.phone && !/^[\d\s\-\+\(\)]+$/.test(data.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    return newErrors;
  };

  // Handle form field changes
  const handleFieldChange = (field: keyof SettingsFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setHasUnsavedChanges(true);

    // Clear field-specific errors
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  // Handle nested field changes (notifications, privacy)
  const handleNestedFieldChange = (
    section: 'notifications' | 'privacy',
    field: string,
    value: boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setHasUnsavedChanges(true);
  };

  // Save settings
  const handleSave = async () => {
    const validationErrors = validateForm(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please correct the errors before saving',
      });
      return;
    }

    setIsSaving(true);
    setErrors({});

    try {
      if (config.shouldUseMockData) {
        // Mock save with delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        showToast({
          type: 'success',
          title: 'Settings Saved',
          message: 'Your settings have been updated successfully',
        });
      } else {
        // Real API call
        const result = await typedApiClient.put<User>('/user/settings', {
          profile: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            department: formData.department,
            specialization: formData.specialization,
          },
          preferences: {
            notifications: formData.notifications,
            privacy: formData.privacy,
          },
        });

        if (result.success && result.data) {
          // Update user data in auth context
          await updateProfile(result.data);
          
          showToast({
            type: 'success',
            title: 'Settings Saved',
            message: 'Your settings have been updated successfully',
          });
        } else {
          throw new Error(result.error?.message || 'Failed to save settings');
        }
      }

      setHasUnsavedChanges(false);

      // Track successful save
      analytics.track('settings_saved', {
        section: activeSection,
        userId: user?.id,
      });

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save settings';
      
      showToast({
        type: 'error',
        title: 'Save Failed',
        message,
      });

      // Track save error
      analytics.track('settings_save_error', {
        section: activeSection,
        error: message,
        userId: user?.id,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form to original values
  const handleReset = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        department: user.profile?.department || '',
        specialization: user.profile?.specialization || '',
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
        privacy: {
          profileVisible: true,
          shareAnalytics: true,
        },
      });
      setHasUnsavedChanges(false);
      setErrors({});
      
      showToast({
        type: 'info',
        title: 'Form Reset',
        message: 'Your changes have been discarded',
      });
    }
  };

  // Section navigation items
  const sectionItems = [
    { id: SETTINGS_SECTIONS.PROFILE, label: 'Profile', icon: '👤' },
    { id: SETTINGS_SECTIONS.ACCOUNT, label: 'Account', icon: '⚙️' },
    { id: SETTINGS_SECTIONS.NOTIFICATIONS, label: 'Notifications', icon: '🔔' },
    { id: SETTINGS_SECTIONS.PRIVACY, label: 'Privacy', icon: '🔒' },
    { id: SETTINGS_SECTIONS.APPEARANCE, label: 'Appearance', icon: '🎨' },
    { id: SETTINGS_SECTIONS.SECURITY, label: 'Security', icon: '🛡️' },
  ];

  // Render different sections
  const renderSection = () => {
    switch (activeSection) {
      case SETTINGS_SECTIONS.PROFILE:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(value) => handleFieldChange('firstName', value)}
                error={errors.firstName}
                placeholder="Enter your first name"
                required
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(value) => handleFieldChange('lastName', value)}
                error={errors.lastName}
                placeholder="Enter your last name"
                required
              />
            </div>
            
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(value) => handleFieldChange('email', value)}
              error={errors.email}
              placeholder="Enter your email address"
              required
            />
            
            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(value) => handleFieldChange('phone', value)}
error={errors.phone}
              placeholder="Enter your phone number"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Department"
                value={formData.department}
                onChange={(value) => handleFieldChange('department', value)}
                placeholder="Enter your department"
              />
              {(user?.role === 'doctor' || user?.role === 'nurse') && (
                <Input
                  label="Specialization"
                  value={formData.specialization}
                  onChange={(value) => handleFieldChange('specialization', value)}
                  placeholder="Enter your specialization"
                />
              )}
            </div>
          </div>
        );

      case SETTINGS_SECTIONS.NOTIFICATIONS:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Notification Preferences
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Email Notifications</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Receive notifications via email
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.notifications.email}
                    onChange={(e) => handleNestedFieldChange('notifications', 'email', e.target.checked)}
                    className="h-4 w-4text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Push Notifications</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Receive browser push notifications
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.notifications.push}
                    onChange={(e) => handleNestedFieldChange('notifications', 'push', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">SMS Notifications</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Receive notifications via SMS
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.notifications.sms}
                    onChange={(e) => handleNestedFieldChange('notifications', 'sms', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          </div>
        );

      case SETTINGS_SECTIONS.PRIVACY:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Privacy Settings
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Profile Visibility</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Make your profile visible to other users
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.privacy.profileVisible}
                    onChange={(e) => handleNestedFieldChange('privacy', 'profileVisible', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Share Analytics</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Help improve our service by sharing usage analytics
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.privacy.shareAnalytics}
                    onChange={(e) => handleNestedFieldChange('privacy', 'shareAnalytics', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          </div>
        );

      case SETTINGS_SECTIONS.APPEARANCE:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Theme Settings
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(themes).map(([themeKey, themeConfig]) => (
                  <button
                    key={themeKey}
                    onClick={() => {
                      setTheme(themeKey);
                      analytics.track('theme_changed', {
                        theme: themeKey,
                        userId: user?.id,
                      });
                    }}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-200
                      ${theme === themeKey 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                    `}
                    aria-pressed={theme === themeKey}
                  >
                    <div className="text-center space-y-2">
                      <div className={`
                        w-8 h-8 rounded-full mx-auto
                        ${themeKey === 'light' ? 'bg-white border-2 border-gray-200' : ''}
                        ${themeKey === 'dark' ? 'bg-gray-800 border-2 border-gray-600' : ''}
                        ${themeKey === 'system' ? 'bg-gradient-to-br from-white to-gray-800 border-2 border-gray-400' : ''}
                      `} />
                      <div className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                        {themeKey}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {themeConfig.name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case SETTINGS_SECTIONS.SECURITY:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Security Settings
              </h3>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-yellow-600 dark:text-yellow-400">⚠️</div>
                  <div>
                    <div className="font-medium text-yellow-800 dark:text-yellow-200">
                      Security features coming soon
                    </div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Two-factor authentication and password management features will be available in the next update.
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={() => {
                  showToast({
                    type: 'info',
                    title: 'Coming Soon',
                    message: 'Security settings will be available in the next update',
                  });
                }}
                disabled
              >
                Change Password
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">⚙️</div>
              <div className="text-gray-600 dark:text-gray-400">
                Select a settings category from the sidebar
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Settings Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <Card className="p-4">
              <nav className="space-y-1">
                {sectionItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      analytics.track('settings_section_changed', {
                        section: item.id,
                        userId: user?.id,
                      });
                    }}
                    className={`
                      w-full text-left px-3 py-2 rounded-md transition-all duration-150 flex items-center space-x-3
                      ${activeSection === item.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }
                    `}
                    aria-current={activeSection === item.id ? 'page' : undefined}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {sectionItems.find(item => item.id === activeSection)?.label}
                </h2>
              </div>

              {renderSection()}

              {/* Save/Reset Actions for form sections */}
              {[SETTINGS_SECTIONS.PROFILE, SETTINGS_SECTIONS.NOTIFICATIONS, SETTINGS_SECTIONS.PRIVACY].includes(activeSection) && (
                <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="primary"
                      onClick={handleSave}
                      disabled={isSaving || !hasUnsavedChanges}
                      className="min-w-[100px]"
                    >
                      {isSaving ? <Spinner size="sm" /> : 'Save Changes'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      disabled={isSaving || !hasUnsavedChanges}
                    >
                      Reset
                    </Button>
                  </div>
                  
                  {hasUnsavedChanges && (
                    <div className="text-sm text-amber-600 dark:text-amber-400 flex items-center space-x-1">
                      <span>•</span>
                      <span>You have unsaved changes</span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Export as default
export default SettingsPage;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses hooks and services
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant) - includes aria-current, aria-pressed, proper form labels
