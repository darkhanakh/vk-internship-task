import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { List, Spin } from 'antd';
import { useRepoStore } from '../../stores/RepoStore.tsx';
import RepoItem from '../RepoItem';
import styles from './RepoList.module.css';

const RepoList: React.FC = observer(() => {
  const repoStore = useRepoStore();

  useEffect(() => {
    repoStore.fetchRepos();
  }, []);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    if (scrollHeight - scrollTop === clientHeight) {
      repoStore.fetchRepos();
    }
  };

  return (
      <div className={styles.listContainer} onScroll={handleScroll}>
        <List
            dataSource={repoStore.repos}
            renderItem={(repo) => (
                <RepoItem
                    key={repo.id}
                    repo={repo}
                    onEdit={repoStore.editRepo}
                    onDelete={repoStore.deleteRepo}
                />
            )}
        />
        {repoStore.loading && (
            <div className={styles.spinnerContainer}>
              <Spin size="large" />
            </div>
        )}
      </div>
  );
});

export default RepoList;