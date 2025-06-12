// firebase/config.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCr-pSCwQ05CwJyYyvW35n0YMcZo9dUmhk",
  authDomain: "e-commerce-dashboard-site.firebaseapp.com",
  projectId: "e-commerce-dashboard-site",
  storageBucket: "e-commerce-dashboard-site.appspot.com",
  messagingSenderId: "673933462707",
  appId: "1:673933462707:web:a83db208963713517ef4c6"
};



const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
