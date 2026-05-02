import { describe, it, expect, vi } from 'vitest';
import { TaskService } from '../services/taskService';
import * as firestore from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({ type: 'collection' })),
  doc: vi.fn(() => ({ type: 'doc' })),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  or: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => ({ seconds: 12345, nanoseconds: 0 })),
  onSnapshot: vi.fn(),
  getFirestore: vi.fn()
}));

vi.mock('../lib/firebase', () => ({
  db: {},
  auth: { currentUser: { uid: 'user123' } }
}));

describe('TaskService Logic', () => {
  it('should call addDoc when creating a task', async () => {
    const mockAddDoc = vi.mocked(firestore.addDoc);
    const taskData = { title: 'New Task', priority: 'high' as const };
    
    await TaskService.createTask('team1', taskData);
    
    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        title: 'New Task',
        priority: 'high',
        status: 'todo'
      })
    );
  });

  it('should call updateDoc when updating a task', async () => {
    const mockUpdateDoc = vi.mocked(firestore.updateDoc);
    const updates = { status: 'done' as const };
    
    await TaskService.updateTask('team1', 'task1', updates);
    
    expect(mockUpdateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        status: 'done'
      })
    );
  });

  it('should call deleteDoc when deleting a task', async () => {
    const mockDeleteDoc = vi.mocked(firestore.deleteDoc);
    
    await TaskService.deleteTask('team1', 'task1');
    
    expect(mockDeleteDoc).toHaveBeenCalled();
  });
});
