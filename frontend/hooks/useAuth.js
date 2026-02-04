import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const studentSignup = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/auth/student/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Signup failed');
            }
            
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            localStorage.setItem('role', 'student');
            
            setLoading(false);
            return result;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const studentLogin = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/auth/student/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Login failed');
            }
            
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            localStorage.setItem('role', 'student');
            
            setLoading(false);
            return result;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const teacherSignup = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/auth/teacher/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Signup failed');
            }
            
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            localStorage.setItem('role', 'teacher');
            
            setLoading(false);
            return result;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const teacherLogin = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/auth/teacher/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Login failed');
            }
            
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            localStorage.setItem('role', 'teacher');
            
            setLoading(false);
            return result;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
    };

    const getToken = () => {
        return localStorage.getItem('token');
    };

    const getUser = () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    };

    const getRole = () => {
        return localStorage.getItem('role');
    };

    const isAuthenticated = () => {
        return !!localStorage.getItem('token');
    };

    return {
        loading,
        error,
        studentSignup,
        studentLogin,
        teacherSignup,
        teacherLogin,
        logout,
        getToken,
        getUser,
        getRole,
        isAuthenticated
    };
};

