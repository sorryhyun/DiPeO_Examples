import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-black text-white py-12 mt-16" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Absolutely Nothing™</h3>
            <p className="text-sm text-gray-300 dark:text-gray-400">
              The premium solution for all your nothing needs. Experience the void like never before.
            </p>
            <div className="flex space-x-4">
              <a
                href="#newsletter"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
                aria-label="Subscribe to our newsletter"
              >
                Newsletter
              </a>
              <a
                href="#testimonials"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
                aria-label="View customer testimonials"
              >
                Testimonials
              </a>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-100">Resources</h4>
            <nav className="flex flex-col space-y-2" role="navigation" aria-label="Footer resources">
              <a
                href="#press-kit"
                className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="Access our press kit"
              >
                Press Kit
              </a>
              <a
                href="#api-docs"
                className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="View API documentation"
              >
                API Documentation
              </a>
              <a
                href="#status"
                className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="Check system status"
              >
                Status Page
              </a>
              <a
                href="#affiliate"
                className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="Join our affiliate program"
              >
                Affiliate Program
              </a>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-100">Support</h4>
            <nav className="flex flex-col space-y-2" role="navigation" aria-label="Footer support">
              <a
                href="#faq"
                className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="Frequently asked questions"
              >
                FAQ
              </a>
              <a
                href="#support"
                className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="Contact support"
              >
                Support Chat
              </a>
              <a
                href="#team"
                className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="Meet our team"
              >
                Our Team
              </a>
              <a
                href="#guarantee"
                className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="Money-back guarantee"
              >
                Guarantee
              </a>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-100">Legal</h4>
            <nav className="flex flex-col space-y-2" role="navigation" aria-label="Footer legal">
              <a
                href="#privacy"
                className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="Privacy policy"
              >
                Privacy Policy
              </a>
              <a
                href="#terms"
                className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="Terms of service"
              >
                Terms of Service
              </a>
              <a
                href="#cookies"
                className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="Cookie policy"
              >
                Cookie Policy
              </a>
              <a
                href="mailto:unsubscribe@absolutelynothing.com"
                className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="Unsubscribe from communications"
              >
                Unsubscribe
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 dark:border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-400">
                © {currentYear} Absolutely Nothing™. All rights reserved. 
                <span className="block md:inline md:ml-2">
                  Providing premium nothing since forever.
                </span>
              </p>
            </div>

            {/* Social Proof & Links */}
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" aria-hidden="true"></span>
                <span>100% Uptime</span>
              </span>
              <span>∞ Satisfied Customers</span>
              <span>0 Features Delivered</span>
            </div>
          </div>

          {/* Additional Microcopy */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Absolutely Nothing™ is a registered trademark of The Void Corporation. 
              No actual features were harmed in the making of this product.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
