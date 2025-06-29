/**
 * LumaBoard Password Protection System
 * Hash-based authentication with session management and brute force protection
 */

class PasswordProtection {
  constructor(config = {}) {
    this.config = {
      maxAttempts: config.maxAttempts || 5,
      lockoutDuration: config.lockoutDuration || 300000, // 5 minutes
      sessionTimeout: config.sessionTimeout || 3600000, // 1 hour
      hashRounds: config.hashRounds || 10000,
      saltLength: config.saltLength || 32,
      ...config
    };
    
    this.attempts = 0;
    this.lockoutTime = 0;
    this.sessionToken = null;
    this.sessionExpiry = 0;
    this.isLocked = false;
    
    // Storage keys
    this.storageKeys = {
      attempts: 'lumaboard_auth_attempts',
      lockout: 'lumaboard_auth_lockout',
      session: 'lumaboard_auth_session',
      sessionExpiry: 'lumaboard_auth_session_expiry'
    };
    
    this.init();
  }

  /**
   * Initialize password protection system
   */
  init() {
    this.loadState();
    this.checkLockoutStatus();
    this.validateSession();
    
    console.log('PasswordProtection: Initialized');
  }

  /**
   * Load authentication state from localStorage
   */
  loadState() {
    try {
      this.attempts = parseInt(localStorage.getItem(this.storageKeys.attempts)) || 0;
      this.lockoutTime = parseInt(localStorage.getItem(this.storageKeys.lockout)) || 0;
      this.sessionToken = localStorage.getItem(this.storageKeys.session);
      this.sessionExpiry = parseInt(localStorage.getItem(this.storageKeys.sessionExpiry)) || 0;
    } catch (error) {
      console.warn('PasswordProtection: Failed to load state from localStorage:', error);
      this.resetState();
    }
  }

  /**
   * Save authentication state to localStorage
   */
  saveState() {
    try {
      localStorage.setItem(this.storageKeys.attempts, this.attempts.toString());
      localStorage.setItem(this.storageKeys.lockout, this.lockoutTime.toString());
      
      if (this.sessionToken) {
        localStorage.setItem(this.storageKeys.session, this.sessionToken);
        localStorage.setItem(this.storageKeys.sessionExpiry, this.sessionExpiry.toString());
      } else {
        localStorage.removeItem(this.storageKeys.session);
        localStorage.removeItem(this.storageKeys.sessionExpiry);
      }
    } catch (error) {
      console.warn('PasswordProtection: Failed to save state to localStorage:', error);
    }
  }

  /**
   * Reset authentication state
   */
  resetState() {
    this.attempts = 0;
    this.lockoutTime = 0;
    this.sessionToken = null;
    this.sessionExpiry = 0;
    this.isLocked = false;
    
    try {
      Object.values(this.storageKeys).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('PasswordProtection: Failed to clear localStorage:', error);
    }
  }

  /**
   * Check if currently locked out
   */
  checkLockoutStatus() {
    const now = Date.now();
    
    if (this.lockoutTime > 0 && now < this.lockoutTime) {
      this.isLocked = true;
      return true;
    }
    
    if (this.isLocked && now >= this.lockoutTime) {
      this.isLocked = false;
      this.attempts = 0;
      this.lockoutTime = 0;
      this.saveState();
    }
    
    return this.isLocked;
  }

  /**
   * Get remaining lockout time in milliseconds
   */
  getRemainingLockoutTime() {
    if (!this.isLocked) return 0;
    return Math.max(0, this.lockoutTime - Date.now());
  }

  /**
   * Validate current session
   */
  validateSession() {
    const now = Date.now();
    
    if (!this.sessionToken || now >= this.sessionExpiry) {
      this.clearSession();
      return false;
    }
    
    return true;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.validateSession();
  }

  /**
   * Generate cryptographic hash of password with salt
   */
  async hashPassword(password, salt = null) {
    if (!salt) {
      salt = this.generateSalt();
    }
    
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    
    let hash = await crypto.subtle.digest('SHA-256', data);
    
    // Apply additional rounds for security
    for (let i = 1; i < this.config.hashRounds; i++) {
      hash = await crypto.subtle.digest('SHA-256', new Uint8Array(hash));
    }
    
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return { hash: hashHex, salt };
  }

