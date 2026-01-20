/**
 * Auth Store Mock for Testing
 */

export interface MockAuthUser {
  id: string;
  email: string;
  full_name?: string;
}

let mockAuthState: {
  user: MockAuthUser | null;
  isAuthenticated: boolean;
} = {
  user: { id: 'test-user-123', email: 'test@example.com' },
  isAuthenticated: true,
};

export const mockAuthStore = {
  getState: jest.fn(() => mockAuthState),
  setState: jest.fn((newState: Partial<typeof mockAuthState>) => {
    mockAuthState = { ...mockAuthState, ...newState };
  }),
  subscribe: jest.fn(),
  destroy: jest.fn(),
};

// Helper to set auth state in tests
export function setMockAuthUser(user: MockAuthUser | null) {
  mockAuthState = {
    user,
    isAuthenticated: !!user,
  };
}

// Helper to reset auth state
export function resetMockAuthState() {
  mockAuthState = {
    user: { id: 'test-user-123', email: 'test@example.com' },
    isAuthenticated: true,
  };
}

// Export mock useAuthStore
export const useAuthStore = Object.assign(
  jest.fn(() => mockAuthState),
  mockAuthStore
);
