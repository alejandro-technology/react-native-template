import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from '@react-native-firebase/auth';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

class FirebaseAuthenticationService {
  private auth = getAuth();

  signup(
    email: string,
    password: string,
  ): Promise<FirebaseAuthTypes.UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  signin(
    email: string,
    password: string,
  ): Promise<FirebaseAuthTypes.UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  signout(): Promise<void> {
    return signOut(this.auth);
  }

  getCurrentUser(): FirebaseAuthTypes.User | null {
    return this.auth.currentUser;
  }

  onAuthStateChanged(
    callback: (user: FirebaseAuthTypes.User | null) => void,
  ): () => void {
    return onAuthStateChanged(this.auth, callback);
  }

  sendEmailVerification(user: FirebaseAuthTypes.User): Promise<void> {
    return sendEmailVerification(user);
  }

  sendPasswordResetEmail(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }

  updateProfile(
    user: FirebaseAuthTypes.User,
    data: { displayName?: string | null; photoURL?: string | null },
  ): Promise<void> {
    return updateProfile(user, data);
  }

  reload(user: FirebaseAuthTypes.User): Promise<void> {
    return reload(user);
  }

  deleteAccount(user: FirebaseAuthTypes.User): Promise<void> {
    return deleteUser(user);
  }
}

function createFirebaseAuthenticationService(): FirebaseAuthenticationService {
  return new FirebaseAuthenticationService();
}

export default createFirebaseAuthenticationService();
