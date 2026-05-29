import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  serverTimestamp, 
  where, 
  orderBy,
  runTransaction,
  collectionGroup,
  limit
} from "firebase/firestore";
import { db, handleFirestoreError } from "./firebase";
import { useAuth } from "./auth";
import { toast } from "sonner";

export function useMatches() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show upcoming, live and and a few recent completed matches
    const q = query(collection(db, "matches"), orderBy("startTime", "desc"), limit(40));
    const unsub = onSnapshot(q, (snap) => {
      setMatches(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, 'list', 'matches');
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { matches, loading };
}

export function useUserRegistrations() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collectionGroup(db, "registrations"), 
      where("userId", "==", user.uid),
      orderBy("joinedAt", "desc"),
      limit(20)
    );
    const unsub = onSnapshot(q, (snap) => {
      setRegistrations(snap.docs.map(d => d.data()));
    }, (err) => handleFirestoreError(err, 'list', 'registrations_group'));
    return () => unsub();
  }, [user]);

  return registrations;
}

export function useMatchChat(matchId: string) {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!matchId) return;
    const q = query(
      collection(db, "matches", matchId, "chat"), 
      orderBy("createdAt", "asc"),
      limit(50)
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => handleFirestoreError(err, 'list', `matches/${matchId}/chat`));
    return () => unsub();
  }, [matchId]);

  return messages;
}

export async function sendChatMessage(matchId: string, userId: string, userName: string, message: string) {
  try {
    await addDoc(collection(db, "matches", matchId, "chat"), {
      userId,
      userName,
      message,
      createdAt: serverTimestamp()
    });
  } catch (err: any) {
    handleFirestoreError(err, 'create', `matches/${matchId}/chat`);
    throw err;
  }
}

export async function joinMatch(matchId: string, userId: string, gameName: string, teamNames: string[] = []) {
  try {
    const matchRef = doc(db, "matches", matchId);
    const userRef = doc(db, "users", userId);
    
    await runTransaction(db, async (transaction) => {
      const matchDoc = await transaction.get(matchRef);
      const userDoc = await transaction.get(userRef);
      
      if (!matchDoc.exists() || !userDoc.exists()) throw new Error("Document mismatch");
      
      const matchData = matchDoc.data();
      const userData = userDoc.data();
      
      if (matchData.joinedCount >= matchData.slots) {
        throw new Error("Match is already deployed at full capacity.");
      }

      if (userData.balance < matchData.entryFee) {
        throw new Error("Insufficient balance");
      }
      
      // Calculate Slot Number
      const newSlotNumber = (matchData.joinedCount || 0) + 1;
      
      transaction.update(userRef, {
        balance: userData.balance - matchData.entryFee,
        matchesPlayed: (userData.matchesPlayed || 0) + 1,
        xp: (userData.xp || 0) + 10 // Participation XP
      });
      
      transaction.update(matchRef, {
        joinedCount: (matchData.joinedCount || 0) + 1
      });

      const regRef = doc(collection(db, "matches", matchId, "registrations"));
      transaction.set(regRef, {
        matchId,
        userId,
        gameName,
        teamNames,
        slotNumber: newSlotNumber,
        status: "joined",
        joinedAt: serverTimestamp()
      });

      // Simple Notification for squad
      const notifRef = doc(collection(db, "users", userId, "notifications"));
      transaction.set(notifRef, {
        title: "Tactical Deployment Confirmed",
        message: `Assigned Slot #${newSlotNumber} for ${matchData.title}. Do NOT deviate from this slot in-game or suffer immediate kick protocol.`,
        type: "match",
        read: false,
        createdAt: serverTimestamp()
      });
    });
    
    toast.success("Successfully joined the match!");
  } catch (err: any) {
    toast.error(err.message);
    throw err;
  }
}
