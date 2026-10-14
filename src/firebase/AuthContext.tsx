import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './config';
import { handleFirestoreError, OperationType } from './error';
import { UserRole, UserType } from '../types/student';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  userType: UserType;
  department: string;
  activeStudentId: string | null;
  setRole: (role: UserRole) => void;
  loading: boolean;
  isAuthenticated: boolean;
  isGuestSession: boolean;
  guestUserName: string;
  loginAsGuest: (name?: string, selectedRole?: UserRole, type?: UserType, studentId?: string, department?: string) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'Faculty Advisor',
  userType: 'staff',
  department: 'ECE / Core Engineering',
  activeStudentId: null,
  setRole: () => {},
  loading: true,
  isAuthenticated: false,
  isGuestSession: false,
  guestUserName: 'Faculty Advisor',
  loginAsGuest: () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('edunexus_user_role') as UserRole) || 'Faculty Advisor';
  });
  const [department, setDepartmentState] = useState<string>(() => {
    return localStorage.getItem('edunexus_user_department') || 'ECE / Core Engineering';
  });
  const [userType, setUserTypeState] = useState<UserType>(() => {
    return (localStorage.getItem('edunexus_user_type') as UserType) || 'staff';
  });
  const [activeStudentId, setActiveStudentIdState] = useState<string | null>(() => {
    return localStorage.getItem('edunexus_active_student_id') || null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isGuestSession, setIsGuestSession] = useState<boolean>(() => {
    return localStorage.getItem('edunexus_guest_session') === 'true';
  });
  const [guestUserName, setGuestUserName] = useState<string>(() => {
    return localStorage.getItem('edunexus_guest_username') || 'Faculty Advisor';
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsGuestSession(false);
        localStorage.removeItem('edunexus_guest_session');
        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data?.role) {
              setRoleState(data.role as UserRole);
            }
          } else {
            // Initialize user doc
            await setDoc(userDocRef, {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Faculty User',
              photoURL: currentUser.photoURL || '',
              role: 'Faculty Advisor',
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.warn('Could not read/write user profile on auth change:', error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginAsGuest = (
    name: string = 'Dr. Ramesh Sundaram',
    selectedRole: UserRole = 'Faculty Advisor',
    type: UserType = 'staff',
    studentId?: string,
    dept?: string
  ) => {
    setIsGuestSession(true);
    setGuestUserName(name);
    setRoleState(selectedRole);
    setUserTypeState(type);
    const assignedDept = dept || (type === 'student' ? 'Computer Science (CSE)' : 'ECE / Core Engineering');
    setDepartmentState(assignedDept);
    localStorage.setItem('edunexus_user_department', assignedDept);
    localStorage.setItem('edunexus_user_role', selectedRole);
    if (studentId) {
      setActiveStudentIdState(studentId);
      localStorage.setItem('edunexus_active_student_id', studentId);
    } else {
      setActiveStudentIdState(null);
      localStorage.removeItem('edunexus_active_student_id');
    }
    localStorage.setItem('edunexus_guest_session', 'true');
    localStorage.setItem('edunexus_guest_username', name);
    localStorage.setItem('edunexus_user_type', type);
    // After logon, set default white/light theme
    localStorage.setItem('edunexus_theme', 'light');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  };

  const setRole = async (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('edunexus_user_role', newRole);
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      try {
        await setDoc(userDocRef, { role: newRole, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsGuestSession(false);
      setUserTypeState('staff');
      setActiveStudentIdState(null);
      localStorage.removeItem('edunexus_guest_session');
      localStorage.setItem('edunexus_user_type', 'staff');
      localStorage.removeItem('edunexus_active_student_id');
      // After logon, set default white/light theme
      localStorage.setItem('edunexus_theme', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } catch (error) {
      console.error('Google Sign In failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setIsGuestSession(false);
      localStorage.removeItem('edunexus_guest_session');
      localStorage.removeItem('edunexus_guest_username');
      localStorage.removeItem('edunexus_user_type');
      localStorage.removeItem('edunexus_user_role');
      localStorage.removeItem('edunexus_user_department');
      localStorage.removeItem('edunexus_active_student_id');
      setUserTypeState('staff');
      setActiveStudentIdState(null);
      // On logout, set default dark theme for login page
      localStorage.setItem('edunexus_theme', 'dark');
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      if (user) {
        await fbSignOut(auth);
      }
    } catch (error) {
      console.error('Sign Out failed:', error);
      throw error;
    }
  };

  const isAuthenticated = !!user || isGuestSession;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        userType,
        department,
        activeStudentId,
        setRole,
        loading,
        isAuthenticated,
        isGuestSession,
        guestUserName,
        loginAsGuest,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
