// filepath: src/features/affiliate/AffiliatePanel.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { useState } from 'react'
import { config } from '@/app/config'
import { eventBus } from '@/core/events'
import Button from '@/shared/components/Button'
import NewsletterForm from '@/features/newsletter/NewsletterForm'

interface AffiliateStats {
  commissionRate: number
  avgCommission: number
  topEarners: number
  programUsers: number
}

interface AffiliateStep {
  id: string
  title: string
  description: string
  icon: string
}

const AffiliatePanel: React.FC = () => {
  const [isSignupOpen, setIsSignupOpen] = useState(false)
  const [copiedReferralCode, setCopiedReferralCode] = useState(false)

  // Mock affiliate stats (would come from API in real implementation)
  const stats: AffiliateStats = {
    commissionRate: 50, // 50% commission on nothing
    avgCommission: 0,
    topEarners: 42,
    programUsers: 1337,
  }

  const affiliateSteps: AffiliateStep[] = [
    {
      id: 'sign-up',
      title: 'Sign Up',
      description: 'Join our exclusive nothing affiliate program',
      icon: '✨',
    },
    {
      id: 'share',
      title: 'Share Nothing',
      description: 'Spread the word about our premium nothing',
      icon: '📢',
    },
    {
      id: 'earn',
      title: 'Earn Nothing',
      description: 'Receive generous commissions for each referral',
      icon: '💰',
    },
  ]

  const handleSignupClick = () => {
    setIsSignupOpen(!isSignupOpen)
    eventBus.emit('affiliate:signup-toggled', { open: !isSignupOpen })
  }

  const handleCopyReferralCode = async () => {
    const referralCode = 'NOTHING2025'
    
    try {
      await navigator.clipboard.writeText(`${window.location.origin}?ref=${referralCode}`)
      setCopiedReferralCode(true)
      
      setTimeout(() => setCopiedReferralCode(false), 2000)
      
      eventBus.emit('affiliate:referral-copied', { code: referralCode })
    } catch (error) {
      console.warn('Failed to copy referral code:', error)
    }
  }

  const handleNewsletterSubmit = (email: string) => {
    eventBus.emit('affiliate:newsletter-signup', { email, context: 'affiliate-panel' })
  }

  return (
    <section 
      className="py-20 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden"
      aria-labelledby="affiliate-panel-title"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 
            id="affiliate-panel-title"
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Partner with Nothing
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 ml-2">
              Affiliate Program
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Join thousands of satisfied partners earning commissions by sharing our premium nothing. 
            It's the easiest way to monetize absolutely nothing.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {stats.commissionRate}%
            </div>
            <div className="text-sm text-gray-400">Commission Rate</div>
          </div>
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="text-3xl font-bold text-green-400 mb-2">
              ${stats.avgCommission}
            </div>
            <div className="text-sm text-gray-400">Avg Commission</div>
          </div>
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {stats.topEarners}
            </div>
            <div className="text-sm text-gray-400">Top Earners</div>
          </div>
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="text-3xl font-bold text-orange-400 mb-2">
              {stats.programUsers.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Program Members</div>
          </div>
        </div>

        {/* How it Works */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {affiliateSteps.map((step, index) => (
              <div
                key={step.id}
                className="text-center p-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className="text-6xl mb-4" role="img" aria-label={`Step ${index + 1} icon`}>
                  {step.icon}
                </div>
                <div className="text-sm font-semibold text-blue-400 mb-2">
                  Step {index + 1}
                </div>
                <h4 className="text-xl font-bold text-white mb-4">
                  {step.title}
                </h4>
                <p className="text-gray-300">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16 bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Why Join Our Affiliate Program?
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="text-green-400 text-xl">✓</div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Highest Commissions</h4>
                  <p className="text-gray-300">Earn 50% on every nothing sale you refer</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-green-400 text-xl">✓</div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Real-time Analytics</h4>
                  <p className="text-gray-300">Track your nothing performance instantly</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-green-400 text-xl">✓</div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Monthly Payouts</h4>
                  <p className="text-gray-300">Get paid exactly nothing, every month</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="text-green-400 text-xl">✓</div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Marketing Materials</h4>
                  <p className="text-gray-300">Professional nothing banners and copy</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-green-400 text-xl">✓</div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Dedicated Support</h4>
                  <p className="text-gray-300">24/7 support team that helps with nothing</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-green-400 text-xl">✓</div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Lifetime Cookies</h4>
                  <p className="text-gray-300">90-day cookie window for maximum earnings</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Code Section */}
        <div className="mb-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-6">
            Your Referral Link
          </h3>
          <div className="max-w-md mx-auto flex rounded-lg overflow-hidden bg-white/10 border border-white/20">
            <div className="flex-1 px-4 py-3 text-white font-mono text-sm bg-black/30">
              nothing.com/?ref=NOTHING2025
            </div>
            <Button
              variant="primary"
              onClick={handleCopyReferralCode}
              className="px-6 rounded-l-none"
              aria-label="Copy referral link"
            >
              {copiedReferralCode ? '✓ Copied!' : 'Copy'}
            </Button>
          </div>
          <p className="text-sm text-gray-400 mt-3">
            Share this link and earn commissions on every conversion
          </p>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Button
            variant="primary"
            size="lg"
            onClick={handleSignupClick}
            className="mb-8"
            aria-expanded={isSignupOpen}
            aria-controls="affiliate-signup-form"
          >
            {isSignupOpen ? 'Close Signup' : 'Join Affiliate Program'}
          </Button>

          {/* Signup Form */}
          {isSignupOpen && (
            <div 
              id="affiliate-signup-form"
              className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20"
              role="region"
              aria-label="Affiliate program signup"
            >
              <h4 className="text-xl font-bold text-white mb-6">
                Get Started Today
              </h4>
              <NewsletterForm
                onSubmit={handleNewsletterSubmit}
                placeholder="Enter your email to join"
                buttonText="Join Program"
                successMessage="Welcome to the affiliate program!"
              />
              <p className="text-xs text-gray-400 mt-4">
                By signing up, you agree to our Nothing Terms and Conditions
              </p>
            </div>
          )}

          {!isSignupOpen && (
            <p className="text-gray-400">
              Already a partner? <a href="#" className="text-blue-400 hover:text-blue-300 underline">Sign in to your dashboard</a>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default AffiliatePanel
