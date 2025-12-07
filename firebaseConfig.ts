
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 安全地取得環境變數的輔助函式
// 避免在不支援 import.meta.env 的環境中發生 Crash
const getEnv = (key: string, fallback: string): string => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    // 忽略錯誤，直接回傳 fallback
  }
  return fallback;
};

// 優先使用環境變數 (VITE_...), 若無則使用後方的預設字串
const firebaseConfig = {
  apiKey: "AIzaSyB4Nzez2FaiNhFcJco4x7DaETf_W41Maf0",
  authDomain: "ignobel-vote.firebaseapp.com",
  projectId: "ignobel-vote",
  storageBucket: "ignobel-vote.firebasestorage.app",
  messagingSenderId: "364006634772",
  appId: "1:364006634772:web:cb24fd710057583c53be01"
};

// 簡單檢查設定是否已填寫
const isConfigured = firebaseConfig.projectId !== "YOUR_PROJECT_ID";

if (!isConfigured) {
  console.warn("Firebase 尚未設定。請更新 firebaseConfig.ts 或設定環境變數。");
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
