import React from 'react';
import { Layout } from 'antd';
import RepoList from './components/RepoList';
import styles from './App.module.css';

const { Header, Content } = Layout;

const App: React.FC = () => {
  return (
      <Layout className={styles.layout}>
        <Header className={styles.header}>
          <h1>Список Репозиториев</h1>
        </Header>
        <Content className={styles.content}>
          <RepoList />
        </Content>
      </Layout>
  );
};

export default App;