import React, { useContext } from 'react';
import { ThemeProvider } from '../providers/ThemeProvider';
import { SoundProvider } from '../providers/SoundProvider';
import { useGameStore } from '../state/store';
import { useLocalStorage } from '../shared/hooks/useLocalStorage';
import SoundToggle from '../shared/components/SoundToggle';
import ThemeSelector from '../shared/components/ThemeSelector';
import Button from '../shared/components/Button';

const SettingsPage: React.FC = () => {
  const { mode, setMode } = useContext(ThemeProvider.Context);
  const { muted, volume, setVolume } = useContext(SoundProvider.Context);
  
  const { settings, updateSettings } = useGameStore();
  
  const [colorblindMode, setColorblindMode] = useLocalStorage<boolean>(
    'memorygame:v1:colorblind-mode',
    false
  );
  
  const [hapticFeedback, setHapticFeedback] = useLocalStorage<boolean>(
    'memorygame:v1:haptic-feedback',
    true
  );
  
  const [persistenceEnabled, setPersistenceEnabled] = useLocalStorage<boolean>(
    'memorygame:v1:persistence-enabled',
    true
  );

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
  };

  const handleColorblindModeToggle = () => {
    const newMode = !colorblindMode;
    setColorblindMode(newMode);
    updateSettings({ colorblindMode: newMode });
  };

  const handleHapticFeedbackToggle = () => {
    const newHaptic = !hapticFeedback;
    setHapticFeedback(newHaptic);
    updateSettings({ hapticFeedback: newHaptic });
  };

  const handlePersistenceToggle = () => {
    const newPersistence = !persistenceEnabled;
    setPersistenceEnabled(newPersistence);
    updateSettings({ persistenceEnabled: newPersistence });
  };

  const handleUIThemeToggle = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  const resetSettings = () => {
    setColorblindMode(false);
    setHapticFeedback(true);
    setPersistenceEnabled(true);
    setMode('light');
    setVolume(1.0);
    updateSettings({
      colorblindMode: false,
      hapticFeedback: true,
      persistenceEnabled: true
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Customize your memory game experience
            </p>
          </div>

          <div className="space-y-8">
            {/* Theme Settings */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Appearance
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      UI Theme
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Switch between light and dark mode
                    </p>
                  </div>
                  <Button
                    onClick={handleUIThemeToggle}
                    className="px-4 py-2 text-sm"
                    ariaLabel={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
                  >
                    {mode === 'dark' ? '☀️ Light' : '🌙 Dark'}
                  </Button>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                    Card Theme
                  </label>
                  <ThemeSelector />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      Colorblind-Friendly Mode
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Use high contrast colors and patterns
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                      colorblindMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                    role="switch"
                    aria-checked={colorblindMode}
                    onClick={handleColorblindModeToggle}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        colorblindMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Sound Settings */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Audio
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      Sound Effects
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Enable or disable game sounds
                    </p>
                  </div>
                  <SoundToggle />
                </div>

                {!muted && (
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                      Volume: {Math.round(volume * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Accessibility Settings */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Accessibility
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      Haptic Feedback
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Vibrate on card interactions (mobile devices)
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                      hapticFeedback ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                    role="switch"
                    aria-checked={hapticFeedback}
                    onClick={handleHapticFeedbackToggle}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        hapticFeedback ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Data Settings */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Data & Storage
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      Local Storage Persistence
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Save game progress and settings locally
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                      persistenceEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                    role="switch"
                    aria-checked={persistenceEnabled}
                    onClick={handlePersistenceToggle}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        persistenceEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Reset Settings */}
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Reset Settings
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Restore all settings to their default values
                  </p>
                </div>
                <Button
                  onClick={resetSettings}
                  className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white"
                  ariaLabel="Reset all settings to default"
                >
                  Reset All
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
