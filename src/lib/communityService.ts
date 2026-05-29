import { 
  collection, 
  doc, 
  setDoc,
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  runTransaction,
  getDocs,
  limit
} from "firebase/firestore";
import { db, handleFirestoreError } from "./firebase";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function useDailyCheckIn(userId: string | undefined, lastCheckIn: string | undefined) {
  const [canCheckIn, setCanCheckIn] = useState(false);

  useEffect(() => {
    if (!userId) return;
    if (!lastCheckIn) {
      setCanCheckIn(true);
      return;
    }

    const lastDate = new Date(lastCheckIn).toDateString();
    const today = new Date().toDateString();
    setCanCheckIn(lastDate !== today);
  }, [userId, lastCheckIn]);

  const claimReward = async () => {
    if (!userId || !canCheckIn) return;

    try {
      const userRef = doc(db, "users", userId);
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(userRef);
        if (!snap.exists()) throw new Error("User missing");
        
        tx.update(userRef, {
          balance: snap.data().balance + 1, // Reward ৳1
          lastCheckIn: new Date().toISOString(),
          xp: (snap.data().xp || 0) + 5
        });
      });
      toast.success("Tactical supplies claimed! ৳1 added.");
      setCanCheckIn(false);
    } catch (err: any) {
      toast.error("Supplies requisition failed.");
    }
  };

  return { canCheckIn, claimReward };
}

export function useHighlights() {
  const [highlights, setHighlights] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "highlights"), orderBy("createdAt", "desc"), limit(10));
    const unsub = onSnapshot(q, (snap) => {
      setHighlights(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => handleFirestoreError(err, 'list', 'highlights'));
    return () => unsub();
  }, []);

  return highlights;
}

export async function uploadHighlight(userId: string, userName: string, title: string, videoUrl: string) {
  try {
    await addDoc(collection(db, "highlights"), {
      userId,
      userName,
      title,
      videoUrl,
      likes: 0,
      createdAt: serverTimestamp()
    });
    toast.success("Battle report uploaded to Command Center.");
  } catch (err: any) {
    toast.error("Upload protocol failed.");
  }
}

export async function submitSupportTicket(userId: string, subject: string, message: string) {
  try {
    await addDoc(collection(db, "tickets"), {
      userId,
      subject,
      message,
      status: "open",
      createdAt: serverTimestamp()
    });
    toast.success("Emergency signal sent. Strategy pending.");
  } catch (err: any) {
    toast.error("Frequency jammed. Support unavailable.");
  }
}

export function useFollowers(targetUserId: string | undefined) {
  const [followers, setFollowers] = useState<any[]>([]);

  useEffect(() => {
    if (!targetUserId) return;
    const q = query(collection(db, "follows"), where("followingId", "==", targetUserId));
    const unsub = onSnapshot(q, (snap) => {
      setFollowers(snap.docs.map(d => d.data()));
    }, (err) => handleFirestoreError(err, 'list', 'follows'));
    return () => unsub();
  }, [targetUserId]);

  return followers;
}

export async function followUser(followerId: string, followingId: string) {
  try {
    const followId = `${followerId}_${followingId}`;
    await setDoc(doc(db, "follows", followId), {
      followerId,
      followingId,
      createdAt: serverTimestamp()
    });
    toast.success("Squad following established.");
  } catch (err: any) {
    toast.error("Relational link failed.");
  }
}
