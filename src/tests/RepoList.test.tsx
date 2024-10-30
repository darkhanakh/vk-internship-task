// @ts-ignore
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRepoStore } from '../stores/RepoStore';
import RepoList from '../components/RepoList';
import { Repo } from '../types/Repo';
import '@testing-library/jest-dom';

jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  Spin: jest.fn(() => null),
}));

// Mock the useRepoStore hook
jest.mock('../stores/RepoStore', () => {
  const originalModule = jest.requireActual('../stores/RepoStore');
  return {
    ...originalModule,
    useRepoStore: jest.fn(),
  };
});

// Mock the RepoItem component
jest.mock('../components/RepoItem', () => {
  return function MockRepoItem({ repo }: { repo: Repo }) {
    return <div data-testid={`repo-item-${repo.id}`}>{repo.name}</div>;
  };
});

describe('RepoList Component', () => {
  const mockRepos: Repo[] = [
    {
      id: 1,
      name: 'Repo 1',
      description: 'Description 1',
      stargazers_count: 100,
      updated_at: '2023-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Repo 2',
      description: 'Description 2',
      stargazers_count: 200,
      updated_at: '2023-01-02T00:00:00Z',
    },
  ];

  let mockStore: any;

  beforeEach(() => {
    mockStore = {
      repos: mockRepos,
      loading: false,
      error: null,
      sortField: 'stars' as const,
      sortOrder: 'desc' as const,
      fetchRepos: jest.fn(),
      setSortField: jest.fn(),
      setSortOrder: jest.fn(),
      resetToDefault: jest.fn(),
      editRepo: jest.fn(),
      deleteRepo: jest.fn(),
    };

    // Mock the implementation of useRepoStore to return our mockStore
    (useRepoStore as jest.Mock).mockReturnValue(mockStore);
  });

  it('renders the component with repos', () => {
    render(<RepoList />);

    expect(screen.getByText('GitHub Repositories')).toBeInTheDocument();
    expect(screen.getByText('Repo 1')).toBeInTheDocument();
    expect(screen.getByText('Repo 2')).toBeInTheDocument();
  });

  it('fetches repos on initial render if repos are empty', () => {
    mockStore.repos = [];

    render(<RepoList />);

    expect(mockStore.fetchRepos).toHaveBeenCalledTimes(1);
  });

  it('handles sort field change', () => {
    render(<RepoList />);

    // Simulate selecting 'Name' in the sort field dropdown
    fireEvent.mouseDown(screen.getByText('Stars'));
    fireEvent.click(screen.getByText('Name'));

    expect(mockStore.setSortField).toHaveBeenCalledWith('name');
  });

  it('handles sort order change', () => {
    render(<RepoList />);

    // Simulate selecting 'Ascending' in the sort order dropdown
    fireEvent.mouseDown(screen.getByText('Descending'));
    fireEvent.click(screen.getByText('Ascending'));

    expect(mockStore.setSortOrder).toHaveBeenCalledWith('asc');
  });

  it('handles reset button click', () => {
    render(<RepoList />);

    fireEvent.click(screen.getByText('Reset'));

    expect(mockStore.resetToDefault).toHaveBeenCalledTimes(1);
  });

  it('displays error message when there is an error', () => {
    mockStore.error = 'Test error message';

    render(<RepoList />);

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('displays loading spinner when loading', () => {
    mockStore.loading = true;

    const { container } = render(<RepoList />);

    expect(container.querySelector('.spinnerContainer')).toHaveClass('spinnerContainer');
  });
});
