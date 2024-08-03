// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import for Firestore
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_233gV9iiQCTmFexMVbCJlZSPOJnHn-A",
  authDomain: "onecrew-430904.firebaseapp.com",
  projectId: "onecrew-430904",
  storageBucket: "onecrew-430904.appspot.com",
  messagingSenderId: "662230801471",
  appId: "1:662230801471:web:61f49884929c60b88f6c8a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };