import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { List, Spin, Select, Alert, Button, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useRepoStore, SortField, SortOrder } from '../../stores/RepoStore';
import RepoItem from '../RepoItem';
import styles from './RepoList.module.css';

const { Option } = Select;
const { Title } = Typography;

const RepoList: React.FC = observer(() => {
  const repoStore = useRepoStore();

  useEffect(() => {
    if (repoStore.repos.length === 0) {
      repoStore.fetchRepos();
    }
  }, []);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    if (scrollHeight - scrollTop === clientHeight) {
      repoStore.fetchRepos();
    }
  };

  const handleSortFieldChange = (value: SortField) => {
    repoStore.setSortField(value);
  };

  const handleSortOrderChange = (value: SortOrder) => {
    repoStore.setSortOrder(value);
  };

  const handleReset = () => {
    repoStore.resetToDefault();
  };

  return (
      <div className={styles.listContainer}>
        <div className={styles.header}>
          <Title level={2}>GitHub Repositories</Title>
          <div className={styles.controls}>
            <Select
                value={repoStore.sortField}
                style={{ width: 120 }}
                onChange={handleSortFieldChange}
            >
              <Option value="stars">Stars</Option>
              <Option value="name">Name</Option>
              <Option value="updated">Updated</Option>
            </Select>
            <Select
                value={repoStore.sortOrder}
                style={{ width: 120 }}
                onChange={handleSortOrderChange}
            >
              <Option value="desc">Descending</Option>
              <Option value="asc">Ascending</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
        {repoStore.error && (
            <Alert message={repoStore.error} type="error" showIcon className={styles.errorAlert} />
        )}
        <div onScroll={handleScroll} className={styles.scrollContainer}>
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
      </div>
  );
});

export default RepoList;