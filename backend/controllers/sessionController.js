const pool = require('../config/db');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const createSession = async (req, res) => {
    try {
        const { course_id, session_date, session_time, duration_minutes } = req.body;
        const teacher_id = req.user.id;

        const course = await pool.query(
            'SELECT * FROM courses WHERE id = $1',
            [course_id]
        );

        if (course.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.rows[0].teacher_id !== teacher_id) {
            return res.status(403).json({ message: 'Not authorized to create session for this course' });
        }

        const qrToken = `session_${course_id}_${uuidv4()}`;

        const qrCodeDataURL = await QRCode.toDataURL(qrToken);

        const result = await pool.query(
            'INSERT INTO sessions (course_id, session_date, session_time, duration_minutes, qr_code) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [course_id, session_date, session_time, duration_minutes || null, qrToken]
        );

        const session = result.rows[0];

        res.status(201).json({
            message: 'Session created successfully',
            session: {
                ...session,
                qr_code_image: qrCodeDataURL
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getCourseSessions = async (req, res) => {
    try {
        const { courseId } = req.params;

        const result = await pool.query(
            'SELECT * FROM sessions WHERE course_id = $1 ORDER BY session_date DESC, session_time DESC',
            [courseId]
        );

        res.json({
            sessions: result.rows
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getSessionById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT s.*, c.course_name, c.course_code FROM sessions s JOIN courses c ON s.course_id = c.id WHERE s.id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const session = result.rows[0];
        const qrCodeDataURL = await QRCode.toDataURL(session.qr_code);

        res.json({
            session: {
                ...session,
                qr_code_image: qrCodeDataURL
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateSession = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher_id = req.user.id;
        const { session_date, session_time, duration_minutes } = req.body;

        const session = await pool.query(
            'SELECT s.*, c.teacher_id FROM sessions s JOIN courses c ON s.course_id = c.id WHERE s.id = $1',
            [id]
        );

        if (session.rows.length === 0) {
            return res.status(404).json({ message: 'Session not found' });
        }

        if (session.rows[0].teacher_id !== teacher_id) {
            return res.status(403).json({ message: 'Not authorized to update this session' });
        }

        const result = await pool.query(
            'UPDATE sessions SET session_date = $1, session_time = $2, duration_minutes = $3 WHERE id = $4 RETURNING *',
            [session_date, session_time, duration_minutes || null, id]
        );

        res.json({
            message: 'Session updated successfully',
            session: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteSession = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher_id = req.user.id;

        const session = await pool.query(
            'SELECT s.*, c.teacher_id FROM sessions s JOIN courses c ON s.course_id = c.id WHERE s.id = $1',
            [id]
        );

        if (session.rows.length === 0) {
            return res.status(404).json({ message: 'Session not found' });
        }

        if (session.rows[0].teacher_id !== teacher_id) {
            return res.status(403).json({ message: 'Not authorized to delete this session' });
        }

        await pool.query('DELETE FROM sessions WHERE id = $1', [id]);

        res.json({
            message: 'Session deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createSession,
    getCourseSessions,
    getSessionById,
    updateSession,
    deleteSession
};

