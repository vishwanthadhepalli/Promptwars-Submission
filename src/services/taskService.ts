import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  or,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Security Error: ', JSON.stringify(errInfo));
}

export interface Task {
  id?: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  startDate?: string;
  dueDate?: string;
  assigneeId?: string;
  assignee?: string;
  collaboratorIds?: string[];
  collaborators?: string[];
  creatorId: string;
  tags?: string[];
  risk?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export const TaskService = {
  subscribeToTasks: (teamId: string, userId: string, callback: (tasks: Task[]) => void) => {
    const path = `teams/${teamId}/tasks`;
    
    // We want tasks where the user is creator OR assigneeId OR collaboratorIds
    const q = query(
      collection(db, path),
      or(
        where('creatorId', '==', userId),
        where('assigneeId', '==', userId),
        where('collaboratorIds', 'array-contains', userId)
      ),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      callback(tasks);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  createTask: async (teamId: string, task: Partial<Task>) => {
    if (!teamId || !task.title) {
       console.error("Missing required fields for createTask");
       return null;
    }
    const path = `teams/${teamId}/tasks`;
    try {
      return await addDoc(collection(db, path), {
        ...task,
        status: task.status || 'todo',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },

  updateTask: async (teamId: string, taskId: string, updates: Partial<Task>) => {
    if (!teamId || !taskId) return;
    const path = `teams/${teamId}/tasks/${taskId}`;
    try {
      const taskRef = doc(db, path);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },

  deleteTask: async (teamId: string, taskId: string) => {
    const path = `teams/${teamId}/tasks/${taskId}`;
    try {
      const taskRef = doc(db, path);
      await deleteDoc(taskRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
};
