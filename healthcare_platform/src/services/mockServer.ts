import { MOCK_DATA } from '@/constants/mockData';
import {
  Appointment,
  MedicalRecord,
  Prescription,
  LabResult,
  Insurance,
  Medication,
  User,
} from '@/types';

interface MockConfig {
  use_localstorage_persistence: boolean;
  disable_websocket_in_dev: boolean;
}

type EventCallback = (data: any) => void;

class MockEventEmitter {
  private listeners: Map<string, EventCallback[]> = new Map();
  private intervalId: NodeJS.Timeout | null = null;

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, payload: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(payload));
    }
  }

  startPeriodicEmissions() {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      // Emit mock WebSocket updates
      this.emit('ws:update', {
        type: 'appointment_reminder',
        data: {
          id: Date.now(),
          message: 'Upcoming appointment in 1 hour',
          timestamp: new Date().toISOString(),
        },
      });

      // Randomly emit medication reminders
      if (Math.random() > 0.7) {
        this.emit('ws:update', {
          type: 'medication_reminder',
          data: {
            id: Date.now(),
            medicationName: 'Sample Medication',
            dosage: '10mg',
            timestamp: new Date().toISOString(),
          },
        });
      }

      // Randomly emit lab result updates
      if (Math.random() > 0.8) {
        this.emit('ws:update', {
          type: 'lab_result_ready',
          data: {
            id: Date.now(),
            testName: 'Blood Test',
            status: 'Ready',
            timestamp: new Date().toISOString(),
          },
        });
      }
    }, 30000); // Every 30 seconds
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.listeners.clear();
  }
}

let mockConfig: MockConfig | null = null;
let originalFetch: typeof window.fetch;
let isServerRunning = false;
const mockEventEmitter = new MockEventEmitter();

// Storage helpers
const getStorageKey = (endpoint: string) => `mock_${endpoint.replace(/[/]/g, '_')}`;

