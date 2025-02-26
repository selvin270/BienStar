// firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDTtBeHjw6IPcDX85kGjMYvTs0tQ4lxbzc",
  authDomain: "bienstar-78f8e.firebaseapp.com",
  projectId: "bienstar-78f8e",
  storageBucket: "bienstar-78f8e.appspot.com",
  messagingSenderId: "277000333573",
  appId: "1:277000333573:web:a5410cfd840cd7ffde6f6c",
  measurementId: "G-S4HSY5XDEJ",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

export default app;
