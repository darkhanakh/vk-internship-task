import React, { useState } from 'react';
import { Card, Button, Input, Modal } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Repo } from '../../types/Repo.ts';
import styles from './RepoItem.module.css';

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
      onOk: () => onDelete(repo.id),
    });
  };

  return (
      <Card className={styles.card}>
        {isEditing ? (
            <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onPressEnter={handleEdit}
                onBlur={() => setIsEditing(false)}
                autoFocus
            />
        ) : (
            <h3>{repo.name}</h3>
        )}
        <p>{repo.description}</p>
        <p>Stars: {repo.stargazers_count}</p>
        <div className={styles.actions}>
          <Button icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
            Edit
          </Button>
          <Button icon={<DeleteOutlined />} onClick={handleDelete} danger>
            Delete
          </Button>
        </div>
      </Card>
  );
};

export default RepoItem;