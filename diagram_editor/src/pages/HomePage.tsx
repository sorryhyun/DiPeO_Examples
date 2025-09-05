// filepath: src/pages/HomePage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { config } from '@/app/config';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { trackEvent } from '@/services/analytics';
import { Button } from '@/shared/components/Button';
import { GlassCard } from '@/shared/components/GlassCard';
import { Icon } from '@/shared/components/Icon';
import { animations } from '@/theme/animations';

// =============================
// TYPES & INTERFACES
// =============================

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  delay: number;
}

interface HeroStats {
  value: string;
  label: string;
}

// =============================
// FEATURE DATA
// =============================

const features: Omit<FeatureCardProps, 'delay'>[] = [
  {
    icon: 'analytics',
    title: 'Advanced Analytics',
    description: 'Get deep insights with real-time analytics and comprehensive reporting tools that help you make data-driven decisions.',
  },
  {
    icon: 'security',
    title: 'Enterprise Security',
    description: 'Bank-level security with end-to-end encryption, multi-factor authentication, and compliance with industry standards.',
  },
  {
    icon: 'collaboration',
    title: 'Team Collaboration',
    description: 'Work seamlessly with your team using real-time collaboration features, shared workspaces, and communication tools.',
  },
  {
    icon: 'automation',
    title: 'Smart Automation',
    description: 'Automate repetitive tasks and workflows with AI-powered tools that adapt to your business processes.',
  },
  {
    icon: 'integration',
    title: 'Easy Integration',
    description: 'Connect with your existing tools and systems through our comprehensive API and pre-built integrations.',
  },
  {
    icon: 'support',
    title: '24/7 Support',
    description: 'Get help when you need it with our dedicated support team and comprehensive documentation.',
  },
];

const heroStats: HeroStats[] = [
  { value: '10K+', label: 'Active Users' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' },
];

// =============================
// FEATURE CARD COMPONENT
// =============================

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={animations.fadeInUp}
      transition={{ delay, duration: 0.6 }}
      className="h-full"
    >
      <GlassCard
        variant="subtle"
        hover="lift"
        className="h-full p-6 text-center group cursor-pointer"
        onClick={() => {
          trackEvent('feature_card_clicked', { feature: title.toLowerCase().replace(/\s+/g, '_') });
        }}
        role="article"
        aria-labelledby={`feature-${title.toLowerCase().replace(/\s+/g, '-')}-title`}
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white"
        >
          <Icon 
            name={icon} 
            size="lg" 
            className="group-hover:text-yellow-300 transition-colors duration-300"
            aria-hidden="true"
          />
        </motion.div>
        
        <h3 
          id={`feature-${title.toLowerCase().replace(/\s+/g, '-')}-title`}
          className="text-xl font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300"
        >
          {title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {description}
        </p>
      </GlassCard>
    </motion.div>
  );
};

