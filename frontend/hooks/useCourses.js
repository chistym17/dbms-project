import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const useCourses = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [courses, setCourses] = useState([]);

    const getToken = () => localStorage.getItem('token');

    const createCourse = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/courses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to create course');
            }
            
            setLoading(false);
            return result;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const getAllCourses = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/courses`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch courses');
            }
            
            setCourses(result.courses);
            setLoading(false);
            return result.courses;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const getTeacherCourses = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/courses/teacher`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch courses');
            }
            
            setCourses(result.courses);
            setLoading(false);
            return result.courses;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const getCourseById = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/courses/${id}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch course');
            }
            
            setLoading(false);
            return result.course;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const updateCourse = async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/courses/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to update course');
            }
            
            setLoading(false);
            return result;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const deleteCourse = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/courses/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to delete course');
            }
            
            setLoading(false);
            return result;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    return {
        loading,
        error,
        courses,
        createCourse,
        getAllCourses,
        getTeacherCourses,
        getCourseById,
        updateCourse,
        deleteCourse
    };
};

