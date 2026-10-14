import { UserAccount, UserProfile, AuthSession } from '../types';
import { SanctuaryStorage } from './storage';

const ACCOUNTS_STORAGE_KEY = 'mugumo_accounts_v1';
const CURRENT_SESSION_KEY = 'mugumo_auth_session_v1';

// Web Crypto SHA-256 password hashing helper
async function hashPassword(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(password + '::mugumo_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Initial demo accounts
const SEED_ACCOUNTS: UserAccount[] = [
  {
    id: 'acc-mugumo-traveler',
    displayName: 'Sanctuary Keeper',
    username: 'keeper',
    email: 'keeper@mugumo.tv',
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // 'admin123'
    createdAt: '2026-10-01T12:00:00Z',
  }
];

export const AuthService = {
  getAccounts(): UserAccount[] {
    try {
      const data = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(SEED_ACCOUNTS));
        return SEED_ACCOUNTS;
      }
      return JSON.parse(data);
    } catch {
      return SEED_ACCOUNTS;
    }
  },

  async register(displayName: string, username: string, email: string, password: string): Promise<{ success: boolean; error?: string; account?: UserAccount }> {
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanDisplayName = displayName.trim();

    if (!cleanDisplayName) return { success: false, error: 'Display name is required.' };
    if (!cleanUsername || cleanUsername.length < 3) return { success: false, error: 'Username must be at least 3 characters.' };
    if (!cleanEmail || !cleanEmail.includes('@')) return { success: false, error: 'Please enter a valid email address.' };
    if (!password || password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };

    const accounts = this.getAccounts();
    if (accounts.some(a => a.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: 'That username is already claimed in the forest.' };
    }
    if (accounts.some(a => a.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with that email already exists. Enter the Grove to sign in.' };
    }

    const passwordHash = await hashPassword(password);
    const newAccount: UserAccount = {
      id: `acc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      displayName: cleanDisplayName,
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    const updated = [...accounts, newAccount];
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
    SanctuaryStorage.addLog('INFO', 'SYSTEM', `New sanctuary account rooted: ${newAccount.username}`);

    // Set as active session (without profile yet)
    this.setSession({
      account: newAccount,
      activeProfile: null,
      isGuest: false,
    });

    return { success: true, account: newAccount };
  },

  async login(identifier: string, password: string): Promise<{ success: boolean; error?: string; account?: UserAccount }> {
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) return { success: false, error: 'Please enter your email or username.' };
    if (!password) return { success: false, error: 'Please enter your password.' };

    const accounts = this.getAccounts();
    const account = accounts.find(a => a.username.toLowerCase() === cleanId || a.email.toLowerCase() === cleanId);
    if (!account) {
      return { success: false, error: 'No sanctuary record found with those credentials.' };
    }

    const inputHash = await hashPassword(password);
    // Allow either match against saved hash or seed password for demo keeper
    const isMatch = account.passwordHash === inputHash || (account.username === 'keeper' && password === 'admin123');
    if (!isMatch) {
      return { success: false, error: 'Incorrect password for this clearing.' };
    }

    // Set session
    this.setSession({
      account,
      activeProfile: null,
      isGuest: false,
    });

    SanctuaryStorage.addLog('SIGNAL', 'SYSTEM', `Account entered the Grove: ${account.username}`);
    return { success: true, account };
  },

  getSession(): AuthSession {
    try {
      const data = localStorage.getItem(CURRENT_SESSION_KEY);
      if (!data) {
        return { account: null, activeProfile: null, isGuest: true };
      }
      return JSON.parse(data);
    } catch {
      return { account: null, activeProfile: null, isGuest: true };
    }
  },

  setSession(session: AuthSession): void {
    try {
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
    } catch {
      // safe fallback
    }
  },

  setActiveProfile(profile: UserProfile | null): void {
    const current = this.getSession();
    this.setSession({
      ...current,
      activeProfile: profile,
      isGuest: profile ? false : current.isGuest,
    });
    if (profile) {
      SanctuaryStorage.addLog('INFO', 'SYSTEM', `Viewing clearing activated: ${profile.name}`);
    }
  },

  enterAsGuest(): void {
    this.setSession({
      account: null,
      activeProfile: {
        id: 'guest-profile',
        accountId: 'guest-account',
        name: 'Guest Traveler',
        avatarSeed: 'roots',
        createdAt: new Date().toISOString(),
        isDefault: true,
      },
      isGuest: true,
    });
    SanctuaryStorage.setGateUnlocked(true);
    SanctuaryStorage.addLog('SIGNAL', 'SYSTEM', 'Sanctuary entered under Guest Traveler status');
  },

  async updateAccount(
    accountId: string,
    updates: { displayName?: string; email?: string }
  ): Promise<{ success: boolean; error?: string; account?: UserAccount }> {
    const accounts = this.getAccounts();
    const idx = accounts.findIndex(a => a.id === accountId);
    if (idx === -1) return { success: false, error: 'Account not found in sanctuary records.' };

    const current = accounts[idx];
    const newDisplayName = updates.displayName ? updates.displayName.trim() : current.displayName;
    const newEmail = updates.email ? updates.email.trim().toLowerCase() : current.email;

    if (!newDisplayName) return { success: false, error: 'Display name cannot be empty.' };
    if (!newEmail || !newEmail.includes('@')) return { success: false, error: 'Please enter a valid email address.' };

    // Check if new email is used by another account
    if (newEmail !== current.email && accounts.some(a => a.id !== accountId && a.email.toLowerCase() === newEmail)) {
      return { success: false, error: 'That email is already registered to another sanctuary account.' };
    }

    const updatedAccount: UserAccount = {
      ...current,
      displayName: newDisplayName,
      email: newEmail,
    };

    accounts[idx] = updatedAccount;
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));

    // Update active session if it matches
    const session = this.getSession();
    if (session.account?.id === accountId) {
      this.setSession({
        ...session,
        account: updatedAccount,
      });
    }

    SanctuaryStorage.addLog('INFO', 'SYSTEM', `Account details updated for: ${updatedAccount.username}`);
    return { success: true, account: updatedAccount };
  },

  async changePassword(
    accountId: string,
    currentPass: string,
    newPass: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!currentPass) return { success: false, error: 'Please enter your current password.' };
    if (!newPass || newPass.length < 6) return { success: false, error: 'New password must be at least 6 characters.' };

    const accounts = this.getAccounts();
    const idx = accounts.findIndex(a => a.id === accountId);
    if (idx === -1) return { success: false, error: 'Account not found.' };

    const account = accounts[idx];
    const currentHash = await hashPassword(currentPass);
    const isMatch = account.passwordHash === currentHash || (account.username === 'keeper' && currentPass === 'admin123');

    if (!isMatch) {
      return { success: false, error: 'Current password does not match sanctuary records.' };
    }

    const newHash = await hashPassword(newPass);
    accounts[idx] = {
      ...account,
      passwordHash: newHash,
    };
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    SanctuaryStorage.addLog('SIGNAL', 'SYSTEM', `Security credentials renewed for: ${account.username}`);
    return { success: true };
  },

  async deleteAccount(
    accountId: string,
    passwordConfirm: string
  ): Promise<{ success: boolean; error?: string }> {
    const accounts = this.getAccounts();
    const idx = accounts.findIndex(a => a.id === accountId);
    if (idx === -1) return { success: false, error: 'Account record not found.' };

    const account = accounts[idx];
    const inputHash = await hashPassword(passwordConfirm);
    const isMatch = account.passwordHash === inputHash || (account.username === 'keeper' && passwordConfirm === 'admin123');

    if (!isMatch) {
      return { success: false, error: 'Password confirmation incorrect. Cannot delete account.' };
    }

    // 1. Delete all profiles belonging to this account and clean up photos & vaults
    try {
      const { ProfileService } = await import('./profileService');
      await ProfileService.deleteAccountProfiles(accountId);
    } catch (err) {
      console.warn('Profile deletion during account cleanup', err);
    }

    // 2. Remove account record
    const updatedAccounts = accounts.filter(a => a.id !== accountId);
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updatedAccounts));

    // 3. Clear session
    this.logout();
    SanctuaryStorage.addLog('ANOMALY', 'SYSTEM', `Account permanently unrooted and dissolved: ${account.username}`);
    return { success: true };
  },

  logout(): void {
    localStorage.removeItem(CURRENT_SESSION_KEY);
    SanctuaryStorage.addLog('INFO', 'SYSTEM', 'Sanctuary session sealed. Returned to the edge of the forest.');
  }
};
