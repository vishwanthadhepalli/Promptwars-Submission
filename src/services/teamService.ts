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
        const data = teamDoc.data();
        const members = data.members || [];
        const roles = data.roles || {};
        
        if (!members.includes(userId)) {
          await updateDoc(teamRef, {
            members: [...members, userId],
            roles: { ...roles, [userId]: 'member' }
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
      roles: { [userId]: 'admin' },
      invitedEmails: [],
      createdAt: serverTimestamp()
    });

    return newTeamRef.id;
  },

  getTeamMembers: async (teamId: string) => {
    try {
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      if (!teamDoc.exists()) return [];
      
      const teamData = teamDoc.data();
      const memberIds = teamData.members || [];
      const roles = teamData.roles || {};
      
      if (memberIds.length === 0) return [];

      // Batch fetch users using documentId() in query
      // Limit of 30 for 'in' queries in Firestore
      const members: any[] = [];
      const chunks = [];
      for (let i = 0; i < memberIds.length; i += 30) {
        chunks.push(memberIds.slice(i, i + 30));
      }

      for (const chunk of chunks) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('__name__', 'in', chunk));
        const userSnaps = await getDocs(q);
        userSnaps.forEach(snap => {
          const uid = snap.id;
          members.push({ 
            uid, 
            ...snap.data(),
            role: roles[uid] || 'member' 
          });
        });
      }

      return members;
    } catch (error) {
      console.error("Error fetching team members:", error);
      return [];
    }
  },

  inviteMember: async (teamId: string, email: string) => {
    if (!teamId || !email) throw new Error("Team ID and Email are required for invitation");
    // In a real app, you'd create a 'pendingInvites' collection
    // For this demo, we'll simulate the magic link being sent
    // and provide a way for the user to be added to members when they sign in
    try {
      const teamRef = doc(db, 'teams', teamId);
      const teamSnap = await getDoc(teamRef);
      if (!teamSnap.exists()) throw new Error("Team not found");
      
      const invitedEmails = teamSnap.data()?.invitedEmails || [];
      
      if (!invitedEmails.includes(email)) {
        await updateDoc(teamRef, {
          invitedEmails: [...invitedEmails, email]
        });
      }
    } catch (error) {
      console.error("Error inviting member:", error);
      throw error;
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
