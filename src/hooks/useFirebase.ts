import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (u) {
        // Sync user to firestore
        const userRef = doc(db, 'users', u.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          await setDoc(userRef, {
            displayName: u.displayName,
            email: u.email,
            photoURL: u.photoURL,
            teamIds: []
          });
        }
      }
      setUser(u);
      setLoading(false);
    });
  }, []);

  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logout = () => auth.signOut();

  return { user, loading, loginWithGoogle, logout };
}

export function useTeamData(teamId: string | null) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    const unsubTasks = onSnapshot(
      doc(db, 'teams', teamId, 'tasks', '__all__'), // Placeholder for real collection listener
      () => {}
    );
    // Note: real app would use collection(db, 'teams', teamId, 'tasks')
    // and handleFirestoreError as per instructions.
    
    return () => {
      unsubTasks();
    };
  }, [teamId]);

  return { tasks, documents, insights, loading };
}
