// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  setDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCu08pN-UftmdeCnb7eANXGvZSuJroZfTg",
  authDomain: "smit-firebase-e6ef5.firebaseapp.com",
  projectId: "smit-firebase-e6ef5",
  storageBucket: "smit-firebase-e6ef5.appspot.com",
  messagingSenderId: "175151531259",
  appId: "1:175151531259:web:9ccaded8a82059cc265c5e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  console.log(user);
  return user;
}

export {
  app,
  auth,
  db,
  signInWithGoogle,
  onAuthStateChanged,
  signOut,
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  setDoc,
  uploadBytes,
  storage,
  ref,
  getDownloadURL,
  query,
  where,
  onSnapshot,
  deleteDoc,
  deleteObject,
  getDoc,
};
