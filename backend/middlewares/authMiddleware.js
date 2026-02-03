const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authenticate = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

const isStudent = (req, res, next) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Access denied. Students only.' });
    }
    next();
};

const isTeacher = (req, res, next) => {
    if (req.user.role !== 'teacher') {
        return res.status(403).json({ message: 'Access denied. Teachers only.' });
    }
    next();
};

module.exports = {
    authenticate,
    isStudent,
    isTeacher
};

