// database/db.ts
import { initializeApp } from 'firebase/app';
import { collection, getFirestore } from 'firebase/firestore';

// ⬇️ COLOCA AQUI O firebaseConfig QUE O CONSOLE DO FIREBASE TE MOSTROU

const firebaseConfig = {
  apiKey: "AIzaSyC0dHaypL_zZizbF_WgEzlqNoKO0X6ewDc",
  authDomain: "solarappweb.firebaseapp.com",
  projectId: "solarappweb",
  storageBucket: "solarappweb.firebasestorage.app",
  messagingSenderId: "1012909390800",
  appId: "1:1012909390800:web:92dea9fc092f98ebb9d7d5",
  measurementId: "G-NE5JF0Q5M5"

};

// Inicia o app Firebase
const app = initializeApp(firebaseConfig);

// Firestore = banco de dados na nuvem
export const db = getFirestore(app);

// Coleções (como se fossem tabelas)
export const leadsCol      = collection(db, 'leads');
export const visitsCol     = collection(db, 'visits');
export const contractsCol  = collection(db, 'contracts');
export const serviceCol    = collection(db, 'service');
export const billingCol    = collection(db, 'billing');
export const afterSalesCol = collection(db, 'after_sales');
export const usersCol      = collection(db, 'users');

export default db;
