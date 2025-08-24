type EventHandler = (...args: any[]) => void;

interface MockWebSocketEvents {
  'forum:newPost': { id: string; title: string; author: string; timestamp: Date };
  'grade:updated': { courseId: string; grade: number; assignment: string };
  'course:progress': { courseId: string; progress: number };
  'notification:new': { id: string; message: string; type: 'info' | 'warning' | 'success' };
}

class MockWebSocketService {
  private events: Map<string, Set<EventHandler>> = new Map();
  private intervals: NodeJS.Timeout[] = [];
  private enabled = false;

  subscribe<T extends keyof MockWebSocketEvents>(
    eventName: T,
    handler: (data: MockWebSocketEvents[T]) => void
  ): () => void {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    
    this.events.get(eventName)!.add(handler);
    
    return () => {
      this.events.get(eventName)?.delete(handler);
    };
  }

  private emit<T extends keyof MockWebSocketEvents>(
    eventName: T,
    data: MockWebSocketEvents[T]
  ): void {
    if (!this.enabled) return;
    
    const handlers = this.events.get(eventName);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  startMockWebsocket({ enable }: { enable: boolean }): void {
    this.enabled = enable;
    
    if (!enable) {
      this.stopAll();
      return;
    }

    // Emit new forum posts every 15 seconds
    const forumInterval = setInterval(() => {
      this.emit('forum:newPost', {
        id: `post_${Date.now()}`,
        title: `New Discussion Topic ${Math.floor(Math.random() * 100)}`,
        author: `User${Math.floor(Math.random() * 50) + 1}`,
        timestamp: new Date()
      });
    }, 15000);

    // Emit grade updates every 20 seconds
    const gradeInterval = setInterval(() => {
      const courses = ['course_1', 'course_2', 'course_3'];
      const assignments = ['Assignment 1', 'Quiz 2', 'Project 3', 'Homework 4'];
      
      this.emit('grade:updated', {
        courseId: courses[Math.floor(Math.random() * courses.length)],
        grade: Math.floor(Math.random() * 40) + 60, // 60-100
        assignment: assignments[Math.floor(Math.random() * assignments.length)]
      });
    }, 20000);

    // Emit course progress updates every 25 seconds
    const progressInterval = setInterval(() => {
      const courses = ['course_1', 'course_2', 'course_3'];
      
      this.emit('course:progress', {
        courseId: courses[Math.floor(Math.random() * courses.length)],
        progress: Math.floor(Math.random() * 100)
      });
    }, 25000);

    // Emit notifications every 30 seconds
    const notificationInterval = setInterval(() => {
      const messages = [
        'New assignment posted',
        'Deadline reminder: Quiz due tomorrow',
        'Course materials updated',
        'New announcement from instructor'
      ];
      const types: ('info' | 'warning' | 'success')[] = ['info', 'warning', 'success'];
      
      this.emit('notification:new', {
        id: `notif_${Date.now()}`,
        message: messages[Math.floor(Math.random() * messages.length)],
        type: types[Math.floor(Math.random() * types.length)]
      });
    }, 30000);

    this.intervals.push(forumInterval, gradeInterval, progressInterval, notificationInterval);
  }

  private stopAll(): void {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
  }

  disconnect(): void {
    this.stopAll();
    this.events.clear();
    this.enabled = false;
  }
}

const mockWebSocketService = new MockWebSocketService();

export const startMockWebsocket = mockWebSocketService.startMockWebsocket.bind(mockWebSocketService);

export const subscribe = (eventName: string, handler: EventHandler) => {
  return mockWebSocketService.subscribe(eventName as keyof MockWebSocketEvents, handler);
};

export const disconnect = mockWebSocketService.disconnect.bind(mockWebSocketService);

// Add missing methods for compatibility
export const unsubscribe = (eventName: string, handler: EventHandler) => {
  // The subscribe method returns an unsubscribe function, so we'll implement this
  const handlers = mockWebSocketService['events'].get(eventName);
  if (handlers) {
    handlers.delete(handler);
  }
};

export const emit = <T extends keyof MockWebSocketEvents>(
  eventName: T, 
  data: MockWebSocketEvents[T]
) => {
  // Forward to the private emit method
  mockWebSocketService['emit'](eventName, data);
};

// Export mockWebsocket object for object-based usage
export const mockWebsocket = {
  subscribe,
  unsubscribe,
  emit,
  disconnect,
  startMockWebsocket,
};
