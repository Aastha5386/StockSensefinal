import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser, UserRole } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is missing.');
}

export interface AuthRequest extends Request {
  user?: IUser;
}

export const generateToken = (user: IUser): string => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      companyName: user.companyName,
      companyId: user.companyId,
      companyEmailOrId: user.companyEmailOrId,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`.trim() || user.companyName || user.email,
      operatorId: user.operatorId,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User session expired or invalid.' });
    }

    req.user = user;
    next();
  } catch (error: any) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token', error: error.message });
  }
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): any => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Role '${req.user.role}' lacks permission for this action. Allowed: [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
};
