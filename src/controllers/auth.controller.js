import logger from '#config/logger.js';
import { authenticateUser, createUser } from '#services/auth.service.js';
import { cookies } from '#utils/cookies.js';
import { formatValidationError } from '#utils/format.js';
import { jwttoken } from '#utils/jwt.js';
import { loginSchema, registerSchema } from '#validations/auth.validation.js';

export const register = async (req, res, next) => {
  try {
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { name, email, password, role } = validationResult.data;
    // Auth Service
    const user = await createUser({ name, email, password, role });
    const token = jwttoken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    cookies.set(res, 'token', token);
    logger.info(`User ${email} registered successfully`);
    res.status(201).json({
      message: 'User registered',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Registration error ', error);
    if (error.message === 'User with this email already exists') {
      return res.status(409).json({ error: 'Email already exixts' });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }
    const { email, password } = validationResult.data;
    const user = await authenticateUser({ email, password });
    const token = jwttoken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    cookies.set(res, 'token', token);
    logger.info(`User ${user.email} logged in successfully`);
    res.status(200).json({
      message: 'User logged in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Login error ', error);
    if (
      error.message === 'User not found' ||
      error.message === 'Invalid password'
    ) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    next(error);
  }
};

export const logout = (req, res, next) => {
  try {
    cookies.clear(res, 'token');
    logger.info('User logged out successfully');
    res.status(200).json({
      message: 'User logged out successfully',
    });
  } catch (error) {
    logger.error('Logout error ', error);
    next(error);
  }
};
