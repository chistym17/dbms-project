const express = require('express');
const router = express.Router();
const {
    createSession,
    getCourseSessions,
    getSessionById,
    updateSession,
    deleteSession
} = require('../controllers/sessionController');
const { authenticate, isTeacher } = require('../middlewares/authMiddleware');

router.post('/', authenticate, isTeacher, createSession);
router.get('/course/:courseId', authenticate, getCourseSessions);
router.get('/:id', authenticate, getSessionById);
router.put('/:id', authenticate, isTeacher, updateSession);
router.delete('/:id', authenticate, isTeacher, deleteSession);

module.exports = router;

