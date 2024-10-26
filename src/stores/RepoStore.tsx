import { makeAutoObservable } from 'mobx';
import React, { createContext, useContext } from 'react';
import axios from 'axios';
import { Repo } from '../types/Repo';

class RepoStore {
  repos: Repo[] = [];
  loading = false;
  page = 1;

  constructor() {
    makeAutoObservable(this);
  }

  fetchRepos = async () => {
    this.loading = true;
    try {
      const response = await axios.get(
          `https://api.github.com/search/repositories?q=javascript&sort=stars&order=desc&page=${this.page}`
      );
      this.repos = [...this.repos, ...response.data.items];
      this.page += 1;
    } catch (error) {
      console.error('Error fetching repos:', error);
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
  return (
      <RepoStoreContext.Provider value={store}>
          {children}
          </RepoStoreContext.Provider>
  );
};


export const useRepoStore = () => {
  const store = useContext(RepoStoreContext);
  if (!store) {
    throw new Error('useRepoStore must be used within a RepoStoreProvider');
  }
  return store;
};