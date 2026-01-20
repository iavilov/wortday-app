/**
 * Supabase Mock for Testing
 * Provides chainable query builder pattern
 */

export type MockSession = {
  user: {
    id: string;
    email: string;
  };
  access_token: string;
};

export type MockUser = {
  id: string;
  email: string;
};

// Default mock user for authenticated tests
export const mockUser: MockUser = {
  id: 'test-user-123',
  email: 'test@example.com',
};

export const mockSession: MockSession = {
  user: mockUser,
  access_token: 'test-token',
};

// Type for query results
interface QueryResult<T = any> {
  data: T | null;
  error: Error | null;
  count?: number;
}

// Chainable query builder mock
export function createMockQueryBuilder<T = any>(defaultResult: QueryResult<T> = { data: null, error: null }) {
  let result = { ...defaultResult };

  const builder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockImplementation(() => Promise.resolve(result)),
    maybeSingle: jest.fn().mockImplementation(() => Promise.resolve(result)),

    // Set result for next query
    _setResult: (newResult: Partial<QueryResult<T>>) => {
      result = { ...defaultResult, ...newResult };
      return builder;
    },

    // Get current result (for assertions)
    _getResult: () => result,

    // Reset to default
    _reset: () => {
      result = { ...defaultResult };
      return builder;
    },

    // Make the builder thenable (for await)
    then: (resolve: (value: QueryResult<T>) => void) => {
      resolve(result);
      return Promise.resolve(result);
    },
  };

  return builder;
}

// Auth mock state
let authState = {
  session: mockSession as MockSession | null,
  user: mockUser as MockUser | null,
};

// Create complete Supabase mock
export function createSupabaseMock() {
  const queryBuilder = createMockQueryBuilder();

  return {
    auth: {
      getSession: jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: { session: authState.session },
          error: null,
        })
      ),
      getUser: jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: { user: authState.user },
          error: null,
        })
      ),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn().mockImplementation(() => Promise.resolve({ error: null })),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
    from: jest.fn().mockReturnValue(queryBuilder),
    _queryBuilder: queryBuilder,
    _setAuthState: (session: MockSession | null, user: MockUser | null) => {
      authState = { session, user };
    },
    _resetAuthState: () => {
      authState = { session: mockSession, user: mockUser };
    },
  };
}

// Singleton mock instance
export const supabaseMock = createSupabaseMock();

// Export for jest.mock
export const supabase = supabaseMock;
