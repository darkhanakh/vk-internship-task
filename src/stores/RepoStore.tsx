import { makeAutoObservable, runInAction } from 'mobx';
import React, { createContext, useContext } from 'react';
import axios from 'axios';
import { Repo } from '../types/Repo';

export type SortField = 'stars' | 'name' | 'updated';
export type SortOrder = 'asc' | 'desc';

class RepoStore {
  repos: ({ name: string; id: number; stars: number } | { name: string; id: number; stars: number })[] = [];
  loading = false;
  page = 1;
  sortField: SortField = 'stars';
  sortOrder: SortOrder = 'desc';
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.loadFromLocalStorage();
  }

  loadFromLocalStorage = () => {
    const storedRepos = localStorage.getItem('repos');
    const storedSortField = localStorage.getItem('sortField') as SortField;
    const storedSortOrder = localStorage.getItem('sortOrder') as SortOrder;

    if (storedRepos) {
      this.repos = JSON.parse(storedRepos);
    }
    if (storedSortField) {
      this.sortField = storedSortField;
    }
    if (storedSortOrder) {
      this.sortOrder = storedSortOrder;
    }
  };

  saveToLocalStorage = () => {
    localStorage.setItem('repos', JSON.stringify(this.repos));
    localStorage.setItem('sortField', this.sortField);
    localStorage.setItem('sortOrder', this.sortOrder);
  };

  setSortField = (field: SortField) => {
    this.sortField = field;
    this.page = 1;
    this.repos = [];
    this.fetchRepos();
    this.saveToLocalStorage();
  };

  setSortOrder = (order: SortOrder) => {
    this.sortOrder = order;
    this.page = 1;
    this.repos = [];
    this.fetchRepos();
    this.saveToLocalStorage();
  };

  fetchRepos = async () => {
    this.loading = true;
    this.error = null;
    try {
      const response = await axios.get(
          `https://api.github.com/search/repositories?q=javascript&sort=${this.sortField}&order=${this.sortOrder}&page=${this.page}`
      );
      runInAction(() => {
        this.repos = [...this.repos, ...response.data.items];
        this.page += 1;
        this.saveToLocalStorage();
      });
    } catch (error) {
      runInAction(() => {
        console.error('Error fetching repos:', error);
        this.error = 'Failed to fetch repositories. Please try again.';
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  editRepo = (id: number, newName: string) => {
    runInAction(() => {
      const index = this.repos.findIndex((repo) => repo.id === id);
      if (index !== -1) {
        this.repos[index] = { ...this.repos[index], name: newName };
        this.saveToLocalStorage();
      }
    });
  };

  deleteRepo = (id: number) => {
    runInAction(() => {
      this.repos = this.repos.filter((repo) => repo.id !== id);
      this.saveToLocalStorage();
    });
  };

  resetToDefault = () => {
    runInAction(() => {
      this.repos = [];
      this.page = 1;
      this.sortField = 'stars';
      this.sortOrder = 'desc';
      this.error = null;
      localStorage.removeItem('repos');
      localStorage.removeItem('sortField');
      localStorage.removeItem('sortOrder');
      this.fetchRepos();
    });
  };
}

const RepoStoreContext = createContext<RepoStore | null>(null);

export const RepoStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = new RepoStore();
  return <RepoStoreContext.Provider value={store}>{children}</RepoStoreContext.Provider>;
};

export const useRepoStore = () => {
  const store = useContext(RepoStoreContext);
  if (!store) {
    throw new Error('useRepoStore must be used within a RepoStoreProvider');
  }
  return store;
};