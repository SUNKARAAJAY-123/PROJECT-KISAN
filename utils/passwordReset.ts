import { getAuth, sendPasswordResetEmail, confirmPasswordReset } from 'firebase/auth';
import { app } from '../src/firebaseConfig';

export const sendResetEmail = async (email: string) => {
  const auth = getAuth(app);
  await sendPasswordResetEmail(auth, email);
};

export const confirmResetPassword = async (oobCode: string, newPassword: string) => {
  const auth = getAuth(app);
  await confirmPasswordReset(auth, oobCode, newPassword);
};
