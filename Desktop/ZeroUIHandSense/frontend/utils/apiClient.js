// utils/apiClient.js
// Purpose: Handles all API calls to backend
// Matches backend routes: /api/auth/*, /api/exam/*, /api/papers/*

const API_BASE_URL = 'http://localhost:5000/api';

const APIClient = {
    // Generic request handler
    async request(endpoint, method = 'GET', data = null, requiresAuth = true) {
        const url = `${API_BASE_URL}${endpoint}`;
        
        const headers = {
            'Content-Type': 'application/json',
        };
        
        // Add auth token if required
        if (requiresAuth && SessionManager.isLoggedIn()) {
            headers['Authorization'] = `Bearer ${SessionManager.getToken()}`;
        }
        
        const config = {
            method,
            headers,
        };
        
        if (data && (method === 'POST' || method === 'PUT')) {
            config.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(url, config);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Request failed');
            }
            
            return { success: true, data: result };
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            return { success: false, error: error.message };
        }
    },
    
    // ========== AUTHENTICATION APIs ==========
    
    // Student login
    async login(rollNumber, password) {
        const result = await this.request('/auth/login', 'POST', { rollNumber, password }, false);
        if (result.success && result.data.token) {
            SessionManager.setToken(result.data.token);
            SessionManager.setUser(result.data.user);
        }
        return result;
    },
    
    // Student logout
    async logout() {
        const result = await this.request('/auth/logout', 'POST', {}, true);
        SessionManager.logout();
        return result;
    },
    
    // ========== QUESTION PAPER APIs ==========
    
    // Get all available papers
    async getAvailablePapers() {
        return await this.request('/papers/available', 'GET', null, true);
    },
    
    // Get specific paper details
    async getPaper(paperId) {
        return await this.request(`/papers/${paperId}`, 'GET', null, true);
    },
    
    // Select a paper for exam
    async selectPaper(paperId) {
        return await this.request('/exam/select-paper', 'POST', { paperId }, true);
    },
    
    // ========== EXAM APIs ==========
    
    // Start the exam
    async startExam() {
        return await this.request('/exam/start', 'POST', null, true);
    },
    
    // Get current question (for REPEAT command)
    async getCurrentQuestion() {
        return await this.request('/exam/current-question', 'GET', null, true);
    },
    
    // Save answer for current question
    async saveAnswer(answer) {
        return await this.request('/exam/save-answer', 'POST', { answer }, true);
    },
    
    // Move to next question
    async nextQuestion() {
        return await this.request('/exam/next', 'POST', null, true);
    },
    
    // Submit the exam
    async submitExam() {
        return await this.request('/exam/submit', 'POST', null, true);
    },
    
    // End exam session (over exam)
    async overExam() {
        return await this.request('/exam/over', 'POST', null, true);
    },
    
    // Exit system
    async exitSystem() {
        return await this.request('/exam/exit', 'POST', null, true);
    }
};

// Make available globally
window.APIClient = APIClient;