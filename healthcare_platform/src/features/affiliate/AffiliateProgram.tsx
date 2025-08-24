import React, { useState } from 'react';
import { Button } from '@/shared/components/Button';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';

interface AffiliateFormData {
  email: string;
  name: string;
  platform: string;
}

export const AffiliateProgram: React.FC = () => {
  const [formData, setFormData] = useState<AffiliateFormData>({
    email: '',
    name: '',
    platform: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referralCode, setReferralCode] = useLocalStorage('affiliate_referral_code', '');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a mock referral code
    const mockCode = `NOTHING-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setReferralCode(mockCode);
    setIsSubmitted(true);
  };

  const shareLinks = {
    email: `mailto:?subject=You'll%20love%20this%20absolutely%20nothing&body=Check%20out%20this%20amazing%20absolutely%20nothing%20at%20absolutelynothing.com%3Fref%3D${referralCode}`,
    twitter: `https://twitter.com/intent/tweet?text=Just%20discovered%20absolutely%20nothing%20and%20it's%20amazing!&url=absolutelynothing.com%3Fref%3D${referralCode}`,
    facebook: `https://facebook.com/sharer/sharer.php?u=absolutelynothing.com%3Fref%3D${referralCode}`,
    linkedin: `https://linkedin.com/sharing/share-offsite/?url=absolutelynothing.com%3Fref%3D${referralCode}`
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-black text-white" role="region" aria-labelledby="affiliate-title">
      <div className="max-w-4xl mx-auto text-center">
        <h2 id="affiliate-title" className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Join Our Affiliate Program
        </h2>
        
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Earn absolutely nothing by sharing absolutely nothing. It's the most honest affiliate program ever created.
        </p>

        {!isSubmitted ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-12">
            <h3 className="text-2xl font-bold mb-6 text-purple-400">Why Become an Affiliate?</h3>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4">
                <div className="text-4xl mb-4">💸</div>
                <h4 className="font-bold text-lg mb-2">0% Commission</h4>
                <p className="text-gray-400">Earn exactly nothing for every sale. Maximum transparency!</p>
              </div>
              
              <div className="text-center p-4">
                <div className="text-4xl mb-4">📊</div>
                <h4 className="font-bold text-lg mb-2">Real-Time Analytics</h4>
                <p className="text-gray-400">Track your $0.00 earnings in real-time with our advanced dashboard.</p>
              </div>
              
              <div className="text-center p-4">
                <div className="text-4xl mb-4">🎯</div>
                <h4 className="font-bold text-lg mb-2">Infinite Potential</h4>
                <p className="text-gray-400">Your earning potential is limitless (and also zero).</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
              <div>
                <label htmlFor="affiliate-name" className="sr-only">Your Name</label>
                <input
                  id="affiliate-name"
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                />
              </div>
              
              <div>
                <label htmlFor="affiliate-email" className="sr-only">Email Address</label>
                <input
                  id="affiliate-email"
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                />
              </div>
              
              <div>
                <label htmlFor="affiliate-platform" className="sr-only">Primary Platform</label>
                <select
                  id="affiliate-platform"
                  name="platform"
                  value={formData.platform}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                >
                  <option value="">Select Your Platform</option>
                  <option value="blog">Personal Blog</option>
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                  <option value="twitter">Twitter</option>
                  <option value="tiktok">TikTok</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
                aria-describedby="affiliate-submit-description"
              >
                Generate My Referral Code
              </Button>
              <p id="affiliate-submit-description" className="sr-only">
                Submit form to generate your unique affiliate referral code
              </p>
            </form>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-green-800/30 to-blue-800/30 backdrop-blur-sm rounded-2xl p-8 mb-12">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold mb-4 text-green-400">Welcome to the Team!</h3>
            <p className="text-lg mb-6">Your unique referral code:</p>
            
            <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
              <code className="text-2xl font-mono text-purple-400">{referralCode}</code>
              <button
                onClick={() => navigator.clipboard?.writeText(referralCode)}
                className="ml-4 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
                aria-label="Copy referral code to clipboard"
              >
                Copy
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="text-xl font-bold mb-4">Share the Nothing:</h4>
              <div className="flex flex-wrap gap-4 justify-center">
                <a
                  href={shareLinks.email}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
                  aria-label="Share via email"
                >
                  📧 Email
                </a>
                <a
                  href={shareLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                  aria-label="Share on Twitter"
                >
                  🐦 Twitter
                </a>
                <a
                  href={shareLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors flex items-center gap-2"
                  aria-label="Share on Facebook"
                >
                  📘 Facebook
                </a>
                <a
                  href={shareLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-2"
                  aria-label="Share on LinkedIn"
                >
                  💼 LinkedIn
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4 text-purple-400">The Fine Print</h3>
          <div className="text-gray-400 space-y-2 max-w-2xl mx-auto">
            <p>• No actual money will be exchanged in this affiliate program</p>
            <p>• Commission rates are guaranteed to remain at 0% forever</p>
            <p>• Payment processing fees: $0 (because there are no payments)</p>
            <p>• Cookie duration: As long as it takes to realize there's nothing here</p>
            <p>• Terms subject to change to remain absolutely nothing</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AffiliateProgram;
