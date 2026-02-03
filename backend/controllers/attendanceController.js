const pool = require('../config/db');

const markAttendance = async (req, res) => {
    try {
        const { qr_token } = req.body;
        const student_id = req.user.id;

        const sessionResult = await pool.query(
            'SELECT * FROM sessions WHERE qr_code = $1',
            [qr_token]
        );

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ message: 'Invalid QR code' });
        }

        const session = sessionResult.rows[0];

        const currentDate = new Date();
        const sessionDate = new Date(session.session_date);

        const currentDateStr = currentDate.toISOString().split('T')[0];
        const sessionDateStr = sessionDate.toISOString().split('T')[0];

        if (session.duration_minutes) {
            const sessionDateTime = new Date(`${sessionDateStr} ${session.session_time}`);
            const expiryTime = new Date(sessionDateTime.getTime() + session.duration_minutes * 60000);

            if (currentDate > expiryTime) {
                return res.status(400).json({
                    message: 'QR code has expired',
                    expired_at: expiryTime
                });
            }

            if (currentDate < sessionDateTime) {
                return res.status(400).json({
                    message: 'Session has not started yet',
                    starts_at: sessionDateTime
                });
            }
        } else {
            if (currentDateStr !== sessionDateStr) {
                return res.status(400).json({
                    message: 'QR code is only valid on session date',
                    session_date: sessionDateStr
                });
            }
        }

        const existingAttendance = await pool.query(
            'SELECT * FROM attendance WHERE session_id = $1 AND student_id = $2',
            [session.id, student_id]
        );

        if (existingAttendance.rows.length > 0) {
            return res.status(400).json({
                message: 'Attendance already marked for this session',
                attendance: existingAttendance.rows[0]
            });
        }

        const result = await pool.query(
            'INSERT INTO attendance (session_id, student_id, status) VALUES ($1, $2, $3) RETURNING *',
            [session.id, student_id, 'present']
        );

        const courseInfo = await pool.query(
            'SELECT c.course_name, c.course_code FROM courses c WHERE c.id = $1',
            [session.course_id]
        );

        res.status(201).json({
            message: 'Attendance marked successfully',
            attendance: result.rows[0],
            session: {
                id: session.id,
                date: session.session_date,
                time: session.session_time
            },
            course: courseInfo.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getSessionAttendance = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const teacher_id = req.user.id;

        const session = await pool.query(
            'SELECT s.*, c.teacher_id, c.course_name, c.course_code FROM sessions s JOIN courses c ON s.course_id = c.id WHERE s.id = $1',
            [sessionId]
        );

        if (session.rows.length === 0) {
            return res.status(404).json({ message: 'Session not found' });
        }

        if (session.rows[0].teacher_id !== teacher_id) {
            return res.status(403).json({ message: 'Not authorized to view this attendance' });
        }

        const attendance = await pool.query(
            'SELECT a.*, s.name as student_name, s.email, s.roll_number, s.batch FROM attendance a JOIN students s ON a.student_id = s.id WHERE a.session_id = $1 ORDER BY a.marked_at DESC',
            [sessionId]
        );

        res.json({
            session: session.rows[0],
            attendance: attendance.rows,
            total_present: attendance.rows.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getCourseAttendance = async (req, res) => {
    try {
        const { courseId } = req.params;
        const teacher_id = req.user.id;

        const course = await pool.query(
            'SELECT * FROM courses WHERE id = $1',
            [courseId]
        );

        if (course.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.rows[0].teacher_id !== teacher_id) {
            return res.status(403).json({ message: 'Not authorized to view this attendance' });
        }

        const attendance = await pool.query(
            `SELECT a.*, s.name as student_name, s.email, s.roll_number, s.batch, 
             ses.session_date, ses.session_time 
             FROM attendance a 
             JOIN students s ON a.student_id = s.id 
             JOIN sessions ses ON a.session_id = ses.id 
             WHERE ses.course_id = $1 
             ORDER BY ses.session_date DESC, ses.session_time DESC, a.marked_at DESC`,
            [courseId]
        );

        res.json({
            course: course.rows[0],
            attendance: attendance.rows,
            total_records: attendance.rows.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getStudentAttendance = async (req, res) => {
    try {
        const { studentId, courseId } = req.params;
        const user_id = req.user.id;
        const user_role = req.user.role;

        if (user_role === 'student' && user_id !== parseInt(studentId)) {
            return res.status(403).json({ message: 'Not authorized to view other student attendance' });
        }

        if (user_role === 'teacher') {
            const course = await pool.query(
                'SELECT * FROM courses WHERE id = $1',
                [courseId]
            );

            if (course.rows.length === 0) {
                return res.status(404).json({ message: 'Course not found' });
            }

            if (course.rows[0].teacher_id !== user_id) {
                return res.status(403).json({ message: 'Not authorized to view this attendance' });
            }
        }

        const student = await pool.query(
            'SELECT id, name, email, roll_number, batch FROM students WHERE id = $1',
            [studentId]
        );

        if (student.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const attendance = await pool.query(
            `SELECT a.*, ses.session_date, ses.session_time, c.course_name, c.course_code 
             FROM attendance a 
             JOIN sessions ses ON a.session_id = ses.id 
             JOIN courses c ON ses.course_id = c.id 
             WHERE a.student_id = $1 AND ses.course_id = $2 
             ORDER BY ses.session_date DESC, ses.session_time DESC`,
            [studentId, courseId]
        );

        res.json({
            student: student.rows[0],
            attendance: attendance.rows,
            total_attended: attendance.rows.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    markAttendance,
    getSessionAttendance,
    getCourseAttendance,
    getStudentAttendance
};

