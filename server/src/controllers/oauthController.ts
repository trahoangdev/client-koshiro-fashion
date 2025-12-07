import { Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import Role, { IRole } from '../models/Role';
import { asyncHandler } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Verify Google token
const verifyGoogleToken = async (token: string) => {
  try {
    const response = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`);
    return response.data;
  } catch (error) {
    console.error('Google token verification error:', error);
    return null;
  }
};

// Verify Facebook token
const verifyFacebookToken = async (token: string) => {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/me?access_token=${token}&fields=id,name,email,picture`
    );
    return response.data;
  } catch (error) {
    console.error('Facebook token verification error:', error);
    return null;
  }
};

export const googleLogin = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(token);
    if (!googleUser || !googleUser.email) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    // Find or create user
    let user = await User.findOne({ 
      $or: [
        { googleId: googleUser.sub || googleUser.user_id },
        { email: googleUser.email }
      ]
    }).populate('role');

    if (user) {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleUser.sub || googleUser.user_id;
        user.oauthProvider = 'google';
        await user.save();
      }
    } else {
      // Create new user
      const customerRole = await Role.findOne({ name: 'Customer' });
      if (!customerRole) {
        return res.status(500).json({ message: 'Customer role not found' });
      }

      user = new User({
        email: googleUser.email,
        name: googleUser.name || googleUser.given_name || 'Google User',
        googleId: googleUser.sub || googleUser.user_id,
        oauthProvider: 'google',
        role: customerRole._id,
        status: 'active'
      });

      await user.save();
      user = await User.findById(user._id).populate('role');
    }

    // Update last active
    if (user) {
      user.lastActive = new Date();
      await user.save();
    }

    // Get user role name
    const userRole = typeof user.role === 'string' 
      ? user.role 
      : (user.role as unknown as IRole)?.name || 'Customer';

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email, role: userRole, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Google login successful',
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: userRole
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export const facebookLogin = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Facebook token is required' });
    }

    // Verify Facebook token
    const facebookUser = await verifyFacebookToken(token);
    if (!facebookUser || !facebookUser.email) {
      return res.status(401).json({ message: 'Invalid Facebook token' });
    }

    // Find or create user
    let user = await User.findOne({ 
      $or: [
        { facebookId: facebookUser.id },
        { email: facebookUser.email }
      ]
    }).populate('role');

    if (user) {
      // Update Facebook ID if not set
      if (!user.facebookId) {
        user.facebookId = facebookUser.id;
        user.oauthProvider = 'facebook';
        await user.save();
      }
    } else {
      // Create new user
      const customerRole = await Role.findOne({ name: 'Customer' });
      if (!customerRole) {
        return res.status(500).json({ message: 'Customer role not found' });
      }

      user = new User({
        email: facebookUser.email,
        name: facebookUser.name || 'Facebook User',
        facebookId: facebookUser.id,
        oauthProvider: 'facebook',
        role: customerRole._id,
        status: 'active'
      });

      await user.save();
      user = await User.findById(user._id).populate('role');
    }

    // Update last active
    if (user) {
      user.lastActive = new Date();
      await user.save();
    }

    // Get user role name
    const userRole = typeof user.role === 'string' 
      ? user.role 
      : (user.role as unknown as IRole)?.name || 'Customer';

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email, role: userRole, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Facebook login successful',
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: userRole
      }
    });
  } catch (error) {
    console.error('Facebook login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

