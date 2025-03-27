// filepath: src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBmhjYZtT7mLIC0zh39Wk3cEJgYUdOrgDM",
    authDomain: "warikan-f3731.firebaseapp.com",
    projectId: "warikan-f3731",
    storageBucket: "warikan-f3731.firebasestorage.app",
    messagingSenderId: "601564462061",
    appId: "1:601564462061:web:96d4d6213063d399e045e4",
    measurementId: "G-3YXESW9K3H"
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };