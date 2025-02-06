const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('x-auth-token');

    if(!token) {
        return res.status(401).json({ message: 'No token, aurthorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded.user;
        next();
    }
    catch(error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const authorizeRole = (roles) => {
    return(req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'User role ${req.user.role} is not authorized to access this route' });
        }
        next();
    };
};

module.exports = {verifyToken, authorizeRole};