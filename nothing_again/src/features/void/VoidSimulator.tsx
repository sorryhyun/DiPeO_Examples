import React, { useState, useCallback } from 'react';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import { APP_CONFIG } from '@/constants/appConfig';

export interface VoidSimulatorSettings {
  intensity: number;
  particleCount: number;
  rotationSpeed: number;
  opacity: number;
  voidDepth: number;
  nothingFactor: number;
}

interface VoidSimulatorProps {
  onSettingsChange?: (settings: VoidSimulatorSettings) => void;
  initialSettings?: Partial<VoidSimulatorSettings>;
  className?: string;
}

const defaultSettings: VoidSimulatorSettings = {
  intensity: 50,
  particleCount: 100,
  rotationSpeed: 25,
  opacity: 80,
  voidDepth: 75,
  nothingFactor: 100,
};

export const VoidSimulator: React.FC<VoidSimulatorProps> = ({
  onSettingsChange,
  initialSettings = {},
  className = '',
}) => {
  const [storedSettings, setStoredSettings] = useLocalStorage<VoidSimulatorSettings>(
    'void-simulator-settings',
    { ...defaultSettings, ...initialSettings },
    APP_CONFIG.development_mode.use_localstorage_persistence
  );

  const [settings, setSettings] = useState<VoidSimulatorSettings>(storedSettings);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSettingChange = useCallback((key: keyof VoidSimulatorSettings, value: number) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    if (APP_CONFIG.development_mode.use_localstorage_persistence) {
      setStoredSettings(newSettings);
    }
    
    onSettingsChange?.(newSettings);
  }, [settings, setStoredSettings, onSettingsChange]);

  const resetToDefaults = useCallback(() => {
    const newSettings = { ...defaultSettings };
    setSettings(newSettings);
    
    if (APP_CONFIG.development_mode.use_localstorage_persistence) {
      setStoredSettings(newSettings);
    }
    
    onSettingsChange?.(newSettings);
  }, [setStoredSettings, onSettingsChange]);

  const simulateVoid = useCallback(() => {
    setIsSimulating(true);
    // Simulate intense void activity for 2 seconds
    setTimeout(() => {
      setIsSimulating(false);
    }, 2000);
  }, []);

  const renderControl = (
    label: string,
    key: keyof VoidSimulatorSettings,
    min: number,
    max: number,
    step: number = 1,
    unit: string = ''
  ) => (
    <div className="space-y-2">
      <label 
        htmlFor={`void-${key}`}
        className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        <span>{label}</span>
        <span className="text-purple-600 dark:text-purple-400">
          {settings[key]}{unit}
        </span>
      </label>
      <input
        type="range"
        id={`void-${key}`}
        min={min}
        max={max}
        step={step}
        value={settings[key]}
        onChange={(e) => handleSettingChange(key, parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider-thumb:appearance-none slider-thumb:h-4 slider-thumb:w-4 slider-thumb:rounded-full slider-thumb:bg-purple-500 slider-thumb:cursor-pointer"
        aria-label={`Adjust ${label}`}
      />
    </div>
  );

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6 border border-gray-200 dark:border-gray-700 ${className}`}
      role="region"
      aria-label="Void Simulator Controls"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></span>
          Void Simulator™
        </h3>
        <button
          onClick={resetToDefaults}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          aria-label="Reset all settings to defaults"
        >
          Reset Defaults
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Void Parameters
          </h4>
          {renderControl('Void Intensity', 'intensity', 0, 100, 1, '%')}
          {renderControl('Nothing Factor', 'nothingFactor', 0, 200, 5, '%')}
          {renderControl('Void Depth', 'voidDepth', 0, 100, 5, '%')}
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Visual Effects
          </h4>
          {renderControl('Particle Count', 'particleCount', 0, 500, 10)}
          {renderControl('Rotation Speed', 'rotationSpeed', 0, 100, 5, ' RPM')}
          {renderControl('Opacity', 'opacity', 0, 100, 5, '%')}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Current State: <span className="font-mono text-purple-600 dark:text-purple-400">
              {isSimulating ? 'SIMULATING_VOID' : 'IDLE_NOTHING'}
            </span>
          </div>
          <button
            onClick={simulateVoid}
            disabled={isSimulating}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
              isSimulating
                ? 'bg-purple-100 text-purple-400 cursor-not-allowed dark:bg-purple-900 dark:text-purple-600'
                : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105 active:scale-95 dark:bg-purple-500 dark:hover:bg-purple-600'
            }`}
            aria-label={isSimulating ? 'Simulation in progress' : 'Start void simulation'}
          >
            {isSimulating ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                Simulating...
              </span>
            ) : (
              'Simulate Void'
            )}
          </button>
        </div>
      </div>

      {/* Simulation Status Indicator */}
      {isSimulating && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 relative">
              <div className="absolute inset-0 border-2 border-purple-300 rounded-full animate-spin border-t-purple-600"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                Void Simulation Active
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                Generating absolutely nothing with {settings.intensity}% intensity
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
