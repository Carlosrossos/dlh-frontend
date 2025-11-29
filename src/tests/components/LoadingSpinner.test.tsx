import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../../components/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders inline spinner by default', () => {
    render(<LoadingSpinner />);
    
    const spinner = document.querySelector('.loading-inline');
    expect(spinner).toBeInTheDocument();
  });

  it('renders fullscreen spinner when fullScreen prop is true', () => {
    render(<LoadingSpinner fullScreen />);
    
    const spinner = document.querySelector('.loading-fullscreen');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with text when provided', () => {
    render(<LoadingSpinner text="Loading..." />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with small size class', () => {
    render(<LoadingSpinner size="small" />);
    
    const spinner = document.querySelector('.spinner-small');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with medium size class by default', () => {
    render(<LoadingSpinner />);
    
    const spinner = document.querySelector('.spinner-medium');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with large size class', () => {
    render(<LoadingSpinner size="large" />);
    
    const spinner = document.querySelector('.spinner-large');
    expect(spinner).toBeInTheDocument();
  });

  it('renders spinner rings', () => {
    render(<LoadingSpinner />);
    
    const rings = document.querySelectorAll('.spinner-ring');
    expect(rings).toHaveLength(4);
  });
});
