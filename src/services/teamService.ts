import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc,
  query, 
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { TaskService } from './taskService';

export const TeamService = {
  getOrCreateDefaultTeam: async (userId: string, userEmail?: string, requestedName?: string) => {
    // Check if user is already a member of any team
    const teamsRef = collection(db, 'teams');
    const q = query(teamsRef, where('members', 'array-contains', userId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return snapshot.docs[0].id;
    }

    // Check if user is invited to any team by email
    if (userEmail) {
      const qInvite = query(teamsRef, where('invitedEmails', 'array-contains', userEmail));
      const inviteSnapshot = await getDocs(qInvite);
      if (!inviteSnapshot.empty) {
        const teamDoc = inviteSnapshot.docs[0];
        const teamRef = doc(db, 'teams', teamDoc.id);
        const members = teamDoc.data().members || [];
        if (!members.includes(userId)) {
          await updateDoc(teamRef, {
            members: [...members, userId]
          });
        }
        return teamDoc.id;
      }
    }

    // Create a default team if none exists and no invitation
    const newTeamRef = doc(collection(db, 'teams'));
    await setDoc(newTeamRef, {
      name: requestedName || 'My Workspace',
      ownerId: userId,
      members: [userId],
      invitedEmails: [],
      createdAt: serverTimestamp()
    });

    return newTeamRef.id;
  },

  getTeamMembers: async (teamId: string) => {
    const teamDoc = await getDoc(doc(db, 'teams', teamId));
    if (!teamDoc.exists()) return [];
    
    const memberIds = teamDoc.data().members || [];
    const members = [];
    
    for (const uid of memberIds) {
      const userSnap = await getDoc(doc(db, 'users', uid));
      if (userSnap.exists()) {
        members.push({ uid, ...userSnap.data() });
      }
    }
    return members;
  },

  inviteMember: async (teamId: string, email: string) => {
    // In a real app, you'd create a 'pendingInvites' collection
    // For this demo, we'll simulate the magic link being sent
    // and provide a way for the user to be added to members when they sign in
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);
    const invitedEmails = teamSnap.data().invitedEmails || [];
    
    if (!invitedEmails.includes(email)) {
      await updateDoc(teamRef, {
        invitedEmails: [...invitedEmails, email]
      });
    }
  },

  seedSampleData: async (teamId: string, userId: string) => {
    const samples = [
      { 
        title: 'Implement RAG Layer for Documentation', 
        priority: 'high', 
        status: 'in-progress', 
        assignee: 'Alex J.', 
        risk: '15%', 
        tags: ['Core', 'AI'],
        creatorId: userId 
      },
      { 
        title: 'Redesign Brand Identity for Newton', 
        priority: 'high', 
        status: 'in-progress', 
        assignee: 'Sarah K.', 
        risk: '5%', 
        tags: ['Design'],
        creatorId: userId 
      },
      { 
        title: 'Weekly Stakeholder Report Generation', 
        priority: 'medium', 
        status: 'todo', 
        assignee: 'Auto-Agent', 
        risk: '0%', 
        tags: ['Admin'],
        creatorId: userId 
      },
      { 
        title: 'Resolve Firestore Dependency Conflict', 
        priority: 'high', 
        status: 'todo', 
        assignee: 'Bob L.', 
        risk: '42%', 
        tags: ['Bug'],
        creatorId: userId 
      },
      { 
        title: 'Design Review: Collaborative Workspace', 
        priority: 'low', 
        status: 'done', 
        assignee: 'Team', 
        risk: '0%', 
        tags: ['Design'],
        creatorId: userId 
      },
      { 
        title: 'Migration to Google Cloud Vector Search', 
        priority: 'high', 
        status: 'todo', 
        assignee: 'Alex J.', 
        risk: '22%', 
        tags: ['Infrastructure'],
        creatorId: userId 
      }
    ];

    for (const s of samples) {
      await TaskService.createTask(teamId, s as any);
    }
  }
};
