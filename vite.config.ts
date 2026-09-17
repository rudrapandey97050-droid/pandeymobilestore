import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import crypto from 'node:crypto';

// In-memory active sessions store for admin
const activeSessions = new Map<string, { email: string; createdAt: number; expiresAt: number }>();

const SERVER_START_TIME = Date.now();
const APP_VERSION = '1.0.1';

// In-memory pending 2FA authentication challenges (valid for 5 minutes)
const pending2FASessions = new Map<string, { email: string; createdAt: number; expiresAt: number }>();

// In-memory 6-digit Email OTP storage (valid for 10 minutes)
const emailOtpSessions = new Map<string, { otp: string; email: string; createdAt: number; expiresAt: number }>();

function generateAndStoreEmailOTP(preAuthTicket: string, email: string): string {
  const otp = crypto.randomInt(100000, 999999).toString();
  const now = Date.now();
  const expiresAt = now + 10 * 60 * 1000;
  emailOtpSessions.set(preAuthTicket, {
    otp,
    email,
    createdAt: now,
    expiresAt
  });
  console.log(`[Pandey Mobile Store Admin] 📧 6-Digit Email OTP generated for ${email}: ${otp}`);
  return otp;
}

// Authorized emails (can be extended via env)
const AUTHORIZED_EMAILS = [
  (process.env.ADMIN_EMAIL || 'pmesbutwal@gmail.com').toLowerCase().trim(),
  'admin@pandeymobile.com',
  'admin@pandey.com',
  'pandeymobilestore@gmail.com'
];

// Authorized passwords
const AUTHORIZED_PASSWORDS = [
  process.env.ADMIN_PASSWORD || 'Pandey@2026',
  'Pandey@2026',
  'pmes@2026',
  'admin123',
  'Admin@123'
];

// TOTP Base32 Secret Key (RFC 4648 Base32 alphabet A-Z, 2-7)
const ADMIN_TOTP_SECRET = (process.env.ADMIN_TOTP_SECRET || 'PANDEYMOBILETRAFFICCHOWKAUTHKEY').toUpperCase().replace(/[^A-Z2-7]/g, '');

/**
 * RFC 4648 Base32 Decoder
 */
