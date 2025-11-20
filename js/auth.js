// Authentication Module
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, FacebookAuthProvider } from './firebase-config.js';

// Initialize reCAPTCHA for phone auth
export function initRecaptcha(elementId) {
    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
            'size': 'invisible',
            'callback': (response) => {
                console.log('reCAPTCHA verified');
            },
            'expired-callback': () => {
                console.log('reCAPTCHA expired');
            }
        });
    }
    return window.recaptchaVerifier;
}

// Send OTP to phone number
export async function sendOTP(phoneNumber) {
    try {
        const appVerifier = initRecaptcha('recaptcha-container');
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        window.confirmationResult = confirmationResult;
        console.log('OTP sent successfully');
        return { success: true, confirmationResult };
    } catch (error) {
        console.error('Error sending OTP:', error);
        return { success: false, error: error.message };
    }
}

// Verify OTP and sign in
export async function verifyOTP(otp, userName = '', userType = 'customer') {
    try {
        const result = await window.confirmationResult.confirm(otp);
        const user = result.user;
        
        // Store user info
        localStorage.setItem('userName', userName || user.phoneNumber);
        localStorage.setItem('userType', userType);
        
        console.log('Phone sign-in successful:', user.phoneNumber);
        return { success: true, user };
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return { success: false, error: error.message };
    }
}

// Check authentication state
export function checkAuth() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            resolve(user);
        });
    });
}

// Get current user
export function getCurrentUser() {
    return auth.currentUser;
}

// Sign up new user
export async function signUpUser(email, password, name, userType) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Store user type in localStorage (in production, use Firestore)
        localStorage.setItem('userType', userType);
        localStorage.setItem('userName', name);
        
        return { success: true, user };
    } catch (error) {
        console.error('Signup error:', error);
        return { success: false, error: error.message };
    }
}

// Sign in with Google
export async function signInWithGoogle(userType = 'customer') {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Store user info
        localStorage.setItem('userName', user.displayName || user.email);
        localStorage.setItem('userType', userType);
        
        console.log('Google sign-in successful:', user.email);
        return { success: true, user };
    } catch (error) {
        console.error('Google sign-in error:', error);
        return { success: false, error: error.message };
    }
}

// Sign in with Facebook
export async function signInWithFacebook(userType = 'customer') {
    try {
        const provider = new FacebookAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Store user info
        localStorage.setItem('userName', user.displayName || user.email);
        localStorage.setItem('userType', userType);
        
        console.log('Facebook sign-in successful:', user.email);
        return { success: true, user };
    } catch (error) {
        console.error('Facebook sign-in error:', error);
        return { success: false, error: error.message };
    }
}

// Sign in existing user
export async function signInUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        return { success: true, user };
    } catch (error) {
        console.error('Login error:', error);
        let message = 'Login failed. Please try again.';
        
        if (error.code === 'auth/wrong-password') {
            message = 'Incorrect password. Please try again.';
        } else if (error.code === 'auth/user-not-found') {
            message = 'No account found with this email.';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Invalid email address.';
        } else if (error.code === 'auth/invalid-credential') {
            message = 'Invalid email or password.';
        }
        
        return { success: false, error: message };
    }
}

// Sign out user
export async function signOutUser() {
    try {
        await signOut(auth);
        localStorage.removeItem('userType');
        localStorage.removeItem('userName');
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
    }
}

// Redirect to appropriate dashboard based on user type
export function redirectToDashboard() {
    const userType = localStorage.getItem('userType');
    
    if (userType === 'customer') {
        window.location.href = 'customer-dashboard.html';
    } else if (userType === 'retailer') {
        window.location.href = 'retailer-dashboard.html';
    } else if (userType === 'wholesaler') {
        window.location.href = 'wholesaler-dashboard.html';
    } else {
        // Default to customer if no type set
        window.location.href = 'customer-dashboard.html';
    }
}

// Protect dashboard pages - redirect to home if not authenticated
export async function protectPage() {
    const user = await checkAuth();
    
    if (!user) {
        alert('Please login to access this page');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

console.log('Auth module loaded successfully! 🔐');
