import {
  auth,
  collection,
  db,
  doc,
  onAuthStateChanged,
  setDoc,
  signInWithGoogle,
} from "./firebase.js";

onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("User is signed in");
    location.pathname = "/files/index.html";
  } else {
    console.log("User is not signed in");
  }
});

const signin_btn = document.getElementById("signin_btn");
signin_btn.addEventListener("click", async () => {
  const user = await signInWithGoogle();
  console.log(user);
  const userRef = collection(db, "fb_users");
  const docRef = doc(userRef, user.uid);
  await setDoc(docRef, {
    name: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    uid: user.uid,
    providerData: user.providerData,
  });
  console.log("user data saved to firestore");
  if (user) {
    // console.log("User is signed in");
    location.pathname = "/files/index.html";
  } else {
    // console.log("User is not signed in");
  }
});
