const express = require('express');
const router = express.Router();
const {
    createCourse,
    getAllCourses,
    getTeacherCourses,
    getCourseById,
    updateCourse,
    deleteCourse
} = require('../controllers/courseController');
const { authenticate, isTeacher } = require('../middlewares/authMiddleware');

router.post('/', authenticate, isTeacher, createCourse);
router.get('/', authenticate, getAllCourses);
router.get('/teacher', authenticate, isTeacher, getTeacherCourses);
router.get('/:id', authenticate, getCourseById);
router.put('/:id', authenticate, isTeacher, updateCourse);
router.delete('/:id', authenticate, isTeacher, deleteCourse);

module.exports = router;

