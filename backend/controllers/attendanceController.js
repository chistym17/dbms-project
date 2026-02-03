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

const getCourseStats = async (req, res) => {
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
            return res.status(403).json({ message: 'Not authorized to view these statistics' });
        }

        const totalSessions = await pool.query(
            'SELECT COUNT(*) as count FROM sessions WHERE course_id = $1',
            [courseId]
        );

        const sessionsBreakdown = await pool.query(
            `SELECT s.id, s.session_date, s.session_time, 
             COUNT(a.id) as students_present 
             FROM sessions s 
             LEFT JOIN attendance a ON s.id = a.session_id 
             WHERE s.course_id = $1 
             GROUP BY s.id 
             ORDER BY s.session_date DESC, s.session_time DESC`,
            [courseId]
        );

        const uniqueStudents = await pool.query(
            `SELECT COUNT(DISTINCT a.student_id) as count 
             FROM attendance a 
             JOIN sessions s ON a.session_id = s.id 
             WHERE s.course_id = $1`,
            [courseId]
        );

        const studentsBreakdown = await pool.query(
            `SELECT st.id, st.name, st.roll_number, st.batch,
             COUNT(a.id) as attended,
             $1::integer - COUNT(a.id) as missed,
             CASE 
                WHEN $1::integer > 0 THEN ROUND((COUNT(a.id)::numeric / $1::numeric) * 100, 2)
                ELSE 0
             END as percentage
             FROM students st
             LEFT JOIN attendance a ON st.id = a.student_id
             LEFT JOIN sessions s ON a.session_id = s.id AND s.course_id = $1
             WHERE st.id IN (
                SELECT DISTINCT student_id FROM attendance a2
                JOIN sessions s2 ON a2.session_id = s2.id
                WHERE s2.course_id = $1
             )
             GROUP BY st.id
             ORDER BY percentage DESC`,
            [courseId, totalSessions.rows[0].count]
        );

        const totalAttendanceRecords = await pool.query(
            `SELECT COUNT(*) as count 
             FROM attendance a 
             JOIN sessions s ON a.session_id = s.id 
             WHERE s.course_id = $1`,
            [courseId]
        );

        const totalSessionsCount = parseInt(totalSessions.rows[0].count);
        const totalStudentsCount = parseInt(uniqueStudents.rows[0].count);
        const totalPossibleAttendance = totalSessionsCount * totalStudentsCount;
        const overallAttendanceRate = totalPossibleAttendance > 0
            ? ((parseInt(totalAttendanceRecords.rows[0].count) / totalPossibleAttendance) * 100).toFixed(2)
            : 0;

        res.json({
            course: course.rows[0],
            total_sessions: totalSessionsCount,
            total_students_attended: totalStudentsCount,
            overall_attendance_rate: parseFloat(overallAttendanceRate),
            sessions_breakdown: sessionsBreakdown.rows.map(s => ({
                session_id: s.id,
                date: s.session_date,
                time: s.session_time,
                students_present: parseInt(s.students_present),
                attendance_rate: totalStudentsCount > 0
                    ? ((parseInt(s.students_present) / totalStudentsCount) * 100).toFixed(2)
                    : 0
            })),
            students_breakdown: studentsBreakdown.rows.map(s => ({
                student_id: s.id,
                name: s.name,
                roll_number: s.roll_number,
                batch: s.batch,
                attended: parseInt(s.attended),
                missed: parseInt(s.missed),
                percentage: parseFloat(s.percentage)
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getStudentStats = async (req, res) => {
    try {
        const { studentId, courseId } = req.params;
        const user_id = req.user.id;
        const user_role = req.user.role;

        if (user_role === 'student' && user_id !== parseInt(studentId)) {
            return res.status(403).json({ message: 'Not authorized to view other student statistics' });
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
                return res.status(403).json({ message: 'Not authorized to view these statistics' });
            }
        }

        const student = await pool.query(
            'SELECT id, name, email, roll_number, batch FROM students WHERE id = $1',
            [studentId]
        );

        if (student.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const course = await pool.query(
            'SELECT * FROM courses WHERE id = $1',
            [courseId]
        );

        const totalSessions = await pool.query(
            'SELECT COUNT(*) as count FROM sessions WHERE course_id = $1',
            [courseId]
        );

        const attendedSessions = await pool.query(
            `SELECT COUNT(*) as count 
             FROM attendance a 
             JOIN sessions s ON a.session_id = s.id 
             WHERE a.student_id = $1 AND s.course_id = $2`,
            [studentId, courseId]
        );

        const allSessionsWithAttendance = await pool.query(
            `SELECT s.id, s.session_date, s.session_time,
             CASE 
                WHEN a.id IS NOT NULL THEN 'present'
                ELSE 'absent'
             END as status,
             a.marked_at
             FROM sessions s
             LEFT JOIN attendance a ON s.id = a.session_id AND a.student_id = $1
             WHERE s.course_id = $2
             ORDER BY s.session_date DESC, s.session_time DESC`,
            [studentId, courseId]
        );

        const totalSessionsCount = parseInt(totalSessions.rows[0].count);
        const attendedCount = parseInt(attendedSessions.rows[0].count);
        const missedCount = totalSessionsCount - attendedCount;
        const attendancePercentage = totalSessionsCount > 0
            ? ((attendedCount / totalSessionsCount) * 100).toFixed(2)
            : 0;

        res.json({
            student: student.rows[0],
            course: course.rows[0],
            total_sessions: totalSessionsCount,
            sessions_attended: attendedCount,
            sessions_missed: missedCount,
            attendance_percentage: parseFloat(attendancePercentage),
            records: allSessionsWithAttendance.rows
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    markAttendance,
    getSessionAttendance,
    getCourseAttendance,
    getStudentAttendance,
    getCourseStats,
    getStudentStats
};

