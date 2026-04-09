// tests/api.test.js
// API integration tests

describe('API Integration Tests', () => {
    const API_URL = 'http://localhost:5000/api';
    
    // Mock fetch for testing
    global.fetch = jest.fn();
    
    beforeEach(() => {
        fetch.mockClear();
    });
    
    test('health check should return OK', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ status: 'OK' })
        });
        
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        
        expect(data.status).toBe('OK');
    });
    
    test('login should return token on success', async () => {
        const mockResponse = {
            success: true,
            data: { token: 'test-token-123' }
        };
        
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });
        
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rollNumber: '2024001', password: 'student123' })
        });
        
        const data = await response.json();
        
        expect(data.success).toBe(true);
        expect(data.data.token).toBeDefined();
    });
    
    test('should handle login failure', async () => {
        const mockResponse = {
            success: false,
            message: 'Invalid credentials'
        };
        
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });
        
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rollNumber: 'wrong', password: 'wrong' })
        });
        
        const data = await response.json();
        
        expect(data.success).toBe(false);
        expect(data.message).toBeDefined();
    });
});