import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Group, VoteRecord } from '../types';
import { db } from '../firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  onSnapshot,
  writeBatch
} from 'firebase/firestore';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  groups: Group[];
  votes: VoteRecord[];
  login: (id: string, email: string) => Promise<boolean>;
  logout: () => void;
  submitVote: (allocations: {groupId: string, count: number}[]) => void;
  addUser: (user: User) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
  addGroup: (group: Group) => Promise<void>;
  updateGroup: (group: Group) => Promise<void>;
  removeGroup: (groupId: string) => Promise<void>;
  resetVotes: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [votes, setVotes] = useState<VoteRecord[]>([]);

  // 1. 監聽 Users 集合
  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const usersData: User[] = [];
        querySnapshot.forEach((doc) => {
          usersData.push({ ...doc.data() as User, docId: doc.id });
        });
        setUsers(usersData);
        
        // 如果當前有登入者，即時更新其狀態 (例如已投票)
        if (currentUser) {
          const updatedUser = usersData.find(u => u.id === currentUser.id);
          if (updatedUser) {
            setCurrentUser(prev => ({ ...updatedUser }));
          }
        }
      },
      (error) => {
        console.error("Users snapshot error:", error);
        // 通常這是因為權限不足或 projectId 設定錯誤
      }
    );
    return () => unsubscribe();
  }, [currentUser?.id]); // Dependency includes currentUser.id to refresh if user changes role or status

  // 2. 監聽 Groups 集合
  useEffect(() => {
    const q = query(collection(db, "groups"));
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const groupsData: Group[] = [];
        querySnapshot.forEach((doc) => {
          groupsData.push({ ...doc.data() as Group, docId: doc.id });
        });
        setGroups(groupsData);
      },
      (error) => {
        console.error("Groups snapshot error:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  // 3. 監聽 Votes 集合
  useEffect(() => {
    const q = query(collection(db, "votes"));
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const votesData: VoteRecord[] = [];
        querySnapshot.forEach((doc) => {
          votesData.push({ ...doc.data() as VoteRecord, docId: doc.id });
        });
        setVotes(votesData);
      },
      (error) => {
        console.error("Votes snapshot error:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  // Login: 查詢 Firestore
  const login = async (id: string, email: string) => {
    try {
      // 這裡直接查詢前端已經同步下來的 users state 也可以，
      // 但為了安全性與確保資料最新，我們查詢 Firestore 一次。
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("id", "==", id), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = { ...userDoc.data() as User, docId: userDoc.id };
        setCurrentUser(userData);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Login error:", e);
      alert("登入失敗：無法連接資料庫。請確認 Firebase 設定是否正確。");
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const submitVote = async (allocations: {groupId: string, count: number}[]) => {
    if (!currentUser || !currentUser.docId) return;
    
    const newVote: VoteRecord = {
      userId: currentUser.id,
      allocations,
      timestamp: Date.now()
    };

    try {
      // 1. 新增投票紀錄
      await addDoc(collection(db, "votes"), newVote);
      
      // 2. 更新使用者狀態為已投票
      const userRef = doc(db, "users", currentUser.docId);
      await updateDoc(userRef, { hasVoted: true });
      
    } catch (e) {
      console.error("Error submitting vote:", e);
      alert("投票送出失敗，請檢查網路連線");
    }
  };

  // Admin: Add User
  const addUser = async (user: User) => {
    try {
      // 檢查是否 ID 已存在
      const existing = users.find(u => u.id === user.id);
      if (existing) {
        alert("此學號/ID 已存在");
        return;
      }
      await addDoc(collection(db, "users"), user);
    } catch (e) {
      console.error("Error adding user:", e);
      alert("新增人員失敗，請確認資料庫權限");
    }
  };

  // Admin: Update User
  const updateUser = async (user: User) => {
    // 需要找到對應的 Firestore docId
    const target = users.find(u => u.id === user.id);
    if (!target || !target.docId) return;

    try {
      const userRef = doc(db, "users", target.docId);
      // 解構移除 docId 避免寫入資料庫
      const { docId, ...dataToUpdate } = user;
      await updateDoc(userRef, dataToUpdate);
    } catch (e) {
      console.error("Error updating user:", e);
      alert("更新人員失敗");
    }
  };

  // Admin: Remove User
  const removeUser = async (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target || !target.docId) return;
    
    try {
      await deleteDoc(doc(db, "users", target.docId));
    } catch (e) {
      console.error("Error removing user:", e);
      alert("刪除人員失敗");
    }
  };

  // Admin: Add Group
  const addGroup = async (group: Group) => {
    try {
      await addDoc(collection(db, "groups"), group);
    } catch (e) {
      console.error("Error adding group:", e);
      alert("新增組別失敗");
    }
  };

  // Admin: Update Group
  const updateGroup = async (group: Group) => {
    const target = groups.find(g => g.id === group.id);
    if (!target || !target.docId) return;

    try {
      const groupRef = doc(db, "groups", target.docId);
      const { docId, ...dataToUpdate } = group;
      await updateDoc(groupRef, dataToUpdate);
    } catch (e) {
      console.error("Error updating group:", e);
      alert("更新組別失敗");
    }
  };

  // Admin: Remove Group
  const removeGroup = async (groupId: string) => {
    const target = groups.find(g => g.id === groupId);
    if (!target || !target.docId) return;

    try {
      await deleteDoc(doc(db, "groups", target.docId));
    } catch (e) {
      console.error("Error removing group:", e);
      alert("刪除組別失敗");
    }
  };

  // Admin: Reset Votes
  const resetVotes = async () => {
    try {
      const batch = writeBatch(db);

      // 1. 刪除所有 votes
      votes.forEach(v => {
        if (v.docId) {
          batch.delete(doc(db, "votes", v.docId));
        }
      });

      // 2. 將所有 users 的 hasVoted 設為 false
      users.forEach(u => {
        if (u.docId) {
          batch.update(doc(db, "users", u.docId), { hasVoted: false });
        }
      });

      await batch.commit();
      alert("重置成功");
    } catch (e) {
      console.error("Error resetting votes:", e);
      alert("重置失敗");
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      groups,
      votes,
      login,
      logout,
      submitVote,
      addUser,
      updateUser,
      removeUser,
      addGroup,
      updateGroup,
      removeGroup,
      resetVotes
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};