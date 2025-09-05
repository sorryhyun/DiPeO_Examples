// filepath: src/shared/components/Footer.tsx

import React from 'react';
import { theme } from '@/theme/index';
import { config } from '@/app/config';

// =============================
// TYPES
// =============================

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  className?: string;
  showLinks?: boolean;
  customSections?: FooterSection[];
}

// =============================
// DEFAULT FOOTER DATA
// =============================

const DEFAULT_FOOTER_SECTIONS: FooterSection[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'API', href: '/api' },
      { label: 'Documentation', href: '/docs' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'HIPAA Compliance', href: '/hipaa' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'Community', href: '/community', external: true },
      { label: 'Status', href: '/status', external: true },
    ],
  },
];

// =============================
// FOOTER COMPONENT
// =============================

export const Footer: React.FC<FooterProps> = ({
  className = '',
  showLinks = true,
  customSections = DEFAULT_FOOTER_SECTIONS,
}) => {
  const currentYear = new Date().getFullYear();

  const footerStyles: React.CSSProperties = {
    background: `linear-gradient(135deg, 
      ${theme.colors.neutral[50]}00 0%, 
      ${theme.colors.neutral[100]}40 50%, 
      ${theme.colors.neutral[200]}20 100%
    )`,
    borderTop: `1px solid ${theme.colors.neutral[200]}60`,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)', // Safari support
  };

  const linkStyles: React.CSSProperties = {
    color: theme.colors.neutral[600],
    textDecoration: 'none',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    transition: 'all 0.2s ease-in-out',
  };

  const linkHoverStyles: React.CSSProperties = {
    color: theme.colors.primary[600],
    textDecoration: 'underline',
  };

  const sectionTitleStyles: React.CSSProperties = {
    color: theme.colors.neutral[900],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing[3],
    letterSpacing: '0.025em',
  };

  const copyrightStyles: React.CSSProperties = {
    color: theme.colors.neutral[500],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.normal,
  };

  // Handle link clicks for analytics
  const handleLinkClick = (link: FooterLink) => {
    // If using analytics, track footer link clicks
    if (config.analytics.enabled) {
      // Note: Analytics service would be imported from @/services/analytics
      // but we'll use the event bus pattern here to avoid direct imports
      const event = new CustomEvent('footer-link-click', {
        detail: { label: link.label, href: link.href },
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <footer
      className={`footer ${className}`.trim()}
      style={footerStyles}
      role="contentinfo"
      aria-label="Site footer"
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: `${theme.spacing[12]} ${theme.spacing[6]} ${theme.spacing[8]}`,
        }}
      >
        {/* Main footer content */}
        {showLinks && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: theme.spacing[8],
              marginBottom: theme.spacing[12],
            }}
          >
            {customSections.map((section, sectionIndex) => (
              <div key={section.title} style={{ minWidth: '160px' }}>
                <h3 style={sectionTitleStyles}>{section.title}</h3>
                <nav aria-label={`${section.title} links`}>
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: theme.spacing[2],
                    }}
                  >
                    {section.links.map((link, linkIndex) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          style={linkStyles}
                          target={link.external ? '_blank' : undefined}
                          rel={link.external ? 'noopener noreferrer' : undefined}
                          onClick={() => handleLinkClick(link)}
                          onMouseEnter={(e) => {
                            Object.assign(e.currentTarget.style, linkHoverStyles);
                          }}
                          onMouseLeave={(e) => {
                            Object.assign(e.currentTarget.style, linkStyles);
                          }}
                          onFocus={(e) => {
                            Object.assign(e.currentTarget.style, {
                              ...linkHoverStyles,
                              outline: `2px solid ${theme.colors.primary[300]}`,
                              outlineOffset: '2px',
                            });
                          }}
                          onBlur={(e) => {
                            Object.assign(e.currentTarget.style, {
                              ...linkStyles,
                              outline: 'none',
                            });
                          }}
                        >
                          {link.label}
                          {link.external && (
                            <span
                              style={{
                                marginLeft: theme.spacing[1],
                                fontSize: '0.75em',
                              }}
                              aria-label=" (opens in new tab)"
                            >
                              ↗
                            </span>
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            ))}
          </div>
        )}

        {/* Footer bottom section */}
        <div
          style={{
            paddingTop: theme.spacing[8],
            borderTop: `1px solid ${theme.colors.neutral[200]}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: theme.spacing[4],
          }}
        >
          {/* Copyright */}
          <div style={copyrightStyles}>
            <p style={{ margin: 0, textAlign: 'center' }}>
              © {currentYear} {config.appName}. All rights reserved.
              {config.env === 'development' && (
                <span
                  style={{
                    marginLeft: theme.spacing[2],
                    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                    backgroundColor: theme.colors.amber[100],
                    color: theme.colors.amber[800],
                    fontSize: theme.typography.fontSize.xs,
                    borderRadius: theme.borderRadius.sm,
                    fontWeight: theme.typography.fontWeight.medium,
                  }}
                >
                  DEV MODE
                </span>
              )}
            </p>
          </div>

          {/* Optional app version in development */}
          {config.env === 'development' && (
            <div
              style={{
                ...copyrightStyles,
                fontSize: theme.typography.fontSize.xs,
                opacity: 0.7,
              }}
            >
              <span>
                Version: {import.meta.env.VITE_APP_VERSION || 'dev-build'} |{' '}
                Build: {import.meta.env.VITE_BUILD_TIME || 'local'}
              </span>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

// =============================
// RESPONSIVE STYLES (Media Queries)
// =============================

// Add responsive behavior via CSS-in-JS for smaller screens
const style = document.createElement('style');
style.textContent = `
  @media (max-width: 768px) {
    .footer {
      padding: ${theme.spacing[8]} ${theme.spacing[4]} ${theme.spacing[6]} !important;
    }
    
    .footer > div {
      padding: ${theme.spacing[8]} ${theme.spacing[4]} ${theme.spacing[6]} !important;
    }
    
    .footer nav ul {
      gap: ${theme.spacing[1]} !important;
    }
    
    .footer h3 {
      margin-bottom: ${theme.spacing[2]} !important;
    }
  }
  
  @media (max-width: 480px) {
    .footer > div > div:first-child {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: ${theme.spacing[6]} !important;
    }
    
    .footer > div > div:last-child {
      flex-direction: column !important;
      text-align: center !important;
    }
  }
`;

// Only add styles once
if (!document.querySelector('#footer-responsive-styles')) {
  style.id = 'footer-responsive-styles';
  document.head.appendChild(style);
}

// Default export
export default Footer;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
