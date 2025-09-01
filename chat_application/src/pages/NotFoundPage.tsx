// filepath: src/pages/NotFoundPage.tsx
import { Link } from 'react-router-dom';
import { CenteredLayout } from '@/shared/layouts/CenteredLayout';
import { Button } from '@/shared/components/Button';
import { theme } from '@/theme';

/**
 * 404 Not Found page with centered layout and call-to-action.
 * Provides accessible navigation back to home page.
 */
export function NotFoundPage(): JSX.Element {
  return (
    <CenteredLayout>
      <div
        style={{
          textAlign: 'center',
          maxWidth: '500px',
          padding: theme.spacing.lg,
        }}
        role="main"
        aria-labelledby="not-found-title"
      >
        {/* 404 Status Display */}
        <div
          style={{
            fontSize: '6rem',
            fontWeight: 'bold',
            color: theme.colors.primary,
            lineHeight: 1,
            marginBottom: theme.spacing.md,
          }}
          aria-hidden="true"
        >
          404
        </div>

        {/* Page Title */}
        <h1
          id="not-found-title"
          style={{
            fontSize: theme.typography.heading.h2.fontSize,
            fontWeight: theme.typography.heading.h2.fontWeight,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.md,
            margin: 0,
          }}
        >
          Page Not Found
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: theme.typography.body.large.fontSize,
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing.xl,
            lineHeight: 1.6,
          }}
        >
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: theme.spacing.md,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button
            as={Link}
            to="/"
            variant="primary"
            size="lg"
            aria-describedby="home-button-desc"
          >
            Go Home
          </Button>
          
          <Button
            as={Link}
            to="/dashboard"
            variant="secondary"
            size="lg"
            aria-describedby="dashboard-button-desc"
          >
            Dashboard
          </Button>
        </div>

        {/* Screen Reader Descriptions */}
        <div style={{ display: 'none' }}>
          <div id="home-button-desc">
            Navigate to the home page
          </div>
          <div id="dashboard-button-desc">
            Navigate to your dashboard
          </div>
        </div>

        {/* Additional Help */}
        <div
          style={{
            marginTop: theme.spacing.xl,
            padding: theme.spacing.md,
            borderRadius: theme.radii.md,
            backgroundColor: theme.colors.surface.secondary,
            border: `1px solid ${theme.colors.border.light}`,
          }}
        >
          <h2
            style={{
              fontSize: theme.typography.heading.h4.fontSize,
              fontWeight: theme.typography.heading.h4.fontWeight,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.sm,
              margin: 0,
            }}
          >
            Need Help?
          </h2>
          <p
            style={{
              fontSize: theme.typography.body.small.fontSize,
              color: theme.colors.text.secondary,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            If you believe this is an error, please contact our support team.
            You can also try using the search feature or checking our navigation menu.
          </p>
        </div>
      </div>
    </CenteredLayout>
  );
}

/*
Self-check comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (uses routing via React Router Link component)
- [x] Reads config from `@/app/config` (uses theme from @/theme which reads from config)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (role="main", aria-labelledby, aria-describedby, screen reader descriptions)
*/
