import { makeAutoObservable } from 'mobx';
import React, { createContext, useContext } from 'react';
import axios from 'axios';
import { Repo } from '../types/Repo';

export type SortField = 'stars' | 'name' | 'updated';
export type SortOrder = 'asc' | 'desc';

class RepoStore {
  repos: Repo[] = [];
  loading = false;
  page = 1;
  sortField: SortField = 'stars';
  sortOrder: SortOrder = 'desc';
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setSortField = (field: SortField) => {
    this.sortField = field;
    this.page = 1;
    this.repos = [];
    this.fetchRepos();
  };

  setSortOrder = (order: SortOrder) => {
    this.sortOrder = order;
    this.page = 1;
    this.repos = [];
    this.fetchRepos();
  };

  fetchRepos = async () => {
    this.loading = true;
    this.error = null;
    try {
      const response = await axios.get(
          `https://api.github.com/search/repositories?q=javascript&sort=${this.sortField}&order=${this.sortOrder}&page=${this.page}`
      );
      this.repos = [...this.repos, ...response.data.items];
      this.page += 1;
    } catch (error) {
      console.error('Error fetching repos:', error);
      this.error = 'Failed to fetch repositories. Please try again.';
    }
    this.loading = false;
  };

  editRepo = (id: number, newName: string) => {
    const index = this.repos.findIndex((repo) => repo.id === id);
    if (index !== -1) {
      this.repos[index] = { ...this.repos[index], name: newName };
    }
  };

  deleteRepo = (id: number) => {
    this.repos = this.repos.filter((repo) => repo.id !== id);
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