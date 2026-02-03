import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

export const verifyToken = (req, res, next) => {
  const header = req.headers['authorization'];
  const token = header ? header.split(' ')[1] : null;
  if (!token) return res.status(401).json({ msg: 'Token required' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid token' });
  }
};

export const verifyAdmin = (req, res, next) => {
  if (req.role !== 'admin') return res.status(403).json({ msg: 'Admin access required' });
  next();
};

export default { verifyToken, verifyAdmin };
