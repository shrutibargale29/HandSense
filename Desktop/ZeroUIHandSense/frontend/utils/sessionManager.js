// utils/sessionManager.js
// Purpose: Manages user session, stores tokens, exam state
// Matches backend JWT authentication

const SessionManager = {
    // Keys for localStorage
    TOKEN_KEY: 'handsense_token',
    USER_KEY: 'handsense_user',
    EXAM_KEY: 'handsense_exam',
    
    // Save token after login
    setToken(token) {
        localStorage.setItem(this.TOKEN_KEY, token);
    },
    
    // Get stored token
    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    },
    
    // Clear token on logout
    clearToken() {
        localStorage.removeItem(this.TOKEN_KEY);
    },
    
    // Save user info
    setUser(user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    },
    
    // Get user info
    getUser() {
        const user = localStorage.getItem(this.USER_KEY);
        return user ? JSON.parse(user) : null;
    },
    
    // Clear user info
    clearUser() {
        localStorage.removeItem(this.USER_KEY);
    },
    
    // Save exam session
    setExamSession(session) {
        localStorage.setItem(this.EXAM_KEY, JSON.stringify(session));
    },
    
    // Get exam session
    getExamSession() {
        const session = localStorage.getItem(this.EXAM_KEY);
        return session ? JSON.parse(session) : null;
    },
    
    // Clear exam session
    clearExamSession() {
        localStorage.removeItem(this.EXAM_KEY);
    },
    
    // Check if user is logged in
    isLoggedIn() {
        return !!this.getToken();
    },
    
    // Complete logout
    logout() {
        this.clearToken();
        this.clearUser();
        this.clearExamSession();
    },
    
    // Get auth header for API requests
    getAuthHeader() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
};

// Make available globally
window.SessionManager = SessionManager;