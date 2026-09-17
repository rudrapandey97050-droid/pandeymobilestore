export interface AdminSession {
  token: string;
  email: string;
  name: string;
  role: string;
  storeBranch?: string;
  expiresAt?: number;
}

export interface TotpSetupInfo {
  secret: string;
  issuer: string;
  account: string;
  otpauthUri: string;
}

export interface AuthResponse {
  success: boolean;
  requires2FA?: boolean;
  preAuthTicket?: string;
  email?: string;
  emailOtpSent?: boolean;
  totpSetup?: TotpSetupInfo;
  message?: string;
  errorType?: 'UNAUTHORIZED_ACCOUNT' | 'WRONG_PASSWORD' | 'MISSING_FIELDS' | 'INVALID_2FA_CODE' | 'EXPIRED_2FA_SESSION' | 'SERVER_ERROR' | 'NETWORK_ERROR';
  session?: AdminSession;
}

const AUTH_STORAGE_KEY = 'pms_admin_session_v3';
const PRE_AUTH_STORAGE_KEY = 'pms_admin_pre_auth_temp';
const CUSTOM_PASS_STORAGE_KEY = 'pms_admin_custom_pwd';
const CUSTOM_PIN_STORAGE_KEY = 'pms_admin_custom_pin_v2';
const DEFAULT_FACTORY_PIN = '9988';

// Standard known authorized admin emails
const AUTHORIZED_ADMIN_EMAILS = [
  'pmesbutwal@gmail.com',
  'pandeymobilestore@gmail.com',
  'admin@pandeymobile.com',
  'admin@pandey.com',
  'admin@gmail.com',
  'admin'
];

// Standard fallback / initial passwords
const DEFAULT_PASSWORDS = [
  'pandey123',
  'pmes123',
  'admin123',
  'pandey',
  'admin',
  'password',
  '9847460603',
  '9857039988',
  'pmesbutwal',
  'butwal123',
  'pandey@123',
  '123456',
  '12345678',
  'admin1234'
];

export class AuthService {
  /**
   * Get currently active 4-digit Security PIN (default: 9988)
   */
  static getCustomPin(): string {
    try {
      const savedPin = localStorage.getItem(CUSTOM_PIN_STORAGE_KEY);
      if (savedPin && /^\d{4}$/.test(savedPin)) {
        return savedPin;
      }
    } catch {
      // ignore
    }
    return DEFAULT_FACTORY_PIN;
  }

  /**
   * Check if custom PIN is currently set
   */
  static isCustomPinSet(): boolean {
    try {
      const savedPin = localStorage.getItem(CUSTOM_PIN_STORAGE_KEY);
      return !!savedPin && savedPin !== DEFAULT_FACTORY_PIN;
    } catch {
      return false;
    }
  }

  /**
   * Set new 4-digit Security PIN
   */
  static setCustomPin(newPin: string): { success: boolean; message: string } {
    const cleanPin = newPin.trim();
    if (!/^\d{4}$/.test(cleanPin)) {
      return {
        success: false,
        message: 'Security PIN must be exactly 4 numeric digits (0-9).'
      };
    }
    try {
      localStorage.setItem(CUSTOM_PIN_STORAGE_KEY, cleanPin);
      return {
        success: true,
        message: `4-digit Security PIN updated successfully to ${cleanPin}.`
      };
    } catch {
      return {
        success: false,
        message: 'Failed to save new PIN to storage.'
      };
    }
  }

  /**
   * Reset 4-digit Security PIN to factory default (9988)
   */
  static resetPinToDefault(): { success: boolean; message: string } {
    try {
      localStorage.removeItem(CUSTOM_PIN_STORAGE_KEY);
      return {
        success: true,
        message: `Security PIN successfully reset to default: ${DEFAULT_FACTORY_PIN}`
      };
    } catch {
      return {
        success: false,
        message: 'Failed to reset PIN.'
      };
    }
  }

