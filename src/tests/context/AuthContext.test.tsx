import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';

// Test component to access auth context
function TestComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  return (
    <div>
      <span data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</span>
      <span data-testid="user-name">{user?.name || 'none'}</span>
      <button onClick={() => login('test-token', { id: '1', email: 'test@test.com', name: 'Test User', role: 'user' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage mock
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    vi.mocked(localStorage.setItem).mockClear();
    vi.mocked(localStorage.removeItem).mockClear();
  });

  it('provides initial unauthenticated state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user-name')).toHaveTextContent('none');
  });

  it('allows login and updates state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    
    await act(async () => {
      loginButton.click();
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
  });

  it('allows logout and clears state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // First login
    const loginButton = screen.getByText('Login');
    await act(async () => {
      loginButton.click();
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');

    // Then logout
    const logoutButton = screen.getByText('Logout');
    await act(async () => {
      logoutButton.click();
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user-name')).toHaveTextContent('none');
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
  });

  it('restores state from localStorage on mount', () => {
    const storedUser = { id: '1', email: 'stored@test.com', name: 'Stored User', role: 'user' as const };
    
    vi.mocked(localStorage.getItem).mockImplementation((key) => {
      if (key === 'token') return 'stored-token';
      if (key === 'user') return JSON.stringify(storedUser);
      return null;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Stored User');
  });

  it('throws error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');
    
    consoleSpy.mockRestore();
  });
});
