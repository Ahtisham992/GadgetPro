import axios from 'axios';

// Replace this with your local machine's IP address if testing on a physical device
// For Android Emulator, 10.0.2.2 points to the host machine's localhost
// For iOS Simulator, localhost or 127.0.0.1 works.
const BASE_URL = 'http://10.0.2.2:5000/api'; 

const client = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// We can add interceptors here to automatically attach JWT tokens later
// if we use a Bearer token layout
export const setAuthToken = (token) => {
    if (token) {
        client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete client.defaults.headers.common['Authorization'];
    }
};

export default client;