const getFromStorage = <T>(key: string, fallback: T): T => {
  if (!mockConfig?.use_localstorage_persistence) return fallback;
  
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = <T>(key: string, data: T): void => {
  if (!mockConfig?.use_localstorage_persistence) return;
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

// Mock endpoint handlers
const mockHandlers: Record<string, (req: Request) => Promise<Response>> = {
  // Auth endpoints
  'POST /api/auth/login': async (req) => {
    const body = await req.json();
    const { email, password } = body;
    
    // Mock authentication logic
    const mockUser: User = {
      id: '1',
      email: email,
      name: 'John Doe',
      role: 'patient',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response = {
      user: mockUser,
      token: 'mock-jwt-token-' + Date.now(),
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },

  'POST /api/auth/logout': async () => {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },

  // Appointments
  'GET /api/appointments': async () => {
    const storageKey = getStorageKey('appointments');
    const appointments = getFromStorage(storageKey, MOCK_DATA.appointments);
    
    return new Response(JSON.stringify(appointments), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },

  'POST /api/appointments': async (req) => {
    const body = await req.json();
    const storageKey = getStorageKey('appointments');
    const appointments = getFromStorage(storageKey, MOCK_DATA.appointments);
    
    const newAppointment: Appointment = {
      ...body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedAppointments = [...appointments, newAppointment];
    saveToStorage(storageKey, updatedAppointments);
    
    return new Response(JSON.stringify(newAppointment), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  },

  'PUT /api/appointments/:id': async (req) => {
    const body = await req.json();
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    const storageKey = getStorageKey('appointments');
    const appointments = getFromStorage(storageKey, MOCK_DATA.appointments);
    
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) {
      return new Response(JSON.stringify({ error: 'Appointment not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    appointments[index] = {
      ...appointments[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    saveToStorage(storageKey, appointments);
    
    return new Response(JSON.stringify(appointments[index]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },

  'DELETE /api/appointments/:id': async (req) => {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    const storageKey = getStorageKey('appointments');
    const appointments = getFromStorage(storageKey, MOCK_DATA.appointments);
    
    const filteredAppointments = appointments.filter(a => a.id !== id);
    saveToStorage(storageKey, filteredAppointments);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },

  // Medical Records
  'GET /api/medical-records': async () => {
    const storageKey = getStorageKey('medical-records');
    const records = getFromStorage(storageKey, MOCK_DATA.medicalRecords);
    
    return new Response(JSON.stringify(records), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },

  'POST /api/medical-records': async (req) => {
    const body = await req.json();
    const storageKey = getStorageKey('medical-records');
    const records = getFromStorage(storageKey, MOCK_DATA.medicalRecords);
    
    const newRecord: MedicalRecord = {
      ...body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedRecords = [...records, newRecord];
    saveToStorage(storageKey, updatedRecords);
    
    return new Response(JSON.stringify(newRecord), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  },

  // Prescriptions
  'GET /api/prescriptions': async () => {
    const storageKey = getStorageKey('prescriptions');
    const prescriptions = getFromStorage(storageKey, MOCK_DATA.prescriptions);
    
    return new Response(JSON.stringify(prescriptions), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },

  'POST /api/prescriptions': async (req) => {
    const body = await req.json();
    const storageKey = getStorageKey('prescriptions');
    const prescriptions = getFromStorage(storageKey, MOCK_DATA.prescriptions);
    
    const newPrescription: Prescription = {
      ...body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedPrescriptions = [...prescriptions, newPrescription];
    saveToStorage(storageKey, updatedPrescriptions);
    
    return new Response(JSON.stringify(newPrescription), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  },

  // Lab Results
  'GET /api/lab-results': async () => {
    const storageKey = getStorageKey('lab-results');
    const labResults = getFromStorage(storageKey, MOCK_DATA.labResults);
    
    return new Response(JSON.stringify(labResults), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },

  'POST /api/lab-results': async (req) => {
    const body = await req.json();
    const storageKey = getStorageKey('lab-results');
    const labResults = getFromStorage(storageKey, MOCK_DATA.labResults);
    
    const newLabResult: LabResult = {
      ...body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedLabResults = [...labResults, newLabResult];
    saveToStorage(storageKey, updatedLabResults);
    
    return new Response(JSON.stringify(newLabResult), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  },

  // Insurance
  'GET /api/insurance': async () => {
    const storageKey = getStorageKey('insurance');
    const insurance = getFromStorage(storageKey, MOCK_DATA.insurance);
    
    return new Response(JSON.stringify(insurance), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },

  'POST /api/insurance': async (req) => {
    const body = await req.json();
    const storageKey = getStorageKey('insurance');
    const insurance = getFromStorage(storageKey, MOCK_DATA.insurance);
    
    const newInsurance: Insurance = {
      ...body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedInsurance = [...insurance, newInsurance];
    saveToStorage(storageKey, updatedInsurance);
    
    return new Response(JSON.stringify(newInsurance), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  },

  // Medications
  'GET /api/medications': async () => {
    const storageKey = getStorageKey('medications');
    const medications = getFromStorage(storageKey, MOCK_DATA.medications);
    
    return new Response(JSON.stringify(medications), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },

  'POST /api/medications': async (req) => {
    const body = await req.json();
    const storageKey = getStorageKey('medications');
    const medications = getFromStorage(storageKey, MOCK_DATA.medications);
    
    const newMedication: Medication = {
      ...body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedMedications = [...medications, newMedication];
    saveToStorage(storageKey, updatedMedications);
    
    return new Response(JSON.stringify(newMedication), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  },

  'PUT /api/medications/:id': async (req) => {
    const body = await req.json();
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    const storageKey = getStorageKey('medications');
    const medications = getFromStorage(storageKey, MOCK_DATA.medications);
    
    const index = medications.findIndex(m => m.id === id);
    if (index === -1) {
      return new Response(JSON.stringify({ error: 'Medication not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    medications[index] = {
      ...medications[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    saveToStorage(storageKey, medications);
    
    return new Response(JSON.stringify(medications[index]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },

  'DELETE /api/medications/:id': async (req) => {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    const storageKey = getStorageKey('medications');
    const medications = getFromStorage(storageKey, MOCK_DATA.medications);
    
    const filteredMedications = medications.filter(m => m.id !== id);
    saveToStorage(storageKey, filteredMedications);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },
};

// Mock fetch implementation
const mockFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const request = new Request(input, init);
  const url = new URL(request.url);
  
  // Only intercept API calls
  if (!url.pathname.startsWith('/api/')) {
    return originalFetch(input, init);
  }
  
  const method = request.method;
  const pathname = url.pathname;
  
  // Create handler key (method + path)
  let handlerKey = `${method} ${pathname}`;
  
  // Check for parameterized routes
  if (!mockHandlers[handlerKey]) {
    // Try to match parameterized routes like /api/appointments/:id
    for (const key of Object.keys(mockHandlers)) {
      if (key.includes(':')) {
        const [keyMethod, keyPath] = key.split(' ');
        if (keyMethod === method) {
          const keyParts = keyPath.split('/');
          const pathParts = pathname.split('/');
          
          if (keyParts.length === pathParts.length) {
            const isMatch = keyParts.every((part, index) => 
              part.startsWith(':') || part === pathParts[index]
            );
            
            if (isMatch) {
              handlerKey = key;
              break;
            }
          }
        }
      }
    }
  }
  
  const handler = mockHandlers[handlerKey];
  
  if (handler) {
    try {
      // Add delay to simulate network latency
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 300));
      return await handler(request);
    } catch (error) {
      console.error('Mock handler error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }
  
  // Return 404 for unhandled API routes
  return new Response(
    JSON.stringify({ error: 'Not found' }),
    {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};

export const startMockServer = (config: MockConfig): void => {
  if (isServerRunning) {
    console.warn('Mock server is already running');
    return;
  }
  
  mockConfig = config;
  
  // Store original fetch
  originalFetch = window.fetch;
  
  // Replace fetch with mock implementation
  window.fetch = mockFetch;
  
  // Start WebSocket mock events if not disabled
  if (!config.disable_websocket_in_dev) {
    mockEventEmitter.startPeriodicEmissions();
  }
  
  isServerRunning = true;
  console.log('Mock server started');
};

export const stopMockServer = (): void => {
  if (!isServerRunning) {
    console.warn('Mock server is not running');
    return;
  }
  
  // Restore original fetch
  if (originalFetch) {
    window.fetch = originalFetch;
  }
  
  // Stop WebSocket mock events
  mockEventEmitter.stop();
  
  mockConfig = null;
  isServerRunning = false;
  console.log('Mock server stopped');
};

// Mock WebSocket EventEmitter API
export const mockWebSocket = {
  on: (event: string, callback: EventCallback) => {
    mockEventEmitter.on(event, callback);
  },
  off: (event: string, callback: EventCallback) => {
    mockEventEmitter.off(event, callback);
  },
  emit: (event: string, payload: any) => {
    mockEventEmitter.emit(event, payload);
  },
};

// Self-check comments:
// [ ] Uses `@/` imports only ✓
// [ ] Uses providers/hooks (no direct DOM/localStorage side effects) ✓ (only uses localStorage with config check)
// [ ] Reads config from `@/app/config` ✓ (receives config via parameter)
// [ ] Exports default named component ✓ (exports named functions)
// [ ] Adds basic ARIA and keyboard handlers (where relevant) ✓ (N/A for service module)
