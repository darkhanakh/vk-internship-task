  import { renderHook } from '@testing-library/react';
  import { RepoStoreProvider, useRepoStore } from '../stores/RepoStore';
  import axios from 'axios';
  import React from 'react';
  import { Repo } from '../types/Repo';

  // Mock axios
  jest.mock('axios');
  const mockedAxios = axios as jest.Mocked<typeof axios>;

  // Mock localStorage
  const localStorageMock = (() => {
    let store: { [key: string]: string } = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });

  describe('RepoStore Integration', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <RepoStoreProvider>{children}</RepoStoreProvider>
    );

    const mockRepos: Repo[] = [
      { id: 1, name: 'repo1', description: 'Description 1', stargazers_count: 100, updated_at: '2023-01-01T00:00:00Z' },
      { id: 2, name: 'repo2', description: 'Description 2', stargazers_count: 200, updated_at: '2023-01-02T00:00:00Z' },
    ];

    beforeEach(() => {
      localStorageMock.clear();
      jest.clearAllMocks();
    });

    describe('initialization', () => {
      it('should initialize with default values', () => {
        const { result } = renderHook(() => useRepoStore(), { wrapper });

        expect(result.current.repos).toEqual([]);
        expect(result.current.loading).toBe(false);
        expect(result.current.page).toBe(1);
        expect(result.current.sortField).toBe('stars');
        expect(result.current.sortOrder).toBe('desc');
        expect(result.current.error).toBeNull();
      });

      it('should load data from localStorage if available', () => {
        localStorage.setItem('repos', JSON.stringify(mockRepos));
        localStorage.setItem('sortField', 'name');
        localStorage.setItem('sortOrder', 'asc');

        const { result } = renderHook(() => useRepoStore(), { wrapper });

        expect(result.current.repos).toEqual(mockRepos);
        expect(result.current.sortField).toBe('name');
        expect(result.current.sortOrder).toBe('asc');
      });
    });

    describe('fetchRepos', () => {
      it('should handle fetch error', async () => {
        // Mock console.error
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

        const errorMessage = 'Network Error';
        mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

        const { result } = renderHook(() => useRepoStore(), { wrapper });

        await result.current.fetchRepos();

        expect(result.current.error).toBe('Failed to fetch repositories. Please try again.');
        expect(result.current.loading).toBe(false);
        expect(result.current.repos).toEqual([]);

        // Optionally, verify that console.error was called
        expect(consoleErrorMock).toHaveBeenCalledWith('Error fetching repos:', expect.any(Error));

        // Restore console.error after the test
        consoleErrorMock.mockRestore();
      });

      it('should handle fetch error', async () => {
        const errorMessage = 'Network Error';
        mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

        const { result } = renderHook(() => useRepoStore(), { wrapper });

        await result.current.fetchRepos();

        expect(result.current.error).toBe('Failed to fetch repositories. Please try again.');
        expect(result.current.loading).toBe(false);
        expect(result.current.repos).toEqual([]);
      });
    });

    describe('sorting', () => {
      it('should update sortField and trigger new fetch', async () => {
        mockedAxios.get.mockResolvedValueOnce({
          data: { items: mockRepos },
        });

        const { result } = renderHook(() => useRepoStore(), { wrapper });

        await result.current.setSortField('name');

        expect(result.current.sortField).toBe('name');
        expect(result.current.page).toBe(2);
        expect(mockedAxios.get).toHaveBeenCalledWith(
            expect.stringContaining('sort=name')
        );
      });

      it('should update sortOrder and trigger new fetch', async () => {
        mockedAxios.get.mockResolvedValueOnce({
          data: { items: mockRepos },
        });

        const { result } = renderHook(() => useRepoStore(), { wrapper });

        await result.current.setSortOrder('asc');

        expect(result.current.sortOrder).toBe('asc');
        expect(result.current.page).toBe(2);
        expect(mockedAxios.get).toHaveBeenCalledWith(
            expect.stringContaining('order=asc')
        );
      });
    });

    describe('CRUD operations', () => {
      it('should edit repo name', () => {
        const { result } = renderHook(() => useRepoStore(), { wrapper });

        // Set initial repos
        result.current.repos = [...mockRepos];

        const newName = 'updated-repo';
        result.current.editRepo(1, newName);

        expect(result.current.repos[0].name).toBe(newName);
        expect(localStorage.getItem('repos')).toBe(JSON.stringify(result.current.repos));
      });

      it('should delete repo', () => {
        const { result } = renderHook(() => useRepoStore(), { wrapper });

        // Set initial repos
        result.current.repos = [...mockRepos];

        result.current.deleteRepo(1);

        expect(result.current.repos).toHaveLength(1);
        expect(result.current.repos[0].id).toBe(2);
        expect(localStorage.getItem('repos')).toBe(JSON.stringify(result.current.repos));
      });
    });
  });