import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../shared/components/Button';
import { useSound } from '../shared/hooks/useSound';

const NotFoundPage: React.FC = () => {
  const [countdown, setCountdown] = useState(10);
  const navigate = useNavigate();
  const { playSound } = useSound();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleFindMoreNothing = async () => {
    await playSound('/assets/sounds/silence.mp3');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            404
          </h1>
          <h2 className="text-4xl font-semibold text-white mb-6">
            Nothing Found Here Either
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Congratulations! You've discovered an even deeper level of nothing. 
            This page contains absolutely nothing, just like our premium product.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
          <p className="text-lg text-gray-200 mb-4">
            Don't worry, we'll redirect you to our homepage full of premium nothing in:
          </p>
          <div className="text-6xl font-bold text-purple-400 mb-6 tabular-nums">
            {countdown}
          </div>
          <p className="text-sm text-gray-400">
            seconds of anticipation (which is still more than nothing)
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleFindMoreNothing}
            className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            Find More Nothing Now
          </Button>
          
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="px-8 py-4 text-lg font-semibold border-2 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            Go Back to Less Nothing
          </Button>
        </div>

        <div className="mt-12">
          <p className="text-sm text-gray-500 italic">
            "Even our 404 page is an artful expression of nothing." - The Nothing Team
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
