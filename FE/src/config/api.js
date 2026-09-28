// API Configuration
// const API_BASE_URL = process.env.NODE_ENV === 'production' 
//     ? 'http://your-production-server.com' 
//     : 'http://localhost:3000';
const API_BASE_URL = 'http://localhost:3000'
///const API_BASE_URL = 'http://10.209.0.250:3000'
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/api/auth/login`,
    },
    USERS: {
        LIST: `${API_BASE_URL}/api/users`,
        CREATE: `${API_BASE_URL}/api/users/create`,
        UPDATE: (id) => `${API_BASE_URL}/api/users/${id}`,
        TOGGLE_STATUS: (id) => `${API_BASE_URL}/api/users/${id}/status`,
        DELETE: (id) => `${API_BASE_URL}/api/users/${id}`,
        CHANGEPASSWORD: (id) => `${API_BASE_URL}/api/users/${id}/change-password`
    },
    CONVERSATIONS: {
        LIST: `${API_BASE_URL}/api/conver`,
        CREATE: `${API_BASE_URL}/api/conver/create`,
        MESSAGES: (conversationId) => `${API_BASE_URL}/api/conver/${conversationId}`,
        CREATE_MESSAGES: `${API_BASE_URL}/api/conver/create_message`,
        UPDATE: (conversationId) => `${API_BASE_URL}/api/conver/${conversationId}`,
        DELETE: (conversationId) => `${API_BASE_URL}/api/conver/${conversationId}`,
    },
    GEMINI: {
        GENERATE: `${API_BASE_URL}/api/chatbot/generate`,
    },
    DOCUMENT:{
        LIST: `${API_BASE_URL}/api/document`,
        IMPORT: `${API_BASE_URL}/api/document/import-docx`,
        GETALLTEXTS: `${API_BASE_URL}/api/document/getAllTexts`,
        DELETE: (documentId) => `${API_BASE_URL}/api/document/${documentId}`,
    },
    EVALUATION: {
        LIST: `${API_BASE_URL}/api/evaluation`,
        CREATE: `${API_BASE_URL}/api/evaluation/create`,
        DETAIL: (id) => `${API_BASE_URL}/api/evaluation/${id}`,
        UPDATE: (id) => `${API_BASE_URL}/api/evaluation/${id}`,
        TOGGLE_STATUS: (id) => `${API_BASE_URL}/api/evaluation/${id}/status`,
        DELETE: (id) => `${API_BASE_URL}/api/evaluation/${id}`,
    }
};

export default API_BASE_URL;
