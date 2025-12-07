import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 安全地取得環境變數的輔助函式
const getEnv = (key: string, fallback: string): string => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    // 忽略錯誤
  }
  return fallback;
};

// 使用 getEnv 確保優先讀取環境變數，失敗則使用 fallback
const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY", "AIzaSyB4Nzez2FaiNhFcJco4x7DaETf_W41Maf0"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN", "ignobel-vote.firebaseapp.com"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID", "ignobel-vote"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET", "ignobel-vote.firebasestorage.app"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "364006634772"),
  appId: getEnv("VITE_FIREBASE_APP_ID", "1:364006634772:web:cb24fd710057583c53be01")
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);