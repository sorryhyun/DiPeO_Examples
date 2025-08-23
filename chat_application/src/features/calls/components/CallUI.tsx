import { useState, useCallback, useEffect } from 'react';
import Icon from '../../../shared/components/atoms/Icon';

interface CallUIProps {
  onStartCall?: () => void;
  onEndCall?: () => void;
}

interface Participant {
  id: string;
  name: string;
  isMuted: boolean;
  isCameraOn: boolean;
}

export default function CallUI({ onStartCall, onEndCall }: CallUIProps) {
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  
  // Mock participants for development
  const [participants] = useState<Participant[]>([
    { id: '1', name: 'You', isMuted: false, isCameraOn: true },
    { id: '2', name: 'John Doe', isMuted: false, isCameraOn: true },
    { id: '3', name: 'Jane Smith', isMuted: true, isCameraOn: false },
  ]);

  const handleStartCall = useCallback(() => {
    setIsInCall(true);
    onStartCall?.();
  }, [onStartCall]);

  const handleEndCall = useCallback(() => {
    setIsInCall(false);
    setIsMuted(false);
    setIsCameraOn(true);
    onEndCall?.();
  }, [onEndCall]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const toggleCamera = useCallback(() => {
    setIsCameraOn(prev => !prev);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isInCall) return;

      switch (event.key.toLowerCase()) {
        case 'm':
          if (event.target === document.body || (event.target as HTMLElement).tagName !== 'INPUT') {
            event.preventDefault();
            toggleMute();
          }
          break;
        case 'v':
          if (event.target === document.body || (event.target as HTMLElement).tagName !== 'INPUT') {
            event.preventDefault();
            toggleCamera();
          }
          break;
        case 'escape':
          event.preventDefault();
          handleEndCall();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isInCall, toggleMute, toggleCamera, handleEndCall]);

  if (!isInCall) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="mb-6">
          <Icon name="video" className="w-16 h-16 text-gray-400 dark:text-gray-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Start a Call
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          Connect with your team members through voice and video
        </p>
        <button
          onClick={handleStartCall}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          aria-label="Start call"
        >
          Start Call
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video"
            >
              {/* Video placeholder */}
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                {participant.isCameraOn ? (
                  <div className="text-gray-400 text-sm">
                    {participant.name}'s video
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Icon name="video-off" className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-gray-400 text-sm">Camera off</span>
                  </div>
                )}
              </div>
              
              {/* Participant info */}
              <div className="absolute bottom-2 left-2 flex items-center space-x-2">
                <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {participant.name}
                </span>
                {participant.isMuted && (
                  <Icon name="mic-off" className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex items-center justify-center p-6 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center space-x-4">
          {/* Mute button */}
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
              isMuted
                ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500'
                : 'bg-gray-600 hover:bg-gray-500 focus:ring-gray-500'
            }`}
            aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
          >
            <Icon 
              name={isMuted ? 'mic-off' : 'mic'} 
              className="w-5 h-5 text-white" 
            />
          </button>

          {/* Camera button */}
          <button
            onClick={toggleCamera}
            className={`p-4 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
              !isCameraOn
                ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500'
                : 'bg-gray-600 hover:bg-gray-500 focus:ring-gray-500'
            }`}
            aria-label={!isCameraOn ? 'Turn camera on' : 'Turn camera off'}
            title={!isCameraOn ? 'Turn camera on (V)' : 'Turn camera off (V)'}
          >
            <Icon 
              name={!isCameraOn ? 'video-off' : 'video'} 
              className="w-5 h-5 text-white" 
            />
          </button>

          {/* End call button */}
          <button
            onClick={handleEndCall}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            aria-label="End call"
            title="End call (Esc)"
          >
            <Icon name="phone-off" className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Keyboard shortcuts info */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-xs p-2 rounded opacity-75">
        <div>M: Toggle mute</div>
        <div>V: Toggle camera</div>
        <div>Esc: End call</div>
      </div>
    </div>
  );
}
