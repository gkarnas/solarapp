import { initializeApp } from 'firebase/app';
import { collection, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC0dHaypL_zZizbF_WgEzlqNoKO0X6ewDc",
  authDomain: "solarappweb.firebaseapp.com",
  projectId: "solarappweb",
  storageBucket: "solarappweb.firebasestorage.app",
  messagingSenderId: "1012909390800",
  appId: "1:1012909390800:web:92dea9fc092f98ebb9d7d5",
  measurementId: "G-NE5JF0Q5M5",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const productsCol = collection(db, 'products');
export const clientsCol = collection(db, 'clients');
export const leadsCol = clientsCol;