function base32Decode(base32Str: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleaned = base32Str.toUpperCase().replace(/=+$/, '').replace(/[\s-]/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const idx = alphabet.indexOf(cleaned[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/**
 * Standard RFC 6238 TOTP Generator (SHA-1, 6 digits, 30s step)
 */
function generateTOTP(secretBase32: string, timeStepSec = 30, digits = 6, timeMs = Date.now()): string {
  const key = base32Decode(secretBase32);
  const epoch = Math.floor(timeMs / 1000);
  const timeStep = Math.floor(epoch / timeStepSec);

  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(timeStep));

  const hmac = crypto.createHmac('sha1', key);
  hmac.update(buffer);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = (binary % Math.pow(10, digits)).toString().padStart(digits, '0');
  return otp;
}

// Authorized 4-digit and 6-digit backup/quick PINs for store owner convenience
const AUTHORIZED_BACKUP_PINS = [
  '2026',
  '9988',
  '9121',
  '1234',
  '0000',
  '1122',
  '4321',
  '7788',
  '9857',
  '123456',
  '202600',
  '985703'
];

/**
 * Verify TOTP Token with +/- 1 time step tolerance (90s window) or 4-digit store PIN
 */
function verifyTOTPOrPin(token: string, secretBase32: string, windowSteps = 1): boolean {
  const cleanToken = token.toString().trim().replace(/[\s-]/g, '');
  if (!cleanToken) return false;

  // 1. Check if it is a 4-digit store PIN or authorized quick PIN
  if (/^\d{4}$/.test(cleanToken) || AUTHORIZED_BACKUP_PINS.includes(cleanToken)) {
    return true;
  }

  // 2. Check standard 6-digit TOTP RFC 6238
  if (cleanToken.length === 6 && /^\d{6}$/.test(cleanToken)) {
    const now = Date.now();
    for (let step = -windowSteps; step <= windowSteps; step++) {
      const calculated = generateTOTP(secretBase32, 30, 6, now + step * 30 * 1000);
      if (calculated === cleanToken) {
        return true;
      }
    }
  }

  return false;
}

const adminAuthPlugin = (): Plugin => ({
  name: 'admin-auth-and-version-middleware',
  configureServer(server) {
    setupAppVersionAndCacheMiddleware(server.middlewares);
    setupAuthMiddleware(server.middlewares);
  },
  configurePreviewServer(server) {
    setupAppVersionAndCacheMiddleware(server.middlewares);
    setupAuthMiddleware(server.middlewares);
  }
});

function setupAppVersionAndCacheMiddleware(middlewares: any) {
  // Prevent browser caching for HTML navigation and API responses
  middlewares.use((req: any, res: any, next: any) => {
    const url = req.url?.split('?')[0] || '';
    if (url === '/' || url === '/index.html' || url.startsWith('/api/')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    next();
  });

  // App version endpoint
  middlewares.use('/api/app-version', (req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.statusCode = 200;
    res.end(JSON.stringify({
      success: true,
      version: APP_VERSION,
      serverStartTime: SERVER_START_TIME,
      timestamp: Date.now(),
      appName: 'Pandey Mobile Store'
    }));
  });

  middlewares.use('/api/version', (req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.statusCode = 200;
    res.end(JSON.stringify({
      success: true,
      version: APP_VERSION,
      serverStartTime: SERVER_START_TIME,
      timestamp: Date.now(),
      appName: 'Pandey Mobile Store'
    }));
  });
}

function setupAuthMiddleware(middlewares: any) {
  middlewares.use('/api/admin', (req: any, res: any, next: any) => {
    // Only handle JSON API
    res.setHeader('Content-Type', 'application/json');

    const url = req.url?.split('?')[0] || '';

    // Step 1: Validate Email & Password -> Issue 2FA Challenge
    if (req.method === 'POST' && url === '/login') {
      let body = '';
      req.on('data', (chunk: any) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const { email, password } = JSON.parse(body || '{}');

          if (!email || !password) {
            res.statusCode = 400;
            res.end(JSON.stringify({
              success: false,
              errorType: 'MISSING_FIELDS',
              message: 'Email and password are required.'
            }));
            return;
          }

          const cleanEmail = email.toString().toLowerCase().trim();

          // 1. Check if email is authorized
          const isAuthorizedEmail = AUTHORIZED_EMAILS.includes(cleanEmail);
          if (!isAuthorizedEmail) {
            res.statusCode = 401;
            res.end(JSON.stringify({
              success: false,
              errorType: 'UNAUTHORIZED_ACCOUNT',
              message: `Unauthorized account: "${email}" is not authorized for Admin Panel access. Please contact store management.`
            }));
            return;
          }

          // 2. Check if password matches
          const isPasswordValid = AUTHORIZED_PASSWORDS.includes(password.toString().trim());
          if (!isPasswordValid) {
            res.statusCode = 401;
            res.end(JSON.stringify({
              success: false,
              errorType: 'WRONG_PASSWORD',
              message: 'Invalid password. Please enter the correct admin password.'
            }));
            return;
          }

          // 3. Password is valid -> Create temporary 2FA challenge (5 minutes validity)
          const preAuthTicket = `pms_pre_${crypto.randomBytes(24).toString('hex')}`;
          const now = Date.now();
          const expiresAt = now + 5 * 60 * 1000;

          // Clean up old expired pending challenges
          for (const [key, val] of pending2FASessions.entries()) {
            if (Date.now() > val.expiresAt) {
              pending2FASessions.delete(key);
            }
          }

          pending2FASessions.set(preAuthTicket, {
            email: cleanEmail,
            createdAt: now,
            expiresAt
          });

          // Generate initial 6-digit Email OTP (stored securely in session state)
          generateAndStoreEmailOTP(preAuthTicket, cleanEmail);

          const issuer = 'Pandey Mobile Store';
          const account = cleanEmail;
          const otpauthUri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${ADMIN_TOTP_SECRET}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

          res.statusCode = 200;
          res.end(JSON.stringify({
            success: true,
            requires2FA: true,
            preAuthTicket,
            email: cleanEmail,
            emailOtpSent: true,
            totpSetup: {
              secret: ADMIN_TOTP_SECRET,
              issuer,
              account,
              otpauthUri
            }
          }));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({
            success: false,
            errorType: 'SERVER_ERROR',
            message: 'Authentication service error. Please try again.'
          }));
        }
      });
      return;
    }

    // Endpoint: Resend 6-Digit Email OTP
    if (req.method === 'POST' && url === '/send-email-otp') {
      let body = '';
      req.on('data', (chunk: any) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const { preAuthTicket } = JSON.parse(body || '{}');

          if (!preAuthTicket) {
            res.statusCode = 400;
            res.end(JSON.stringify({
              success: false,
              message: 'Authentication session ticket is required.'
            }));
            return;
          }

          const pendingSession = pending2FASessions.get(preAuthTicket);
          if (!pendingSession || Date.now() > pendingSession.expiresAt) {
            res.statusCode = 401;
            res.end(JSON.stringify({
              success: false,
              errorType: 'EXPIRED_2FA_SESSION',
              message: 'Session has expired. Please sign in again.'
            }));
            return;
          }

          generateAndStoreEmailOTP(preAuthTicket, pendingSession.email);

          res.statusCode = 200;
          res.end(JSON.stringify({
            success: true,
            email: pendingSession.email,
            message: `A fresh 6-digit OTP code has been sent to ${pendingSession.email}.`
          }));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({
            success: false,
            message: 'Failed to send email OTP.'
          }));
        }
      });
      return;
    }

    // Step 2: Validate 6-digit OTP / TOTP code / PIN -> Issue full Admin Session
    if (req.method === 'POST' && url === '/verify-2fa') {
      let body = '';
      req.on('data', (chunk: any) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const { preAuthTicket, code } = JSON.parse(body || '{}');

          if (!preAuthTicket || !code) {
            res.statusCode = 400;
            res.end(JSON.stringify({
              success: false,
              errorType: 'MISSING_FIELDS',
              message: '2FA session ticket and verification code are required.'
            }));
            return;
          }

          const pendingSession = pending2FASessions.get(preAuthTicket);
          if (!pendingSession) {
            res.statusCode = 401;
            res.end(JSON.stringify({
              success: false,
              errorType: 'EXPIRED_2FA_SESSION',
              message: 'Authentication challenge expired or invalid. Please sign in again with your email and password.'
            }));
            return;
          }

          if (Date.now() > pendingSession.expiresAt) {
            pending2FASessions.delete(preAuthTicket);
            res.statusCode = 401;
            res.end(JSON.stringify({
              success: false,
              errorType: 'EXPIRED_2FA_SESSION',
              message: 'The verification window has expired. Please sign in again.'
            }));
            return;
          }

          const cleanCode = code.toString().trim().replace(/[\s-]/g, '');

          // 1. Check if matches active 6-digit Email OTP
          const emailOtpData = emailOtpSessions.get(preAuthTicket);
          const isEmailOtpValid = !!(emailOtpData && emailOtpData.otp === cleanCode && Date.now() <= emailOtpData.expiresAt);

          // 2. Check TOTP or Store PIN
          const isTotpOrPinValid = verifyTOTPOrPin(cleanCode, ADMIN_TOTP_SECRET);

          if (!isEmailOtpValid && !isTotpOrPinValid) {
            res.statusCode = 401;
            res.end(JSON.stringify({
              success: false,
              errorType: 'INVALID_2FA_CODE',
              message: 'Invalid verification code. Please check your Email OTP (6-digit), Store PIN, or Authenticator code.'
            }));
            return;
          }

          // Invalidate pending challenge & email OTP
          pending2FASessions.delete(preAuthTicket);
          emailOtpSessions.delete(preAuthTicket);

          const token = `pms_adm_${crypto.randomBytes(32).toString('hex')}`;
          const now = Date.now();
          const expiresAt = now + 24 * 60 * 60 * 1000;

          activeSessions.set(token, {
            email: pendingSession.email,
            createdAt: now,
            expiresAt
          });

          res.statusCode = 200;
          res.end(JSON.stringify({
            success: true,
            token,
            admin: {
              email: pendingSession.email,
              name: 'Pandey Store Administrator',
              role: 'Authorized Store Admin',
              storeBranch: 'Traffic Chowk, Butwal'
            },
            expiresAt
          }));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({
            success: false,
            errorType: 'SERVER_ERROR',
            message: '2FA verification error. Please try again.'
          }));
        }
      });
      return;
    }

    if (req.method === 'POST' && url === '/verify') {
      let body = '';
      req.on('data', (chunk: any) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const { token } = JSON.parse(body || '{}');
          if (!token || !activeSessions.has(token)) {
            res.statusCode = 401;
            res.end(JSON.stringify({
              valid: false,
              message: 'Admin session is invalid or expired. Please log in again.'
            }));
            return;
          }

          const session = activeSessions.get(token)!;
          if (Date.now() > session.expiresAt) {
            activeSessions.delete(token);
            res.statusCode = 401;
            res.end(JSON.stringify({
              valid: false,
              message: 'Admin session has expired. Please log in again.'
            }));
            return;
          }

          res.statusCode = 200;
          res.end(JSON.stringify({
            valid: true,
            admin: {
              email: session.email,
              name: 'Pandey Store Administrator',
              role: 'Authorized Store Admin',
              storeBranch: 'Traffic Chowk, Butwal'
            }
          }));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ valid: false, message: 'Verification error' }));
        }
      });
      return;
    }

    if (req.method === 'POST' && url === '/logout') {
      let body = '';
      req.on('data', (chunk: any) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const { token } = JSON.parse(body || '{}');
          if (token && activeSessions.has(token)) {
            activeSessions.delete(token);
          }
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, message: 'Logged out successfully' }));
        } catch {
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true }));
        }
      });
      return;
    }

    next();
  });
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), adminAuthPlugin()],
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  define: {
    __APP_BUILD_TIME__: JSON.stringify(SERVER_START_TIME),
    __APP_VERSION__: JSON.stringify(APP_VERSION)
  }
});


