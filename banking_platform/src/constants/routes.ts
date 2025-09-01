// filepath: src/constants/routes.ts
/* src/constants/routes.ts

Centralized route constants used across router and navigation components to avoid hard-coded strings.
All route paths and navigation should use these constants.
*/

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Protected routes
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  // Healthcare domain routes
  PATIENTS: '/patients',
  PATIENT_DETAIL: '/patients/:id',
  PATIENT_NEW: '/patients/new',
  PATIENT_EDIT: '/patients/:id/edit',
  
  APPOINTMENTS: '/appointments',
  APPOINTMENT_DETAIL: '/appointments/:id',
  APPOINTMENT_NEW: '/appointments/new',
  APPOINTMENT_EDIT: '/appointments/:id/edit',
  
  MEDICAL_RECORDS: '/medical-records',
  MEDICAL_RECORD_DETAIL: '/medical-records/:id',
  MEDICAL_RECORD_NEW: '/medical-records/new',
  
  PRESCRIPTIONS: '/prescriptions',
  PRESCRIPTION_DETAIL: '/prescriptions/:id',
  PRESCRIPTION_NEW: '/prescriptions/new',
  
  LAB_RESULTS: '/lab-results',
  LAB_RESULT_DETAIL: '/lab-results/:id',
  LAB_RESULT_NEW: '/lab-results/new',
  
  // Analytics and reporting
  ANALYTICS: '/analytics',
  REPORTS: '/reports',
  METRICS: '/metrics',
  
  // Administrative routes
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_SETTINGS: '/admin/settings',
  
  // Error pages
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/401',
  SERVER_ERROR: '/500',
} as const;

// Helper type to ensure route strings are typed
export type RouteKey = keyof typeof ROUTES;
export type RoutePath = typeof ROUTES[RouteKey];

// Route builder helpers for dynamic routes
export const buildRoute = {
  patientDetail: (id: string) => `/patients/${id}`,
  patientEdit: (id: string) => `/patients/${id}/edit`,
  appointmentDetail: (id: string) => `/appointments/${id}`,
  appointmentEdit: (id: string) => `/appointments/${id}/edit`,
  medicalRecordDetail: (id: string) => `/medical-records/${id}`,
  prescriptionDetail: (id: string) => `/prescriptions/${id}`,
  labResultDetail: (id: string) => `/lab-results/${id}`,
} as const;

