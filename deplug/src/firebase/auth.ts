// firebase/auth.ts
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./config";
import { doc, setDoc } from "firebase/firestore";

export type RegisterData = {
  // uid: string;
  email: string;
  password: string;
  name: string;
  userType: 'developer' | 'creative' | 'hiring_manager';
  description: string;
  country: string;
  state: string;
  address: string;
  profilePictureUrl: string;
  portfolioLink: string;
  yearsOfExperience: number;
  companies: string[];
  skills: string[];
  cvUrl: string;
  projects: {
    imageUrl: string;
    description: string;
    link: string;
  }[];
  // createdAt: string;
};

export async function registerUser(data: RegisterData) {
  const { email, password, ...rest } = data;
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCred.user.uid;

 const response =  await setDoc(doc(db, 'users', uid), {
    uid,
    email,
    createdAt: new Date().toISOString(),
    views: [],
    ...rest,
  });

  console.log('the response ', response)

  return uid;
}

export async function loginUser(email: string, password: string) {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  return userCred.user;
}
