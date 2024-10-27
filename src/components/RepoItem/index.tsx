import React, { useState } from 'react';
import { Card, Button, Input, Modal, Typography, Space } from 'antd';
import { EditOutlined, DeleteOutlined, StarOutlined } from '@ant-design/icons';
import { Repo } from '../../types/Repo';
import styles from './RepoItem.module.css';

const { Text, Paragraph } = Typography;

interface RepoItemProps {
  repo: Repo;
  onEdit: (id: number, newName: string) => void;
  onDelete: (id: number) => void;
}

const RepoItem: React.FC<RepoItemProps> = ({ repo, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(repo.name);

  const handleEdit = () => {
    onEdit(repo.id, newName);
    setIsEditing(false);
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Are you sure you want to delete this repository?',
      content: 'This action cannot be undone.',
      onOk: () => onDelete(repo.id),
    });
  };

  return (
      <Card className={styles.card}>
        <div className={styles.cardContent}>
          <div className={styles.repoInfo}>
            {isEditing ? (
                <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onPressEnter={handleEdit}
                    onBlur={() => setIsEditing(false)}
                    autoFocus
                />
            ) : (
                <Text strong className={styles.repoName}>{repo.name}</Text>
            )}
            <Paragraph ellipsis={{ rows: 2 }} className={styles.repoDescription}>
              {repo.description}
            </Paragraph>
            <Space className={styles.repoMeta}>
              <Text><StarOutlined /> {repo.stargazers_count}</Text>
              <Text>Updated: {new Date(repo.updated_at).toLocaleDateString()}</Text>
            </Space>
          </div>
          <div className={styles.actions}>
            <Button icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button icon={<DeleteOutlined />} onClick={handleDelete} danger>
              Delete
            </Button>
          </div>
        </div>
      </Card>
  );
};

export default RepoItem;