



import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewagent-c2483.firebaseapp.com",
  projectId: "interviewagent-c2483",
  storageBucket: "interviewagent-c2483.firebasestorage.app",
  messagingSenderId: "763156845840",
  appId: "1:763156845840:web:de42b48387b5db0c14c195"
};

const app = initializeApp(firebaseConfig);

const auth=getAuth(app)

const provider=new GoogleAuthProvider()

export {auth,provider}