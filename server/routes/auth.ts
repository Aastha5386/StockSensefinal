import { Router, Request, Response } from 'express';
import { User, IUser, UserRole } from '../models/User';
import { generateToken, verifyToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<any> => {
  try {
    const { companyName, companyEmailOrId, email, name, fullName, password, confirmPassword, role } = req.body;

    // 1. Validate Company Name
    const cleanCompanyName = (companyName || name || fullName || '').trim();
    if (!cleanCompanyName) {
      return res.status(400).json({ success: false, message: 'Company Name cannot be empty.' });
    }

    // 2. Validate Company Email/ID
    const rawIdentifier = (companyEmailOrId || email || '').trim().toLowerCase();
    if (!rawIdentifier) {
      return res.status(400).json({ success: false, message: 'Company Email/ID cannot be empty.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (rawIdentifier.includes('@')) {
      if (!emailRegex.test(rawIdentifier)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid Company Email address.' });
      }
    } else {
      const idRegex = /^[a-zA-Z0-9_\-\.]+$/;
      if (rawIdentifier.length < 3 || !idRegex.test(rawIdentifier)) {
        return res.status(400).json({
          success: false,
          message: 'Company ID must be at least 3 characters (letters, numbers, hyphens).',
        });
      }
    }

    // 3. Validate Password Security Rules
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must contain at least one uppercase letter (A-Z).' });
    }
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must contain at least one lowercase letter (a-z).' });
    }
    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must contain at least one number (0-9).' });
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must contain at least one special character (e.g. @ # $ % ! * &).' });
    }

    // 4. Validate Confirm Password Match
    if (confirmPassword !== undefined && confirmPassword !== password) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    // 5. Operational Role (defaults to admin for company registrant)
    const validRoles: UserRole[] = ['admin', 'inventory_manager', 'warehouse_staff', 'purchase_manager'];
    const chosenRole: UserRole = role && validRoles.includes(role as UserRole) ? (role as UserRole) : 'admin';

    // 6. Check if Company Email/ID already exists
    const normalizedEmail = rawIdentifier.includes('@') ? rawIdentifier : `${rawIdentifier}@company.internal`;
    const existing = await User.findOne({
      $or: [{ email: normalizedEmail }, { companyEmailOrId: rawIdentifier }],
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A company account with this Company Email/ID already exists.' });
    }

    const companyIdSlug =
      cleanCompanyName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'company';

    // 7. Create company user in MongoDB (password hashed by pre-save hook)
    const user = new User({
      companyName: cleanCompanyName,
      companyId: companyIdSlug,
      companyEmailOrId: rawIdentifier,
      email: normalizedEmail,
      password,
      firstName: cleanCompanyName,
      lastName: 'Admin',
      role: chosenRole,
      operatorId: `OP-${Math.floor(100 + Math.random() * 900)}-${chosenRole.slice(0, 1).toUpperCase()}`,
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(companyIdSlug)}`,
    });

    await user.save();

    // 8. DO NOT automatically log in or return token. Require explicit login.
    return res.status(201).json({
      success: true,
      message: 'Company account created successfully. Please sign in with your Company Email/ID to continue.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<any> => {
  try {
    const { companyEmailOrId, email, password } = req.body;
    const loginId = (companyEmailOrId || email || '').trim().toLowerCase();

    if (!loginId || !password) {
      return res.status(400).json({ success: false, message: 'Company Email/ID and password are required.' });
    }

    const user = await User.findOne({
      $or: [
        { email: loginId },
        { companyEmailOrId: loginId },
        { companyId: loginId },
        { operatorId: loginId.toUpperCase() },
      ],
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid company credentials or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid company credentials or password.' });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        companyName: user.companyName,
        companyId: user.companyId,
        companyEmailOrId: user.companyEmailOrId,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim() || user.companyName || user.email,
        role: user.role,
        operatorId: user.operatorId,
        dept: user.dept,
        station: user.station,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req: AuthRequest, res: Response): Promise<any> => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthenticated' });
  }

  return res.json({
    success: true,
    user: {
      id: req.user._id,
      companyName: req.user.companyName,
      companyId: req.user.companyId,
      companyEmailOrId: req.user.companyEmailOrId,
      email: req.user.email,
      name: `${req.user.firstName} ${req.user.lastName}`.trim() || req.user.companyName || req.user.email,
      role: req.user.role,
      operatorId: req.user.operatorId,
      dept: req.user.dept,
      station: req.user.station,
      avatarUrl: req.user.avatarUrl,
    },
  });
});

// PUT /api/auth/profile
router.put('/profile', verifyToken, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { name, avatarUrl, station, dept } = req.body;
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

    const parts = (name || '').trim().split(' ');
    req.user.firstName = parts[0] || req.user.firstName;
    req.user.lastName = parts.slice(1).join(' ') || req.user.lastName;
    if (avatarUrl) req.user.avatarUrl = avatarUrl;
    if (station) req.user.station = station;
    if (dept) req.user.dept = dept;

    await req.user.save();

    return res.json({
      success: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        name: `${req.user.firstName} ${req.user.lastName}`.trim() || req.user.email,
        role: req.user.role,
        operatorId: req.user.operatorId,
        avatarUrl: req.user.avatarUrl,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/users (admin only)
router.get('/users', verifyToken, requireRole(['admin']), async (_req: AuthRequest, res: Response): Promise<any> => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json({ success: true, users });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/auth/users/:id/role (admin only)
router.put('/users/:id/role', verifyToken, requireRole(['admin']), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { role } = req.body;
    if (!['admin', 'inventory_manager', 'warehouse_staff', 'purchase_manager'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, user });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/auth/users/:id (admin only)
router.delete('/users/:id', verifyToken, requireRole(['admin']), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    await User.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'User removed successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