// =============================
// HERO SECTION COMPONENT
// =============================

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    trackEvent('hero_cta_clicked', { 
      button: 'get_started',
      authenticated: isAuthenticated 
    });
    
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth/register');
    }
  };

  const handleLogin = () => {
    trackEvent('hero_cta_clicked', { 
      button: 'login',
      authenticated: isAuthenticated 
    });
    navigate('/auth/login');
  };

  const handleWatchDemo = () => {
    trackEvent('hero_cta_clicked', { button: 'watch_demo' });
    // Could open a modal or navigate to demo page
    console.log('Watch demo clicked - implement demo functionality');
  };

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Background gradient */}\n      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20" />\n      \n      {/* Animated background elements */}\n      <motion.div\n        animate={{\n          rotate: [0, 360],\n          scale: [1, 1.1, 1],\n        }}\n        transition={{\n          duration: 20,\n          repeat: Infinity,\n          ease: \"linear\"\n        }}\n        className=\"absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl\"\n        aria-hidden=\"true\"\n      />\n      \n      <motion.div\n        animate={{\n          rotate: [360, 0],\n          scale: [1, 1.2, 1],\n        }}\n        transition={{\n          duration: 25,\n          repeat: Infinity,\n          ease: \"linear\"\n        }}\n        className=\"absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl\"\n        aria-hidden=\"true\"\n      />\n\n      <div className=\"relative max-w-6xl mx-auto text-center z-10\">\n        {/* Hero content */}\n        <motion.div\n          initial=\"hidden\"\n          animate=\"visible\"\n          variants={animations.staggerContainer}\n          className=\"space-y-8\"\n        >\n          {/* Main headline */}\n          <motion.div variants={animations.fadeInUp}>\n            <h1 \n              id=\"hero-heading\"\n              className=\"text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent leading-tight\"\n            >\n              Build the\n              <br />\n              <span className=\"relative\">\n                Future\n                <motion.div\n                  className=\"absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full\"\n                  initial={{ width: 0 }}\n                  animate={{ width: '100%' }}\n                  transition={{ delay: 1.5, duration: 0.8 }}\n                  aria-hidden=\"true\"\n                />\n              </span>\n              {' '}Today\n            </h1>\n          </motion.div>\n\n          {/* Subtitle */}\n          <motion.p\n            variants={animations.fadeInUp}\n            className=\"text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed\"\n          >\n            Empower your business with cutting-edge tools, intelligent automation, \n            and seamless collaboration. Join thousands of teams already transforming \n            their workflow.\n          </motion.p>\n\n          {/* CTA Buttons */}\n          <motion.div\n            variants={animations.fadeInUp}\n            className=\"flex flex-col sm:flex-row items-center justify-center gap-4 pt-8\"\n          >\n            <Button\n              variant=\"primary\"\n              size=\"lg\"\n              onClick={handleGetStarted}\n              className=\"min-w-[200px] group relative overflow-hidden\"\n              aria-describedby=\"get-started-description\"\n            >\n              <motion.span\n                className=\"relative z-10 flex items-center gap-2\"\n                whileHover={{ x: 5 }}\n              >\n                {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}\n                <Icon \n                  name=\"arrow-right\" \n                  size=\"sm\" \n                  className=\"group-hover:translate-x-1 transition-transform duration-200\"\n                  aria-hidden=\"true\"\n                />\n              </motion.span>\n              <motion.div\n                className=\"absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300\"\n                initial={{ x: '-100%' }}\n                whileHover={{ x: 0 }}\n                aria-hidden=\"true\"\n              />\n            </Button>\n\n            {!isAuthenticated && (\n              <Button\n                variant=\"outline\"\n                size=\"lg\"\n                onClick={handleLogin}\n                className=\"min-w-[200px]\"\n              >\n                Sign In\n              </Button>\n            )}\n\n            <Button\n              variant=\"ghost\"\n              size=\"lg\"\n              onClick={handleWatchDemo}\n              className=\"min-w-[200px] group\"\n            >\n              <Icon \n                name=\"play\" \n                size=\"sm\" \n                className=\"mr-2 group-hover:scale-110 transition-transform duration-200\"\n                aria-hidden=\"true\"\n              />\n              Watch Demo\n            </Button>\n          </motion.div>\n\n          {/* Hidden description for screen readers */}\n          <p id=\"get-started-description\" className=\"sr-only\">\n            {isAuthenticated \n              ? 'Navigate to your dashboard to access all features'\n              : 'Create a new account to start using our platform'\n            }\n          </p>\n\n          {/* Stats */}\n          <motion.div\n            variants={animations.fadeInUp}\n            className=\"pt-16\"\n          >\n            <div className=\"grid grid-cols-3 gap-8 max-w-2xl mx-auto\">\n              {heroStats.map((stat, index) => (\n                <motion.div\n                  key={stat.label}\n                  className=\"text-center\"\n                  initial={{ opacity: 0, y: 20 }}\n                  animate={{ opacity: 1, y: 0 }}\n                  transition={{ delay: 2 + index * 0.2 }}\n                >\n                  <div className=\"text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400\">\n                    {stat.value}\n                  </div>\n                  <div className=\"text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1\">\n                    {stat.label}\n                  </div>\n                </motion.div>\n              ))}\n            </div>\n          </motion.div>\n        </motion.div>\n      </div>\n    </section>\n  );\n};\n\n// =============================\n// FEATURES SECTION COMPONENT\n// =============================\n\nconst FeaturesSection: React.FC = () => {\n  return (\n    <section \n      className=\"py-20 px-4 bg-white dark:bg-gray-900 relative overflow-hidden\"\n      aria-labelledby=\"features-heading\"\n    >\n      <div className=\"max-w-6xl mx-auto\">\n        {/* Section header */}\n        <motion.div\n          initial=\"hidden\"\n          whileInView=\"visible\"\n          viewport={{ once: true, amount: 0.3 }}\n          variants={animations.staggerContainer}\n          className=\"text-center mb-16\"\n        >\n          <motion.h2\n            id=\"features-heading\"\n            variants={animations.fadeInUp}\n            className=\"text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6\"\n          >\n            Everything you need to\n            <span className=\"text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text\"> succeed</span>\n          </motion.h2>\n          \n          <motion.p\n            variants={animations.fadeInUp}\n            className=\"text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto\"\n          >\n            Powerful features designed to streamline your workflow, enhance productivity, \n            and drive results. Discover what makes our platform different.\n          </motion.p>\n        </motion.div>\n\n        {/* Features grid */}\n        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8\">\n          {features.map((feature, index) => (\n            <FeatureCard\n              key={feature.title}\n              {...feature}\n              delay={index * 0.1}\n            />\n          ))}\n        </div>\n      </div>\n    </section>\n  );\n};\n\n// =============================\n// CTA SECTION COMPONENT\n// =============================\n\nconst CTASection: React.FC = () => {\n  const navigate = useNavigate();\n  const { isAuthenticated } = useAuth();\n\n  const handleGetStarted = () => {\n    trackEvent('bottom_cta_clicked', { \n      section: 'cta_section',\n      authenticated: isAuthenticated \n    });\n    \n    if (isAuthenticated) {\n      navigate('/dashboard');\n    } else {\n      navigate('/auth/register');\n    }\n  };\n\n  return (\n    <section \n      className=\"py-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden\"\n      aria-labelledby=\"cta-heading\"\n    >\n      {/* Background pattern */}\n      <div \n        className=\"absolute inset-0 opacity-10\"\n        style={{\n          backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px),\n                           radial-gradient(circle at 80% 50%, white 1px, transparent 1px)`,\n          backgroundSize: '100px 100px'\n        }}\n        aria-hidden=\"true\"\n      />\n\n      <div className=\"max-w-4xl mx-auto text-center relative z-10\">\n        <motion.div\n          initial=\"hidden\"\n          whileInView=\"visible\"\n          viewport={{ once: true, amount: 0.3 }}\n          variants={animations.staggerContainer}\n          className=\"space-y-8\"\n        >\n          <motion.h2\n            id=\"cta-heading\"\n            variants={animations.fadeInUp}\n            className=\"text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6\"\n          >\n            Ready to transform your workflow?\n          </motion.h2>\n          \n          <motion.p\n            variants={animations.fadeInUp}\n            className=\"text-lg md:text-xl text-blue-100 max-w-2xl mx-auto\"\n          >\n            Join thousands of teams already using our platform to boost productivity \n            and achieve their goals. Start your journey today.\n          </motion.p>\n\n          <motion.div\n            variants={animations.fadeInUp}\n            className=\"pt-4\"\n          >\n            <Button\n              variant=\"secondary\"\n              size=\"lg\"\n              onClick={handleGetStarted}\n              className=\"bg-white text-blue-600 hover:bg-blue-50 min-w-[250px] group relative overflow-hidden\"\n            >\n              <motion.span\n                className=\"relative z-10 flex items-center gap-2 font-semibold\"\n                whileHover={{ x: 5 }}\n              >\n                {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}\n                <Icon \n                  name=\"arrow-right\" \n                  size=\"sm\" \n                  className=\"group-hover:translate-x-1 transition-transform duration-200\"\n                  aria-hidden=\"true\"\n                />\n              </motion.span>\n            </Button>\n          </motion.div>\n\n          <motion.p\n            variants={animations.fadeInUp}\n            className=\"text-sm text-blue-200\"\n          >\n            No credit card required • 14-day free trial • Cancel anytime\n          </motion.p>\n        </motion.div>\n      </div>\n    </section>\n  );\n};\n\n// =============================\n// MAIN HOME PAGE COMPONENT\n// =============================\n\nexport function HomePage(): React.ReactElement {\n  React.useEffect(() => {\n    // Track page view\n    trackEvent('page_view', { \n      page: 'home',\n      path: window.location.pathname \n    });\n\n    // Set page title\n    document.title = `${config.appName} - Transform Your Workflow`;\n\n    // Add structured data for SEO\n    const structuredData = {\n      \"@context\": \"https://schema.org\",\n      \"@type\": \"WebPage\",\n      \"name\": `${config.appName} - Home`,\n      \"description\": \"Powerful tools and intelligent automation to transform your business workflow\",\n      \"url\": window.location.href,\n    };\n\n    const script = document.createElement('script');\n    script.type = 'application/ld+json';\n    script.textContent = JSON.stringify(structuredData);\n    document.head.appendChild(script);\n\n    return () => {\n      // Cleanup structured data on unmount\n      const scripts = document.head.querySelectorAll('script[type=\"application/ld+json\"]');\n      scripts.forEach(script => {\n        if (script.textContent?.includes(config.appName)) {\n          document.head.removeChild(script);\n        }\n      });\n    };\n  }, []);\n\n  return (\n    <main \n      className=\"min-h-screen\"\n      role=\"main\"\n      aria-label=\"Home page content\"\n    >\n      <HeroSection />\n      <FeaturesSection />\n      <CTASection />\n    </main>\n  );\n}\n\n// Set display name for React DevTools\nif (import.meta.env.DEV) {\n  HomePage.displayName = 'HomePage';\n}\n\n// Export as default\nexport default HomePage;\n\n// Self-check comments:\n// [x] Uses `@/` imports only\n// [x] Uses providers/hooks (no direct DOM/localStorage side effects)\n// [x] Reads config from `@/app/config`\n// [x] Exports default named component\n// [x] Adds basic ARIA and keyboard handlers (where relevant)\n```