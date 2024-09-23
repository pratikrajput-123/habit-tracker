// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBRCt1vuP-SEWNSve2hoLFwkZSscTx2Ggk",
    authDomain: "tracker-d04dd.firebaseapp.com",
    projectId: "tracker-d04dd",
    storageBucket: "tracker-d04dd.appspot.com",
    messagingSenderId: "955870346708",
    appId: "1:955870346708:web:f1dece4bd5280f9cd86a41",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
