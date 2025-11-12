// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCNI-IzlqSIeVFW1ZY7nlRIVK2ETWqy4zo",
  authDomain: "project-kisan-efd1f.firebaseapp.com",
  projectId: "project-kisan-efd1f",
  storageBucket: "project-kisan-efd1f.firebasestorage.app",
  messagingSenderId: "52041559184",
  appId: "1:52041559184:web:53266ba7b71a71c8c2fc15",
  measurementId: "G-VG6L6NJE4J"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app); // Optional: web only
