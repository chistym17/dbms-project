const express = require('express');
const router = express.Router();
const {
    studentSignup,
    studentLogin,
    teacherSignup,
    teacherLogin
} = require('../controllers/authController');

router.post('/student/signup', studentSignup);
router.post('/student/login', studentLogin);
router.post('/teacher/signup', teacherSignup);
router.post('/teacher/login', teacherLogin);

module.exports = router;