  /**
   * Generate cryptographic salt
   */
  generateSalt() {
    const array = new Uint8Array(this.config.saltLength);
    crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate session token
   */
  generateSessionToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Authenticate with password
   */
  async authenticate(password, expectedHash, expectedSalt) {
    // Check if locked out
    if (this.checkLockoutStatus()) {
      const remainingTime = Math.ceil(this.getRemainingLockoutTime() / 1000);
      throw new Error(`Account locked. Try again in ${remainingTime} seconds.`);
    }
    
    if (!password || !expectedHash || !expectedSalt) {
      throw new Error('Invalid authentication parameters');
    }
    
    try {
      // Hash the provided password with the expected salt
      const { hash } = await this.hashPassword(password, expectedSalt);
      
      // Compare hashes
      const isValid = hash === expectedHash;
      
      if (isValid) {
        this.handleSuccessfulAuth();
        return true;
      } else {
        this.handleFailedAuth();
        return false;
      }
    } catch (error) {
      console.error('PasswordProtection: Authentication error:', error);
      this.handleFailedAuth();
      throw error;
    }
  }

  /**
   * Authenticate with URL hash (for kiosk mode)
   */
  async authenticateWithHash(urlHash, expectedHash, expectedSalt) {
    // Extract password from URL hash
    const hashParams = new URLSearchParams(urlHash.substring(1));
    const password = hashParams.get('auth') || hashParams.get('password');
    
    if (!password) {
      throw new Error('No authentication parameter found in URL');
    }
    
    return await this.authenticate(password, expectedHash, expectedSalt);
  }

  /**
   * Handle successful authentication
   */
  handleSuccessfulAuth() {
    // Reset failed attempts
    this.attempts = 0;
    this.lockoutTime = 0;
    this.isLocked = false;
    
    // Create new session
    this.sessionToken = this.generateSessionToken();
    this.sessionExpiry = Date.now() + this.config.sessionTimeout;
    
    this.saveState();
    
    console.log('PasswordProtection: Authentication successful');
    
    // Emit authentication event
    document.dispatchEvent(new CustomEvent('authsuccess', {
      detail: { sessionToken: this.sessionToken }
    }));
  }

  /**
   * Handle failed authentication
   */
  handleFailedAuth() {
    this.attempts++;
    
    // Check if should lock out
    if (this.attempts >= this.config.maxAttempts) {
      this.lockoutTime = Date.now() + this.config.lockoutDuration;
      this.isLocked = true;
      
      console.warn(`PasswordProtection: Account locked after ${this.attempts} failed attempts`);
      
      // Emit lockout event
      document.dispatchEvent(new CustomEvent('authlockout', {
        detail: { 
          attempts: this.attempts,
          lockoutDuration: this.config.lockoutDuration
        }
      }));
    } else {
      console.warn(`PasswordProtection: Failed authentication attempt ${this.attempts}/${this.config.maxAttempts}`);
      
      // Emit failed attempt event
      document.dispatchEvent(new CustomEvent('authfailed', {
        detail: { 
          attempts: this.attempts,
          maxAttempts: this.config.maxAttempts
        }
      }));
    }
    
    this.saveState();
  }

  /**
   * Clear current session
   */
  clearSession() {
    this.sessionToken = null;
    this.sessionExpiry = 0;
    this.saveState();
    
    console.log('PasswordProtection: Session cleared');
    
    // Emit session cleared event
    document.dispatchEvent(new CustomEvent('authsessioncleared'));
  }

  /**
   * Logout and clear session
   */
  logout() {
    this.clearSession();
    
    // Emit logout event
    document.dispatchEvent(new CustomEvent('authlogout'));
  }

  /**
   * Extend current session
   */
  extendSession() {
    if (this.sessionToken) {
      this.sessionExpiry = Date.now() + this.config.sessionTimeout;
      this.saveState();
      
      console.log('PasswordProtection: Session extended');
      return true;
    }
    
    return false;
  }

  /**
   * Get authentication status
   */
  getStatus() {
    return {
      isAuthenticated: this.isAuthenticated(),
      isLocked: this.isLocked,
      attempts: this.attempts,
      maxAttempts: this.config.maxAttempts,
      remainingLockoutTime: this.getRemainingLockoutTime(),
      sessionExpiry: this.sessionExpiry,
      sessionTimeRemaining: Math.max(0, this.sessionExpiry - Date.now())
    };
  }

  /**
   * Create password hash for configuration
   */
  async createPasswordHash(password) {
    const { hash, salt } = await this.hashPassword(password);
    return { hash, salt };
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password) {
    const requirements = {
      minLength: 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    
    const score = Object.values(requirements).filter(Boolean).length;
    const isValid = password.length >= requirements.minLength && score >= 3;
    
    return {
      isValid,
      score,
      requirements,
      strength: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong'
    };
  }

  /**
   * Setup automatic session extension on activity
   */
  setupActivityMonitoring() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    let lastActivity = Date.now();
    
    const activityHandler = () => {
      const now = Date.now();
      
      // Only extend session if more than 5 minutes since last activity
      if (now - lastActivity > 300000) {
        this.extendSession();
      }
      
      lastActivity = now;
    };
    
    events.forEach(event => {
      document.addEventListener(event, activityHandler, { passive: true });
    });
    
    console.log('PasswordProtection: Activity monitoring enabled');
  }

  /**
   * Destroy password protection and cleanup
   */
  destroy() {
    this.clearSession();
    console.log('PasswordProtection: Destroyed');
  }
}

// Create global password protection instance
let globalPasswordProtection = null;

/**
 * Initialize password protection with configuration
 */
export function initPasswordProtection(config = {}) {
  globalPasswordProtection = new PasswordProtection(config);
  return globalPasswordProtection;
}

/**
 * Get global password protection instance
 */
export function getPasswordProtection() {
  if (!globalPasswordProtection) {
    globalPasswordProtection = new PasswordProtection();
  }
  return globalPasswordProtection;
}

/**
 * Quick authentication check
 */
export function isAuthenticated() {
  return getPasswordProtection().isAuthenticated();
}

/**
 * Quick authentication with password
 */
export async function authenticate(password, expectedHash, expectedSalt) {
  return await getPasswordProtection().authenticate(password, expectedHash, expectedSalt);
}

/**
 * Create password hash for configuration
 */
export async function createPasswordHash(password) {
  return await getPasswordProtection().createPasswordHash(password);
}

// Export class for advanced usage
export { PasswordProtection };

// Export default instance getter
export default getPasswordProtection; 