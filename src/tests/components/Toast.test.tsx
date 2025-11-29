import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Toast from '../../components/Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with message', () => {
    const onClose = vi.fn();
    render(<Toast message="Test message" onClose={onClose} />);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders error type by default', () => {
    const onClose = vi.fn();
    render(<Toast message="Error" onClose={onClose} />);
    
    const toast = document.querySelector('.toast-error');
    expect(toast).toBeInTheDocument();
    expect(screen.getByText('❌')).toBeInTheDocument();
  });

  it('renders success type', () => {
    const onClose = vi.fn();
    render(<Toast message="Success" type="success" onClose={onClose} />);
    
    const toast = document.querySelector('.toast-success');
    expect(toast).toBeInTheDocument();
    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  it('renders warning type', () => {
    const onClose = vi.fn();
    render(<Toast message="Warning" type="warning" onClose={onClose} />);
    
    const toast = document.querySelector('.toast-warning');
    expect(toast).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('renders info type', () => {
    const onClose = vi.fn();
    render(<Toast message="Info" type="info" onClose={onClose} />);
    
    const toast = document.querySelector('.toast-info');
    expect(toast).toBeInTheDocument();
    expect(screen.getByText('ℹ️')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    vi.useRealTimers(); // Use real timers for this test
    const onClose = vi.fn();
    render(<Toast message="Test" onClose={onClose} />);
    
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    }, { timeout: 500 });
  });

  it('auto-closes after duration', async () => {
    const onClose = vi.fn();
    render(<Toast message="Test" duration={1000} onClose={onClose} />);
    
    // Fast-forward time
    vi.advanceTimersByTime(1000);
    
    // Wait for the animation timeout
    vi.advanceTimersByTime(300);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('is visible initially', () => {
    const onClose = vi.fn();
    render(<Toast message="Test" onClose={onClose} />);
    
    const toast = document.querySelector('.toast-visible');
    expect(toast).toBeInTheDocument();
  });
});
