const express = require('express');
const router = express.Router();
const {
    markAttendance,
    getSessionAttendance,
    getCourseAttendance,
    getStudentAttendance,
    getCourseStats,
    getStudentStats
} = require('../controllers/attendanceController');
const { authenticate, isStudent, isTeacher } = require('../middlewares/authMiddleware');

router.post('/mark', authenticate, isStudent, markAttendance);
router.get('/session/:sessionId', authenticate, isTeacher, getSessionAttendance);
router.get('/course/:courseId', authenticate, isTeacher, getCourseAttendance);
router.get('/student/:studentId/course/:courseId', authenticate, getStudentAttendance);
router.get('/stats/course/:courseId', authenticate, isTeacher, getCourseStats);
router.get('/stats/student/:studentId/course/:courseId', authenticate, getStudentStats);

module.exports = router;

