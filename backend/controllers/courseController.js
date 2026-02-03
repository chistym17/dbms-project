const pool = require('../config/db');

const createCourse = async (req, res) => {
    try {
        const { course_name, course_code, semester, batch, academic_session } = req.body;
        const teacher_id = req.user.id;

        const existingCourse = await pool.query(
            'SELECT * FROM courses WHERE course_code = $1',
            [course_code]
        );

        if (existingCourse.rows.length > 0) {
            return res.status(400).json({ message: 'Course code already exists' });
        }

        const result = await pool.query(
            'INSERT INTO courses (course_name, course_code, teacher_id, semester, batch, academic_session) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [course_name, course_code, teacher_id, semester, batch, academic_session]
        );

        res.status(201).json({
            message: 'Course created successfully',
            course: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getAllCourses = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT c.*, t.name as teacher_name, t.department FROM courses c JOIN teachers t ON c.teacher_id = t.id ORDER BY c.created_at DESC'
        );

        res.json({
            courses: result.rows
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getTeacherCourses = async (req, res) => {
    try {
        const teacher_id = req.user.id;

        const result = await pool.query(
            'SELECT * FROM courses WHERE teacher_id = $1 ORDER BY created_at DESC',
            [teacher_id]
        );

        res.json({
            courses: result.rows
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT c.*, t.name as teacher_name, t.department FROM courses c JOIN teachers t ON c.teacher_id = t.id WHERE c.id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json({
            course: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher_id = req.user.id;
        const { course_name, course_code, semester, batch, academic_session } = req.body;

        const course = await pool.query(
            'SELECT * FROM courses WHERE id = $1',
            [id]
        );

        if (course.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.rows[0].teacher_id !== teacher_id) {
            return res.status(403).json({ message: 'Not authorized to update this course' });
        }

        const result = await pool.query(
            'UPDATE courses SET course_name = $1, course_code = $2, semester = $3, batch = $4, academic_session = $5 WHERE id = $6 RETURNING *',
            [course_name, course_code, semester, batch, academic_session, id]
        );

        res.json({
            message: 'Course updated successfully',
            course: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher_id = req.user.id;

        const course = await pool.query(
            'SELECT * FROM courses WHERE id = $1',
            [id]
        );

        if (course.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.rows[0].teacher_id !== teacher_id) {
            return res.status(403).json({ message: 'Not authorized to delete this course' });
        }

        await pool.query('DELETE FROM courses WHERE id = $1', [id]);

        res.json({
            message: 'Course deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createCourse,
    getAllCourses,
    getTeacherCourses,
    getCourseById,
    updateCourse,
    deleteCourse
};

