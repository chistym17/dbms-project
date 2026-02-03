const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const studentSignup = async (req, res) => {
    try {
        const { name, email, password, roll_number, batch, academic_session } = req.body;

        const existingStudent = await pool.query(
            'SELECT * FROM students WHERE email = $1 OR roll_number = $2',
            [email, roll_number]
        );

        if (existingStudent.rows.length > 0) {
            return res.status(400).json({ message: 'Student already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO students (name, email, password_hash, roll_number, batch, academic_session) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, roll_number, batch, academic_session',
            [name, email, hashedPassword, roll_number, batch, academic_session]
        );

        const student = result.rows[0];
        const token = jwt.sign(
            { id: student.id, email: student.email, role: 'student' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Student registered successfully',
            token,
            user: student
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const studentLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            'SELECT * FROM students WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const student = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, student.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: student.id, email: student.email, role: 'student' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        const { password_hash, ...userWithoutPassword } = student;

        res.json({
            message: 'Login successful',
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const teacherSignup = async (req, res) => {
    try {
        const { name, email, password, department } = req.body;

        const existingTeacher = await pool.query(
            'SELECT * FROM teachers WHERE email = $1',
            [email]
        );

        if (existingTeacher.rows.length > 0) {
            return res.status(400).json({ message: 'Teacher already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO teachers (name, email, password_hash, department) VALUES ($1, $2, $3, $4) RETURNING id, name, email, department',
            [name, email, hashedPassword, department]
        );

        const teacher = result.rows[0];
        const token = jwt.sign(
            { id: teacher.id, email: teacher.email, role: 'teacher' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Teacher registered successfully',
            token,
            user: teacher
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const teacherLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            'SELECT * FROM teachers WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const teacher = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, teacher.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: teacher.id, email: teacher.email, role: 'teacher' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        const { password_hash, ...userWithoutPassword } = teacher;

        res.json({
            message: 'Login successful',
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    studentSignup,
    studentLogin,
    teacherSignup,
    teacherLogin
};

