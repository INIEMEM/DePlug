/*
  Firebase config and Firestore helpers assumed to be setup already.
  We'll be using Firestore to track profile views, talent listings, and user data.
*/

// firestore.ts
import { db } from "@/firebase/config";
import {
  collection,
  doc,
  
  updateDoc,
  query,
  where,
  getDocs,
  Timestamp,
  addDoc,
} from "firebase/firestore";
export interface UserProfileUpdate {
  displayName?: string;
  bio?: string;
  skills?: string[];
  experience?: number;
  location?: string;
  photoURL?: string;
  [key: string]: string | string[] | number | undefined; // Optional: if you want some flexibility
}
// Save a view to a profile with timestamp
export async function trackProfileView(viewedUserId: string) {
  const viewsRef = collection(db, "profileViews");
  await addDoc(viewsRef, {
    viewedUserId,
    viewedAt: Timestamp.now(),
  });
}

// Get number of views in last 24 hours
export async function getRecentViews(viewedUserId: string) {
  const since = Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const viewsQuery = query(
    collection(db, "profileViews"),
    where("viewedUserId", "==", viewedUserId),
    where("viewedAt", ">=", since)
  );

  const snapshot = await getDocs(viewsQuery);
  return snapshot.size;
}

// Get all talents
export async function fetchAllTalents() {
  const ref = collection(db, "users");
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Filter talents
export async function filterTalents(skill: string, years: number) {
  const ref = collection(db, "users");
  const q = query(ref, where("skills", "array-contains", skill), where("experience", ">=", years));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Update user profile
export async function updateUserProfile(userId: string, updates: UserProfileUpdate) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, updates);
}

// In profile page (app/dashboard/profile/page.tsx), show recent views:
// const views = await getRecentViews(currentUserId);

// In Home page, call fetchAllTalents() or filterTalents(skill, years)
// and trackProfileView(talentId) when modal opened or profile viewed