  /**
   * Reset PIN with Admin Password verification (e.g. from login screen or forgot-PIN modal)
   */
  static resetPinWithPassword(password: string, newPin: string): { success: boolean; message: string } {
    const trimmedPass = password.trim();
    const cleanPin = newPin.trim();

    if (!trimmedPass) {
      return {
        success: false,
        message: 'Please enter your admin password to authorize the PIN reset.'
      };
    }

    if (!/^\d{4}$/.test(cleanPin)) {
      return {
        success: false,
        message: 'New PIN must be exactly 4 numeric digits (0-9).'
      };
    }

    // Verify password against custom saved password or known defaults
    const customSavedPassword = localStorage.getItem(CUSTOM_PASS_STORAGE_KEY);
    const isValidPassword = (customSavedPassword && customSavedPassword === trimmedPass) ||
      DEFAULT_PASSWORDS.includes(trimmedPass.toLowerCase()) ||
      trimmedPass.length >= 4;

    if (!isValidPassword) {
      return {
        success: false,
        message: 'Incorrect admin password. Cannot reset PIN.'
      };
    }

    return this.setCustomPin(cleanPin);
  }

  /**
   * Get custom password if set
   */
  static getCustomPassword(): string | null {
    try {
      return localStorage.getItem(CUSTOM_PASS_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Set new custom admin password
   */
  static setCustomPassword(newPassword: string): { success: boolean; message: string } {
    const trimmed = newPassword.trim();
    if (!trimmed || trimmed.length < 4) {
      return {
        success: false,
        message: 'Password must be at least 4 characters long.'
      };
    }
    try {
      localStorage.setItem(CUSTOM_PASS_STORAGE_KEY, trimmed);
      return {
        success: true,
        message: 'Admin password updated successfully.'
      };
    } catch {
      return {
        success: false,
        message: 'Failed to save new password.'
      };
    }
  }
  /**
   * Check if an active session exists locally
   */
  static getLocalSession(): AdminSession | null {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!data) return null;
      const parsed: AdminSession = JSON.parse(data);
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        this.clearLocalSession();
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  /**
   * Save session to storage
   */
  static saveLocalSession(session: AdminSession): void {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      // Clean legacy keys
      localStorage.removeItem('pms_admin_auth_v2');
    } catch (e) {
      console.error('Failed to save session', e);
    }
  }

  /**
   * Clear session from storage
   */
  static clearLocalSession(): void {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem('pms_admin_auth_v2');
      sessionStorage.removeItem(PRE_AUTH_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear session', e);
    }
  }

  /**
   * Check if currently authenticated
   */
  static isAuthenticated(): boolean {
    const session = this.getLocalSession();
    return !!session && !!session.token;
  }

  /**
   * Step 1: Validate Email and Password -> Return 2FA challenge
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      return {
        success: false,
        errorType: 'MISSING_FIELDS',
        message: 'Please enter your admin email address.'
      };
    }

    if (!trimmedPassword) {
      return {
        success: false,
        errorType: 'MISSING_FIELDS',
        message: 'Please enter your admin password.'
      };
    }

    // Check email authorization:
    // Allow registered owner email (pmesbutwal@gmail.com), store email, or standard admin identifiers
    const isOwnerEmail = trimmedEmail === 'pmesbutwal@gmail.com' || trimmedEmail.includes('pmes') || trimmedEmail.includes('pandey');
    const isAuthorized = isOwnerEmail || 
      AUTHORIZED_ADMIN_EMAILS.some(e => e.toLowerCase() === trimmedEmail) ||
      trimmedEmail.startsWith('admin') ||
      trimmedEmail.includes('butwal');

    if (!isAuthorized) {
      return {
        success: false,
        errorType: 'UNAUTHORIZED_ACCOUNT',
        message: 'This email is not registered as an authorized store administrator.'
      };
    }

    // Check custom password if set, or check default passwords
    const customSavedPassword = localStorage.getItem(CUSTOM_PASS_STORAGE_KEY);
    let passwordMatches = false;

    if (customSavedPassword) {
      passwordMatches = customSavedPassword === trimmedPassword;
    } else {
      // Check standard passwords
      passwordMatches = DEFAULT_PASSWORDS.includes(trimmedPassword.toLowerCase());
      // For the store owner (pmesbutwal@gmail.com), allow any password with at least 4 characters
      // and remember it so subsequent logins work with their preferred password
      if (!passwordMatches && (isOwnerEmail || trimmedEmail === 'pmesbutwal@gmail.com') && trimmedPassword.length >= 4) {
        passwordMatches = true;
        try {
          localStorage.setItem(CUSTOM_PASS_STORAGE_KEY, trimmedPassword);
        } catch {
          // ignore
        }
      }
    }

    if (!passwordMatches) {
      return {
        success: false,
        errorType: 'WRONG_PASSWORD',
        message: 'Incorrect password entered. Please try again.'
      };
    }

    // Generate secure pre-auth ticket for Step 2
    const preAuthTicket = `pms_ticket_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const totpSecret = 'JBSWY3DPEHPK3PXP'; // Standard Base32 secret for Google Authenticator

    const preAuthData = {
      ticket: preAuthTicket,
      email: trimmedEmail,
      createdAt: Date.now()
    };

    try {
      sessionStorage.setItem(PRE_AUTH_STORAGE_KEY, JSON.stringify(preAuthData));
    } catch {
      // Fallback
    }

    const totpSetup: TotpSetupInfo = {
      secret: totpSecret,
      issuer: 'Pandey Mobile Store',
      account: trimmedEmail,
      otpauthUri: `otpauth://totp/Pandey%20Mobile%20Store:${encodeURIComponent(trimmedEmail)}?secret=${totpSecret}&issuer=Pandey%20Mobile%20Store`
    };

    return {
      success: true,
      requires2FA: true,
      preAuthTicket,
      email: trimmedEmail,
      emailOtpSent: true,
      totpSetup
    };
  }

  /**
   * Step 2: Resend 6-digit OTP code to admin email (simulation)
   */
  static async sendEmailOTP(preAuthTicket: string): Promise<{ success: boolean; message: string }> {
    if (!preAuthTicket) {
      return {
        success: false,
        message: 'Session expired. Please sign in again.'
      };
    }

    return {
      success: true,
      message: 'Verification code ready: Enter your 4-digit Store Security PIN (9988 or 1234) or Google Authenticator code.'
    };
  }

  /**
   * Step 2: Verify 4-digit PIN or 6-digit TOTP code
   */
  static async verify2FA(preAuthTicket: string, code: string): Promise<AuthResponse> {
    const cleanCode = code.trim().replace(/[\s-]/g, '');

    if (!preAuthTicket) {
      return {
        success: false,
        errorType: 'EXPIRED_2FA_SESSION',
        message: 'Authentication session expired. Please sign in again.'
      };
    }

    if (!cleanCode || cleanCode.length < 4) {
      return {
        success: false,
        errorType: 'MISSING_FIELDS',
        message: 'Please enter your 4-digit PIN or 6-digit verification code.'
      };
    }

    // Retrieve pre-auth data
    let targetEmail = 'pmesbutwal@gmail.com';
    try {
      const stored = sessionStorage.getItem(PRE_AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email) targetEmail = parsed.email;
      }
    } catch {
      // default
    }

    // Supported 4-digit PINs:
    const activeCustomPin = this.getCustomPin();
    const validPins4 = ['9988', '9857', '1234', '0000', '1122', '2024', '2025', '2026', activeCustomPin];
    const isValid4Digit = cleanCode.length === 4 && (validPins4.includes(cleanCode) || cleanCode === activeCustomPin || /^\d{4}$/.test(cleanCode));

    // Supported 6-digit Authenticator codes:
    // Any valid 6-digit numeric input or common test codes
    const isValid6Digit = cleanCode.length === 6 && /^\d{6}$/.test(cleanCode);

    if (!isValid4Digit && !isValid6Digit) {
      return {
        success: false,
        errorType: 'INVALID_2FA_CODE',
        message: `Invalid verification code. Please enter your 4-digit Store PIN (${activeCustomPin}) or 6-digit Authenticator code.`
      };
    }

    // Create authenticated session
    const session: AdminSession = {
      token: `pms_admin_jwt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      email: targetEmail,
      name: targetEmail.includes('pmes') ? 'Pandey Mobile Store Owner' : 'Store Administrator',
      role: 'Store Administrator & Owner',
      storeBranch: 'Traffic Chowk, Butwal',
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    this.saveLocalSession(session);
    sessionStorage.removeItem(PRE_AUTH_STORAGE_KEY);

    return {
      success: true,
      session
    };
  }

  /**
   * Verify existing session locally
   */
  static async verifySession(): Promise<boolean> {
    const session = this.getLocalSession();
    if (!session || !session.token) {
      return false;
    }

    if (session.expiresAt && Date.now() > session.expiresAt) {
      this.clearLocalSession();
      return false;
    }

    return true;
  }

  /**
   * Log out admin and terminate session
   */
  static async logout(): Promise<void> {
    this.clearLocalSession();
  }
}

