// firebaseConfig.js
import firebase from "@react-native-firebase/app";
import auth from "@react-native-firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDTtBeHjw6IPcDX85kGjMYvTs0tQ4lxbzc",
  authDomain: "bienstar-78f8e.firebaseapp.com",
  projectId: "bienstar-78f8e",
  storageBucket: "bienstar-78f8e.appspot.com",
  messagingSenderId: "277000333573",
  appId: "1:277000333573:web:a5410cfd840cd7ffde6f6c",
  measurementId: "G-S4HSY5XDEJ",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase, auth };
