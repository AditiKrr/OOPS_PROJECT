// Authentication Handler for Homepage
import { signUpUser, signInUser, signOutUser, checkAuth, redirectToDashboard, signInWithGoogle, sendOTP, verifyOTP, signInWithFacebook } from './auth.js';

// Check if user is already logged in
checkAuth().then(user => {
    if (user) {
        // Update navbar to show user info
        updateNavbarForLoggedInUser(user);
    }
});

// OTP Login Toggle
document.getElementById('showOtpLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('emailLoginForm').style.display = 'none';
    document.getElementById('otpLoginForm').style.display = 'block';
});

document.getElementById('showEmailLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('otpLoginForm').style.display = 'none';
    document.getElementById('emailLoginForm').style.display = 'block';
});

// OTP Signup Toggle
document.getElementById('showOtpSignup')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('emailSignupForm').style.display = 'none';
    document.getElementById('otpSignupForm').style.display = 'block';
});

document.getElementById('showEmailSignup')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('otpSignupForm').style.display = 'none';
    document.getElementById('emailSignupForm').style.display = 'block';
});

// Send OTP for Login
document.getElementById('sendOtpLoginBtn')?.addEventListener('click', async () => {
    const phoneNumber = document.getElementById('loginPhone').value;
    const errorDiv = document.getElementById('loginError');
    
    if (!phoneNumber || phoneNumber.length < 10) {
        errorDiv.textContent = 'Please enter a valid phone number with country code (e.g., +911234567890)';
        return;
    }
    
    errorDiv.textContent = '';
    const btn = document.getElementById('sendOtpLoginBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;
    
    const result = await sendOTP(phoneNumber);
    
    if (result.success) {
        document.getElementById('loginPhoneInput').style.display = 'none';
        document.getElementById('loginOtpInput').style.display = 'block';
        showNotification('OTP sent to your phone!', 'success');
    } else {
        errorDiv.textContent = result.error;
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

// Verify OTP for Login
document.getElementById('verifyOtpLoginBtn')?.addEventListener('click', async () => {
    const otp = document.getElementById('loginOtp').value;
    const errorDiv = document.getElementById('loginError');
    
    if (!otp || otp.length !== 6) {
        errorDiv.textContent = 'Please enter the 6-digit OTP';
        return;
    }
    
    errorDiv.textContent = '';
    const btn = document.getElementById('verifyOtpLoginBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    btn.disabled = true;
    
    const result = await verifyOTP(otp);
    
    if (result.success) {
        showNotification('Login successful! Redirecting...', 'success');
        setTimeout(() => {
            redirectToDashboard();
        }, 1000);
    } else {
        errorDiv.textContent = result.error;
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

// Send OTP for Signup
document.getElementById('sendOtpSignupBtn')?.addEventListener('click', async () => {
    const phoneNumber = document.getElementById('signupPhone').value;
    const name = document.getElementById('signupNameOtp').value;
    const userType = document.getElementById('signupUserTypeOtp').value;
    const errorDiv = document.getElementById('signupError');
    
    if (!name) {
        errorDiv.textContent = 'Please enter your name';
        return;
    }
    
    if (!userType) {
        errorDiv.textContent = 'Please select a user type';
        return;
    }
    
    if (!phoneNumber || phoneNumber.length < 10) {
        errorDiv.textContent = 'Please enter a valid phone number with country code (e.g., +911234567890)';
        return;
    }
    
    // Store name and userType temporarily
    sessionStorage.setItem('tempUserName', name);
    sessionStorage.setItem('tempUserType', userType);
    
    errorDiv.textContent = '';
    const btn = document.getElementById('sendOtpSignupBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;
    
    const result = await sendOTP(phoneNumber);
    
    if (result.success) {
        document.getElementById('signupPhoneInput').style.display = 'none';
        document.getElementById('signupOtpInput').style.display = 'block';
        showNotification('OTP sent to your phone!', 'success');
    } else {
        errorDiv.textContent = result.error;
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

// Verify OTP for Signup
document.getElementById('verifyOtpSignupBtn')?.addEventListener('click', async () => {
    const otp = document.getElementById('signupOtp').value;
    const errorDiv = document.getElementById('signupError');
    
    if (!otp || otp.length !== 6) {
        errorDiv.textContent = 'Please enter the 6-digit OTP';
        return;
    }
    
    // Get stored name and userType
    const name = sessionStorage.getItem('tempUserName');
    const userType = sessionStorage.getItem('tempUserType');
    
    errorDiv.textContent = '';
    const btn = document.getElementById('verifyOtpSignupBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    btn.disabled = true;
    
    const result = await verifyOTP(otp, name, userType);
    
    if (result.success) {
        sessionStorage.removeItem('tempUserName');
        sessionStorage.removeItem('tempUserType');
        showNotification('Account created successfully! Redirecting...', 'success');
        setTimeout(() => {
            redirectToDashboard();
        }, 1000);
    } else {
        errorDiv.textContent = result.error;
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

// Open modals
document.getElementById('loginBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    openLoginModal();
});

document.getElementById('signupBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    openSignupModal();
});

// Google Sign-In buttons
document.getElementById('googleLoginBtn')?.addEventListener('click', async () => {
    const btn = document.getElementById('googleLoginBtn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fab fa-google"></i> Signing in...';
    btn.disabled = true;
    
    const result = await signInWithGoogle();
    
    if (result.success) {
        showNotification('Google sign-in successful! Redirecting...', 'success');
        setTimeout(() => {
            redirectToDashboard();
        }, 1000);
    } else {
        document.getElementById('loginError').textContent = result.error;
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
});

document.getElementById('googleSignupBtn')?.addEventListener('click', async () => {
    const userType = document.getElementById('signupUserTypeForGoogle')?.value || 'customer';
    
    if (!userType || userType === '') {
        document.getElementById('signupError').textContent = 'Please select a user type before signing in with Google';
        return;
    }
    
    const btn = document.getElementById('googleSignupBtn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fab fa-google"></i> Signing in...';
    btn.disabled = true;
    
    const result = await signInWithGoogle(userType);
    
    if (result.success) {
        showNotification('Google sign-in successful! Redirecting...', 'success');
        setTimeout(() => {
            redirectToDashboard();
        }, 1000);
    } else {
        document.getElementById('signupError').textContent = result.error;
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
});

// Login form submission
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    // Clear previous errors
    errorDiv.textContent = '';
    
    // Show loading
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    submitBtn.disabled = true;
    
    const result = await signInUser(email, password);
    
    if (result.success) {
        showNotification('Login successful! Redirecting...', 'success');
        setTimeout(() => {
            redirectToDashboard();
        }, 1000);
    } else {
        errorDiv.textContent = result.error;
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Signup form submission
document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const userType = document.getElementById('userType').value;
    const errorDiv = document.getElementById('signupError');
    
    // Clear previous errors
    errorDiv.textContent = '';
    
    // Validation
    if (password.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters long';
        return;
    }
    
    if (!userType) {
        errorDiv.textContent = 'Please select a user type';
        return;
    }
    
    // Show loading
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    submitBtn.disabled = true;
    
    const result = await signUpUser(email, password, name, userType);
    
    if (result.success) {
        showNotification('Account created successfully! Redirecting...', 'success');
        setTimeout(() => {
            redirectToDashboard();
        }, 1000);
    } else {
        let errorMessage = result.error;
        
        if (errorMessage.includes('email-already-in-use')) {
            errorMessage = 'This email is already registered. Please login instead.';
        } else if (errorMessage.includes('weak-password')) {
            errorMessage = 'Password is too weak. Please use a stronger password.';
        } else if (errorMessage.includes('invalid-email')) {
            errorMessage = 'Invalid email address.';
        }
        
        errorDiv.textContent = errorMessage;
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Modal functions
function openLoginModal() {
    document.getElementById('loginModal').classList.add('active');
    document.getElementById('loginEmail').focus();
}

function openSignupModal() {
    document.getElementById('signupModal').classList.add('active');
    document.getElementById('signupName').focus();
}

window.closeAuthModals = function() {
    document.getElementById('loginModal')?.classList.remove('active');
    document.getElementById('signupModal')?.classList.remove('active');
    
    // Clear forms
    document.getElementById('loginForm')?.reset();
    document.getElementById('signupForm')?.reset();
    
    // Clear errors
    document.getElementById('loginError').textContent = '';
    document.getElementById('signupError').textContent = '';
}

window.switchToSignup = function(e) {
    if (e) e.preventDefault();
    closeAuthModals();
    setTimeout(() => openSignupModal(), 300);
}

window.switchToLogin = function(e) {
    if (e) e.preventDefault();
    closeAuthModals();
    setTimeout(() => openLoginModal(), 300);
}

// Require login function for role-based access
window.requireLogin = async function(userType) {
    const user = await checkAuth();
    
    if (user) {
        // User is logged in, set user type and redirect
        localStorage.setItem('userType', userType);
        
        if (userType === 'customer') {
            window.location.href = 'customer-dashboard.html';
        } else if (userType === 'retailer') {
            window.location.href = 'retailer-dashboard.html';
        } else if (userType === 'wholesaler') {
            window.location.href = 'wholesaler-dashboard.html';
        }
    } else {
        // User not logged in, show signup modal with pre-selected type
        openSignupModal();
        document.getElementById('userType').value = userType;
        showNotification('Please create an account or login to continue', 'error');
    }
}

// Update navbar for logged-in user
function updateNavbarForLoggedInUser(user) {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const userName = localStorage.getItem('userName') || 'User';
    
    if (loginBtn && signupBtn) {
        // Replace buttons with user menu
        const userMenu = document.createElement('li');
        userMenu.innerHTML = `
            <div class="user-nav-menu">
                <span style="margin-right: 10px; color: var(--dark-color);">Hi, ${userName}</span>
                <button class="btn-login" onclick="goToDashboard()">Dashboard</button>
                <button class="btn-signup" onclick="handleLogout()">Logout</button>
            </div>
        `;
        
        loginBtn.parentElement.replaceWith(userMenu);
        signupBtn.parentElement.remove();
    }
}

// Go to dashboard
window.goToDashboard = function() {
    redirectToDashboard();
}

// Handle logout
window.handleLogout = async function() {
    if (confirm('Are you sure you want to logout?')) {
        const result = await signOutUser();
        if (result.success) {
            showNotification('Logged out successfully!', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }
}

// Close modals on outside click
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('auth-modal')) {
        closeAuthModals();
    }
});

// Close modals on escape key
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAuthModals();
    }
});

console.log('Auth handler loaded successfully! 🔑');