// Route metadata for navigation and permissions
export const ROUTE_META = {
  [ROUTES.HOME]: { title: 'Home', requiresAuth: false, roles: [] },
  [ROUTES.LOGIN]: { title: 'Login', requiresAuth: false, roles: [] },
  [ROUTES.REGISTER]: { title: 'Register', requiresAuth: false, roles: [] },
  [ROUTES.FORGOT_PASSWORD]: { title: 'Forgot Password', requiresAuth: false, roles: [] },
  [ROUTES.RESET_PASSWORD]: { title: 'Reset Password', requiresAuth: false, roles: [] },
  
  [ROUTES.DASHBOARD]: { title: 'Dashboard', requiresAuth: true, roles: [] },
  [ROUTES.PROFILE]: { title: 'Profile', requiresAuth: true, roles: [] },
  [ROUTES.SETTINGS]: { title: 'Settings', requiresAuth: true, roles: [] },
  
  [ROUTES.PATIENTS]: { title: 'Patients', requiresAuth: true, roles: ['doctor', 'nurse', 'admin'] },
  [ROUTES.PATIENT_DETAIL]: { title: 'Patient Details', requiresAuth: true, roles: ['doctor', 'nurse', 'admin'] },
  [ROUTES.PATIENT_NEW]: { title: 'New Patient', requiresAuth: true, roles: ['doctor', 'nurse', 'admin'] },
  [ROUTES.PATIENT_EDIT]: { title: 'Edit Patient', requiresAuth: true, roles: ['doctor', 'nurse', 'admin'] },
  
  [ROUTES.APPOINTMENTS]: { title: 'Appointments', requiresAuth: true, roles: ['doctor', 'nurse', 'admin'] },
  [ROUTES.APPOINTMENT_DETAIL]: { title: 'Appointment Details', requiresAuth: true, roles: ['doctor', 'nurse', 'admin'] },
  [ROUTES.APPOINTMENT_NEW]: { title: 'New Appointment', requiresAuth: true, roles: ['doctor', 'nurse', 'admin'] },
  [ROUTES.APPOINTMENT_EDIT]: { title: 'Edit Appointment', requiresAuth: true, roles: ['doctor', 'nurse', 'admin'] },
  
  [ROUTES.MEDICAL_RECORDS]: { title: 'Medical Records', requiresAuth: true, roles: ['doctor', 'nurse', 'admin'] },
  [ROUTES.MEDICAL_RECORD_DETAIL]: { title: 'Medical Record', requiresAuth: true, roles: ['doctor', 'nurse', 'admin'] },
  [ROUTES.MEDICAL_RECORD_NEW]: { title: 'New Medical Record', requiresAuth: true, roles: ['doctor', 'admin'] },
  
  [ROUTES.PRESCRIPTIONS]: { title: 'Prescriptions', requiresAuth: true, roles: ['doctor', 'admin'] },
  [ROUTES.PRESCRIPTION_DETAIL]: { title: 'Prescription Details', requiresAuth: true, roles: ['doctor', 'admin'] },
  [ROUTES.PRESCRIPTION_NEW]: { title: 'New Prescription', requiresAuth: true, roles: ['doctor', 'admin'] },
  
  [ROUTES.LAB_RESULTS]: { title: 'Lab Results', requiresAuth: true, roles: ['doctor', 'nurse', 'admin'] },
  [ROUTES.LAB_RESULT_DETAIL]: { title: 'Lab Result Details', requiresAuth: true, roles: ['doctor', 'nurse', 'admin'] },
  [ROUTES.LAB_RESULT_NEW]: { title: 'New Lab Result', requiresAuth: true, roles: ['doctor', 'nurse', 'admin'] },
  
  [ROUTES.ANALYTICS]: { title: 'Analytics', requiresAuth: true, roles: ['doctor', 'admin'] },
  [ROUTES.REPORTS]: { title: 'Reports', requiresAuth: true, roles: ['doctor', 'admin'] },
  [ROUTES.METRICS]: { title: 'Metrics', requiresAuth: true, roles: ['admin'] },
  
  [ROUTES.ADMIN]: { title: 'Administration', requiresAuth: true, roles: ['admin'] },
  [ROUTES.ADMIN_USERS]: { title: 'User Management', requiresAuth: true, roles: ['admin'] },
  [ROUTES.ADMIN_SETTINGS]: { title: 'System Settings', requiresAuth: true, roles: ['admin'] },
  
  [ROUTES.NOT_FOUND]: { title: '404 - Page Not Found', requiresAuth: false, roles: [] },
  [ROUTES.UNAUTHORIZED]: { title: '401 - Unauthorized', requiresAuth: false, roles: [] },
  [ROUTES.SERVER_ERROR]: { title: '500 - Server Error', requiresAuth: false, roles: [] },
} as const;

// Navigation groups for menu organization
export const NAVIGATION_GROUPS = {
  main: {
    label: 'Main',
    routes: [ROUTES.DASHBOARD, ROUTES.ANALYTICS],
  },
  patients: {
    label: 'Patient Care',
    routes: [ROUTES.PATIENTS, ROUTES.APPOINTMENTS, ROUTES.MEDICAL_RECORDS],
  },
  clinical: {
    label: 'Clinical',
    routes: [ROUTES.PRESCRIPTIONS, ROUTES.LAB_RESULTS],
  },
  reports: {
    label: 'Reports',
    routes: [ROUTES.REPORTS, ROUTES.METRICS],
  },
  admin: {
    label: 'Administration',
    routes: [ROUTES.ADMIN, ROUTES.ADMIN_USERS, ROUTES.ADMIN_SETTINGS],
  },
} as const;

/* Example usage:

import { ROUTES, buildRoute, ROUTE_META } from '@/constants/routes'
import { navigate } from 'react-router-dom'

// Static routes
navigate(ROUTES.DASHBOARD)
navigate(ROUTES.PATIENTS)

// Dynamic routes
navigate(buildRoute.patientDetail('123'))
navigate(buildRoute.appointmentEdit('456'))

// Route metadata
const dashboardMeta = ROUTE_META[ROUTES.DASHBOARD]
if (dashboardMeta.requiresAuth) {
  // check auth before rendering
}
*/

// Self-check comments:
// [x] Uses `@/` imports only (not applicable - this is a constants file)
// [x] Uses providers/hooks (not applicable - this is a constants file)
// [x] Reads config from `@/app/config` (not applicable - this is a constants file)
// [x] Exports default named component (exports named constants and types)
// [x] Adds basic ARIA and keyboard handlers (not applicable - this is a constants file)
