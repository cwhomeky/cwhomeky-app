// Import Firebase Modular SDK modules from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "cwhomeky",
  authDomain: "cwhomeky-app.firebaseapp.com",
  projectId: "cwhomeky-app",
  storageBucket: "cwhomeky-app.firebasestorage.app",
  messagingSenderId: "506550724651",
  appId: "1:506550724651:web:a1e4b7d20ad038bb3f226e"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Current active user state
let currentUser = null;

// Auth State Observer
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  const userStatusEl = document.getElementById("user-status");

  if (user) {
    const displayName = user.displayName || user.email.split('@')[0];
    userStatusEl.innerHTML = `
      <span class="user-greeting">Hi, ${displayName}</span>
      <button id="logout-btn" class="btn-sm btn-outline">Sign Out</button>
    `;
    document.getElementById("logout-btn").addEventListener("click", () => signOut(auth));
    
    // Unlock gated indicators
    document.querySelectorAll(".lock-badge").forEach(el => el.style.display = "none");
    closeAuthModal();
  } else {
    userStatusEl.innerHTML = `<button id="auth-btn" class="btn-sm btn-outline">Sign In</button>`;
    document.getElementById("auth-btn").addEventListener("click", openAuthModal);
    document.querySelectorAll(".lock-badge").forEach(el => el.style.display = "inline-block");
  }
});

// Save / Update Lead in Firestore
async function recordLeadData(user, extraData = {}) {
  if (!user) return;
  const leadRef = doc(db, "leads", user.uid);
  await setDoc(leadRef, {
    uid: user.uid,
    email: user.email,
    displayName: extraData.name || user.displayName || "",
    pcsTimeline: extraData.timeline || "",
    lastActive: serverTimestamp(),
    createdAt: serverTimestamp()
  }, { merge: true });
}

// Log Document Downloads
export async function logDocDownload(docName) {
  if (!currentUser) {
    openAuthModal();
    return false;
  }
  try {
    const downloadRef = doc(db, `leads/${currentUser.uid}/downloads`, `${docName}_${Date.now()}`);
    await setDoc(downloadRef, {
      documentName: docName,
      downloadedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error logging download:", error);
    return true; // Still allow download even if log fails
  }
}

// Handle Email Registration / Login
export async function handleEmailAuth(email, password, name, timeline, isSignUp = true) {
  try {
    let userCredential;
    if (isSignUp) {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await recordLeadData(userCredential.user, { name, timeline });
    } else {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    }
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Handle Google Sign-In
export async function handleGoogleAuth() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await recordLeadData(result.user);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Check if User is Logged In
export function isUserAuthenticated() {
  return !!currentUser;
}
