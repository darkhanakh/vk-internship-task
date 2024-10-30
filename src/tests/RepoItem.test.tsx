// @ts-ignore
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RepoItem from '../components/RepoItem';
import { Repo } from '../types/Repo';
import { Modal } from 'antd';

// Mock the Modal.confirm method from Ant Design
jest.mock('antd', () => {
  const actualAntd = jest.requireActual('antd');
  return {
    ...actualAntd,
    Modal: {
      ...actualAntd.Modal,
      confirm: jest.fn(),
    },
  };
});

describe('RepoItem Component', () => {
  const mockRepo: Repo = {
    id: 1,
    name: 'Test Repo',
    description: 'This is a test repository',
    stargazers_count: 42,
    updated_at: '2023-01-01T00:00:00Z',
  };

  const onEditMock = jest.fn();
  const onDeleteMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders repository information correctly', () => {
    render(<RepoItem repo={mockRepo} onEdit={onEditMock} onDelete={onDeleteMock} />);

    expect(screen.getByText('Test Repo')).toBeInTheDocument();
    expect(screen.getByText('This is a test repository')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText(/Updated:/)).toBeInTheDocument();
  });

  it('enters edit mode when Edit button is clicked', () => {
    render(<RepoItem repo={mockRepo} onEdit={onEditMock} onDelete={onDeleteMock} />);

    fireEvent.click(screen.getByRole('button', { name: /Edit/i }));

    expect(screen.getByDisplayValue('Test Repo')).toBeInTheDocument();
  });

  it('calls onEdit with new name when editing is completed', () => {
    render(<RepoItem repo={mockRepo} onEdit={onEditMock} onDelete={onDeleteMock} />);

    fireEvent.click(screen.getByRole('button', { name: /Edit/i }));

    const input = screen.getByDisplayValue('Test Repo');
    fireEvent.change(input, { target: { value: 'Updated Repo' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(onEditMock).toHaveBeenCalledWith(1, 'Updated Repo');
    expect(screen.queryByDisplayValue('Updated Repo')).not.toBeInTheDocument();
    expect(screen.getByText('Updated Repo')).toBeInTheDocument();
  });

  it('shows delete confirmation when Delete button is clicked', () => {
    render(<RepoItem repo={mockRepo} onEdit={onEditMock} onDelete={onDeleteMock} />);

    fireEvent.click(screen.getByRole('button', { name: /Delete/i }));

    expect(Modal.confirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Are you sure you want to delete this repository?',
          content: 'This action cannot be undone.',
          onOk: expect.any(Function),
        })
    );
  });

  it('calls onDelete when delete is confirmed', async () => {
    (Modal.confirm as jest.Mock).mockImplementation(({ onOk }) => {
      onOk(); // Simulate user clicking OK
    });

    render(<RepoItem repo={mockRepo} onEdit={onEditMock} onDelete={onDeleteMock} />);

    fireEvent.click(screen.getByRole('button', { name: /Delete/i }));

    expect(Modal.confirm).toHaveBeenCalled();
    expect(onDeleteMock).toHaveBeenCalledWith(1);
  });
});
