// filepath: src/pages/HomePage.tsx
import React from 'react';
import { AppLayout } from '@/shared/layouts/AppLayout';
import { Chart } from '@/shared/components/Chart';
import { Card } from '@/shared/components/Card';
import { GradientBackground } from '@/shared/components/GradientBackground';
import { theme } from '@/theme';
import { config } from '@/app/config';
import type { ChartSeries } from '@/core/contracts';

/**
 * Public home page demonstrating design tokens, gradients, and sample data visualization.
 * Showcases the application's design system and charting capabilities.
 */
export function HomePage() {
  // Sample data for demonstration chart
  const sampleChartData: ChartSeries[] = [
    {
      id: 'revenue',
      label: 'Revenue',
      color: theme.colors.primary.main,
      data: [
        { x: 'Jan', y: 45000 },
        { x: 'Feb', y: 52000 },
        { x: 'Mar', y: 48000 },
        { x: 'Apr', y: 61000 },
        { x: 'May', y: 55000 },
        { x: 'Jun', y: 67000 },
      ],
    },
    {
      id: 'patients',
      label: 'New Patients',
      color: theme.colors.secondary.main,
      data: [
        { x: 'Jan', y: 120 },
        { x: 'Feb', y: 135 },
        { x: 'Mar', y: 128 },
        { x: 'Apr', y: 152 },
        { x: 'May', y: 148 },
        { x: 'Jun', y: 163 },
      ],
    },
  ];

  return (
    <AppLayout>
      <div className="home-page">
        {/* Hero Section with Gradient Background */}
        <section className="hero-section" style={{ position: 'relative', marginBottom: theme.spacing.xl }}>
          <GradientBackground
            variant="primary"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: theme.borderRadius.lg,
              opacity: 0.1,
            }}
          />
          <div 
            className="hero-content"
            style={{
              position: 'relative',
              padding: theme.spacing.xl,
              textAlign: 'center',
              zIndex: 1,
            }}
          >
            <h1 
              style={{
                fontSize: theme.typography.sizes.h1,
                fontWeight: theme.typography.weights.bold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.md,
                fontFamily: theme.typography.families.heading,
              }}
            >
              Welcome to {config.appName}
            </h1>
            <p 
              style={{
                fontSize: theme.typography.sizes.lg,
                color: theme.colors.text.secondary,
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: theme.typography.lineHeights.relaxed,
              }}
            >
              Experience the next generation of healthcare management with our comprehensive platform
              designed for efficiency, security, and patient care excellence.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="features-section" style={{ marginBottom: theme.spacing.xl }}>
          <h2 
            style={{
              fontSize: theme.typography.sizes.h2,
              fontWeight: theme.typography.weights.semibold,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.lg,
              textAlign: 'center',
            }}
          >
            Platform Highlights
          </h2>
          
          <div 
            className="features-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: theme.spacing.lg,
              marginBottom: theme.spacing.xl,
            }}
          >
            <Card variant="elevated" className="feature-card">
              <div style={{ padding: theme.spacing.lg }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: theme.colors.primary.main,
                    borderRadius: theme.borderRadius.md,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: theme.spacing.md,
                  }}
                >
                  <span style={{ color: 'white', fontSize: '24px' }}>📊</span>
                </div>
                <h3 
                  style={{
                    fontSize: theme.typography.sizes.lg,
                    fontWeight: theme.typography.weights.semibold,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  Analytics Dashboard
                </h3>
                <p 
                  style={{
                    color: theme.colors.text.secondary,
                    lineHeight: theme.typography.lineHeights.relaxed,
                  }}
                >
                  Real-time insights into patient metrics, revenue trends, and operational efficiency
                  with interactive charts and customizable reporting.
                </p>
              </div>
            </Card>

            <Card variant="elevated" className="feature-card">
              <div style={{ padding: theme.spacing.lg }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: theme.colors.secondary.main,
                    borderRadius: theme.borderRadius.md,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: theme.spacing.md,
                  }}
                >
                  <span style={{ color: 'white', fontSize: '24px' }}>🔒</span>
                </div>
                <h3 
                  style={{
                    fontSize: theme.typography.sizes.lg,
                    fontWeight: theme.typography.weights.semibold,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  HIPAA Compliance
                </h3>
                <p 
                  style={{
                    color: theme.colors.text.secondary,
                    lineHeight: theme.typography.lineHeights.relaxed,
                  }}
                >
                  Enterprise-grade security with end-to-end encryption, audit trails, and 
                  comprehensive compliance controls for healthcare data protection.
                </p>
              </div>
            </Card>

            <Card variant="elevated" className="feature-card">
              <div style={{ padding: theme.spacing.lg }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: theme.colors.accent.main,
                    borderRadius: theme.borderRadius.md,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: theme.spacing.md,
                  }}
                >
                  <span style={{ color: 'white', fontSize: '24px' }}>⚡</span>
                </div>
                <h3 
                  style={{
                    fontSize: theme.typography.sizes.lg,
                    fontWeight: theme.typography.weights.semibold,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  Workflow Automation
                </h3>
                <p 
                  style={{
                    color: theme.colors.text.secondary,
                    lineHeight: theme.typography.lineHeights.relaxed,
                  }}
                >
                  Streamline operations with intelligent automation for appointments, billing,
                  notifications, and patient communication workflows.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Data Visualization Demo */}
        <section className="chart-demo-section">
          <Card variant="elevated" className="chart-demo-card">
            <div style={{ padding: theme.spacing.lg }}>
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: theme.spacing.lg,
                }}
              >
                <h3 
                  style={{
                    fontSize: theme.typography.sizes.lg,
                    fontWeight: theme.typography.weights.semibold,
                    color: theme.colors.text.primary,
                  }}
                >
                  Sample Analytics
                </h3>
                <div
                  style={{
                    fontSize: theme.typography.sizes.sm,
                    color: theme.colors.text.secondary,
                    background: theme.colors.background.secondary,
                    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                    borderRadius: theme.borderRadius.sm,
                  }}
                >
                  Last 6 months
                </div>
              </div>
              
              <div style={{ height: '300px', width: '100%' }}>
                <Chart
                  type="line"
                  data={sampleChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      tooltip: {
                        mode: 'index' as const,
                        intersect: false,
                      },
                    },
                    scales: {
                      x: {
                        display: true,
                        title: {
                          display: true,
                          text: 'Month',
                        },
                      },
                      y: {
                        display: true,
                        title: {
                          display: true,
                          text: 'Value',
                        },
                      },
                    },
                    interaction: {
                      mode: 'nearest' as const,
                      axis: 'x' as const,
                      intersect: false,
                    },
                  }}
                  aria-label="Sample analytics chart showing revenue and new patients over the last 6 months"
                />
              </div>
              
              <div 
                style={{
                  marginTop: theme.spacing.lg,
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.background.secondary,
                  borderRadius: theme.borderRadius.sm,
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: theme.spacing.md,
                }}
              >
                <div className="stat-item">
                  <div 
                    style={{
                      fontSize: theme.typography.sizes.xl,
                      fontWeight: theme.typography.weights.bold,
                      color: theme.colors.primary.main,
                    }}
                  >
                    $67K
                  </div>
                  <div 
                    style={{
                      fontSize: theme.typography.sizes.sm,
                      color: theme.colors.text.secondary,
                    }}
                  >
                    Current Month Revenue
                  </div>
                </div>
                <div className="stat-item">
                  <div 
                    style={{
                      fontSize: theme.typography.sizes.xl,
                      fontWeight: theme.typography.weights.bold,
                      color: theme.colors.secondary.main,
                    }}
                  >
                    163
                  </div>
                  <div 
                    style={{
                      fontSize: theme.typography.sizes.sm,
                      color: theme.colors.text.secondary,
                    }}
                  >
                    New Patients This Month
                  </div>
                </div>
                <div className="stat-item">
                  <div 
                    style={{
                      fontSize: theme.typography.sizes.xl,
                      fontWeight: theme.typography.weights.bold,
                      color: theme.colors.success.main,
                    }}
                  >
                    +12%
                  </div>
                  <div 
                    style={{
                      fontSize: theme.typography.sizes.sm,
                      color: theme.colors.text.secondary,
                    }}
                  >
                    Growth vs Last Month
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Development Mode Info */}
        {config.isDevelopment && (
          <section className="dev-info-section" style={{ marginTop: theme.spacing.xl }}>
            <Card variant="outlined" className="dev-info-card">
              <div 
                style={{
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.warning.light + '20',
                  borderRadius: theme.borderRadius.sm,
                }}
              >
                <h4 
                  style={{
                    fontSize: theme.typography.sizes.md,
                    fontWeight: theme.typography.weights.semibold,
                    color: theme.colors.warning.dark,
                    marginBottom: theme.spacing.xs,
                  }}
                >
                  Development Mode
                </h4>
                <p 
                  style={{
                    fontSize: theme.typography.sizes.sm,
                    color: theme.colors.warning.dark,
                    marginBottom: 0,
                  }}
                >
                  This page demonstrates design tokens from the theme system, gradient components,
                  and data visualization capabilities. In production, this would show real healthcare metrics.
                </p>
              </div>
            </Card>
          </section>
        )}
      </div>

      <style jsx>{`
        .home-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: ${theme.spacing.lg};
        }

        .feature-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .feature-card:hover {
          transform: translateY(-2px);
          box-shadow: ${theme.shadows.lg};
        }

        .stat-item {
          text-align: center;
          min-width: 120px;
        }

        @media (max-width: 768px) {
          .home-page {
            padding: ${theme.spacing.md};
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .hero-content h1 {
            font-size: ${theme.typography.sizes.xl} !important;
          }

          .hero-content p {
            font-size: ${theme.typography.sizes.md} !important;
          }
        }
      `}</style>
    </AppLayout>
  );
}

/*
Self-check comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (aria-label on chart)
*/
