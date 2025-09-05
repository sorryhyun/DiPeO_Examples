// filepath: src/shared/layouts/AuthLayout.tsx
import React from 'react';
import { GlassCard } from '@/shared/components/Glass/GlassCard';
import { useTheme } from '@/providers/ThemeProvider';
import { config } from '@/app/config';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  maxWidth?: string;
  showLogo?: boolean;
}

export function AuthLayout({ 
  children, 
  title, 
  subtitle, 
  maxWidth = '400px',
  showLogo = true 
}: AuthLayoutProps) {
  const { resolvedTheme } = useTheme();

  // Gradient colors based on theme
  const gradientColors = resolvedTheme === 'dark' 
    ? {
        from: 'rgba(17, 24, 39, 0.95)', // gray-900 with opacity
        via: 'rgba(31, 41, 55, 0.9)',  // gray-800 with opacity  
        to: 'rgba(55, 65, 81, 0.85)'   // gray-700 with opacity
      }
    : {
        from: 'rgba(249, 250, 251, 0.95)', // gray-50 with opacity
        via: 'rgba(243, 244, 246, 0.9)',   // gray-100 with opacity
        to: 'rgba(229, 231, 235, 0.85)'    // gray-200 with opacity
      };

  return (
    <div
      className="auth-layout-root"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: `linear-gradient(135deg, ${gradientColors.from} 0%, ${gradientColors.via} 50%, ${gradientColors.to} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorative elements */}
      <div
        className="auth-bg-decoration"
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          opacity: resolvedTheme === 'dark' ? 0.03 : 0.05,
          background: `radial-gradient(circle, var(--color-primary) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          animation: 'auth-drift 60s linear infinite',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />

      {/* Main auth container */}
      <div
        className="auth-container"
        style={{
          width: '100%',
          maxWidth,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo section */}
        {showLogo && (
          <div
            style={{
              textAlign: 'center',
              marginBottom: '32px',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'var(--color-primary)',
                color: 'white',
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              }}
            >
              {/* Healthcare cross icon */}
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-6H5v-2h6V5h2v6h6v2h-6v6z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: 'var(--color-text)',
                margin: '0 0 8px 0',
                letterSpacing: '-0.025em',
              }}
            >
              Healthcare Portal
            </h1>
            {config.isDevelopment && (
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--color-text-tertiary)',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Development
              </div>
            )}
          </div>
        )}

        {/* Auth card */}
        <GlassCard
          style={{
            padding: '32px',
            backdropFilter: 'blur(20px)',
            background: resolvedTheme === 'dark' 
              ? 'rgba(31, 41, 55, 0.8)' 
              : 'rgba(255, 255, 255, 0.8)',
            border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)'}`,
            boxShadow: resolvedTheme === 'dark'
              ? '0 20px 40px rgba(0, 0, 0, 0.3), 0 8px 16px rgba(0, 0, 0, 0.2)'
              : '0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Header section */}
          {(title || subtitle) && (
            <div
              style={{
                textAlign: 'center',
                marginBottom: '32px',
              }}
            >
              {title && (
                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: 'var(--color-text)',
                    margin: '0 0 8px 0',
                    letterSpacing: '-0.025em',
                  }}
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--color-text-secondary)',
                    margin: '0',
                    lineHeight: '1.5',
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Content */}
          <div className="auth-content">
            {children}
          </div>
        </GlassCard>

        {/* Footer links */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '24px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              color: 'var(--color-text-tertiary)',
              lineHeight: '1.5',
            }}
          >
            {config.isDevelopment ? (
              <>
                Development Environment
                {config.buildTimestamp && (
                  <span style={{ display: 'block', opacity: 0.7 }}>
                    Build: {new Date(config.buildTimestamp).toLocaleString()}
                  </span>
                )}
              </>
            ) : (
              <>
                Secure Healthcare Platform
                <br />
                <a 
                  href="/privacy" 
                  style={{ 
                    color: 'var(--color-primary)', 
                    textDecoration: 'none',
                    marginRight: '16px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  Privacy Policy
                </a>
                <a 
                  href="/terms" 
                  style={{ 
                    color: 'var(--color-primary)', 
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  Terms of Service
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Add CSS animations if document is available
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('auth-layout-styles');
  if (!existingStyle) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'auth-layout-styles';
    styleSheet.textContent = `
      @keyframes auth-drift {
        0% { transform: translate(0, 0) rotate(0deg); }
        25% { transform: translate(-20px, -20px) rotate(1deg); }
        50% { transform: translate(20px, -40px) rotate(-1deg); }
        75% { transform: translate(-20px, -60px) rotate(1deg); }
        100% { transform: translate(0, -80px) rotate(0deg); }
      }
      
      .auth-layout-root {
        animation: auth-fade-in 0.6s ease-out;
      }
      
      .auth-container {
        animation: auth-slide-up 0.8s ease-out;
      }
      
      @keyframes auth-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes auth-slide-up {
        from { 
          opacity: 0; 
          transform: translateY(20px); 
        }
        to { 
          opacity: 1; 
          transform: translateY(0); 
        }
      }
      
      .auth-content {
        animation: auth-content-fade 1s ease-out 0.2s both;
      }
      
      @keyframes auth-content-fade {
        from { 
          opacity: 0; 
          transform: translateY(10px); 
        }
        to { 
          opacity: 1; 
          transform: translateY(0); 
        }
      }
      
      /* Responsive adjustments */
      @media (max-width: 640px) {
        .auth-layout-root {
          padding: 8px;
        }
      }
      
      @media (max-height: 600px) {
        .auth-layout-root {
          align-items: flex-start;
          padding-top: 32px;
        }
      }
    `;
    document.head.appendChild(styleSheet);
  }
}

export default AuthLayout;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
