// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAfMucPwlt4AizXe7DGQWMtvPzMBxeYX_Q",
  authDomain: "carwashbookingapp-2020wa15536.firebaseapp.com",
  projectId: "carwashbookingapp-2020wa15536",
  storageBucket: "carwashbookingapp-2020wa15536.firebasestorage.app",
  messagingSenderId: "570399238161",
  appId: "1:570399238161:web:be8871216c5934f35f29b0",
  measurementId: "G-B4BPMGQQ26"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
