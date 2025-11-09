// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCaSTHlryZMS5JJ4T8ErgttAlEpSJ2jVqI",
  authDomain: "shield-3e478.firebaseapp.com",
  projectId: "shield-3e478",
  storageBucket: "shield-3e478.firebasestorage.app",
  messagingSenderId: "71321744429",
  appId: "1:71321744429:web:45d7f4b4545909827df4a4",
  measurementId: "G-XBFWMPYRJR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics only in the browser environment
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, db, storage, analytics };

// This file provides the Firebase configuration and initializes the necessary services.
// You can import these services in other files like this:
// import { auth, db, storage } from './firebase';
