import type { UserAccount, UserProfile, AuthSession } from '../types';
import { supabase } from '../lib/supabase';
import { SanctuaryStorage } from './storage';

const CURRENT_SESSION_KEY = 'mugumo_auth_session_v1';

const guestSession = (): AuthSession => ({
  account: null,
  activeProfile: null,
  isGuest: true,
});

function cacheSession(session: AuthSession): void {
  try {
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
  } catch {
    // Session persistence is also handled by Supabase Auth.
  }
}

async function accountFromUser(user: {
  id: string;
  email?: string;
  created_at?: string;
  user_metadata?: Record<string, unknown>;
}): Promise<UserAccount> {
  const { data: profile } = await supabase
    .from('account_profiles')
    .select('display_name, username')
    .eq('id', user.id)
    .maybeSingle();

  const metadata = user.user_metadata ?? {};

  return {
    id: user.id,
    displayName:
      profile?.display_name ||
      (typeof metadata.display_name === 'string'
        ? metadata.display_name
        : 'Forest Traveler'),
    username:
      profile?.username ||
      (typeof metadata.username === 'string' ? metadata.username : ''),
    email: user.email ?? '',
    createdAt: user.created_at ?? new Date().toISOString(),
  };
}

async function syncSignedInAccount(userId: string): Promise<void> {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user || data.user.id !== userId) return;

  const account = await accountFromUser(data.user);
  const current = AuthService.getSession();

  cacheSession({
    account,
    activeProfile:
      current.account?.id === userId ? current.activeProfile : null,
    isGuest: false,
  });
}

export const AuthService = {
  // Kept for compatibility with older callers. Supabase is the source of truth.
  getAccounts(): UserAccount[] {
    return [];
  },

  async register(
    displayName: string,
    username: string,
    email: string,
    password: string,
  ): Promise<{
    success: boolean;
    error?: string;
    account?: UserAccount;
    needsEmailConfirmation?: boolean;
  }> {
    const cleanDisplayName = displayName.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanDisplayName) {
      return { success: false, error: 'Display name is required.' };
    }

    if (!/^[a-z0-9_]{3,30}$/.test(cleanUsername)) {
      return {
        success: false,
        error: 'Username must be 3–30 characters using letters, numbers, or underscores.',
      };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters.',
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          display_name: cleanDisplayName,
          username: cleanUsername,
        },
      },
    });

    if (error) {
      const message = error.message.toLowerCase();

      if (message.includes('username') || message.includes('duplicate key')) {
        return {
          success: false,
          error: 'That username or email may already be registered.',
        };
      }

      return { success: false, error: error.message };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Supabase did not return an account. Please try again.',
      };
    }

    const account = await accountFromUser(data.user);
    const needsEmailConfirmation = !data.session;

    if (data.session) {
      cacheSession({
        account,
        activeProfile: null,
        isGuest: false,
      });

      SanctuaryStorage.addLog(
        'INFO',
        'SYSTEM',
        `New sanctuary account rooted: ${account.username}`,
      );
    }

    return {
      success: true,
      account,
      needsEmailConfirmation,
    };
  },

  async login(
    identifier: string,
    password: string,
  ): Promise<{ success: boolean; error?: string; account?: UserAccount }> {
    const cleanId = identifier.trim().toLowerCase();

    if (!cleanId) {
      return { success: false, error: 'Please enter your email or username.' };
    }

    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    let accessToken: string | undefined;
    let refreshToken: string | undefined;

    if (cleanId.includes('@')) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanId,
        password,
      });

      if (error || !data.session) {
        return {
          success: false,
          error: 'Invalid email or password. If you just registered, check whether email confirmation is required.',
        };
      }

      accessToken = data.session.access_token;
      refreshToken = data.session.refresh_token;
    } else {
      const { data, error } = await supabase.functions.invoke<{
        session?: { access_token: string; refresh_token: string };
        error?: string;
      }>('username-lookup', {
        body: { username: cleanId, password },
      });

      if (error || !data?.session) {
        return {
          success: false,
          error: data?.error || 'Invalid username or password. Check that the login function has been deployed.',
        };
      }

      accessToken = data.session.access_token;
      refreshToken = data.session.refresh_token;
    }

    if (!accessToken || !refreshToken) {
      return { success: false, error: 'The authentication session could not be established.' };
    }

    const { data: sessionData, error: sessionError } =
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

    if (sessionError || !sessionData.user) {
      return {
        success: false,
        error: sessionError?.message || 'Could not establish your session.',
      };
    }

    const account = await accountFromUser(sessionData.user);

    cacheSession({
      account,
      activeProfile: null,
      isGuest: false,
    });

    SanctuaryStorage.addLog(
      'SIGNAL',
      'SYSTEM',
      `Account entered the Grove: ${account.username}`,
    );

    return { success: true, account };
  },

  getSession(): AuthSession {
    try {
      const raw = localStorage.getItem(CURRENT_SESSION_KEY);
      if (!raw) return guestSession();

      const session = JSON.parse(raw) as AuthSession;

      // Discard obsolete fake accounts from the previous local-only system.
      if (session.account && !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(session.account.id)) {
        localStorage.removeItem(CURRENT_SESSION_KEY);
        return guestSession();
      }

      return session;
    } catch {
      return guestSession();
    }
  },

  setSession(session: AuthSession): void {
    cacheSession(session);
  },

  setActiveProfile(profile: UserProfile | null): void {
    const current = this.getSession();

    cacheSession({
      ...current,
      activeProfile: profile,
      isGuest: profile ? current.isGuest : current.isGuest,
    });

    if (profile) {
      SanctuaryStorage.addLog(
        'INFO',
        'SYSTEM',
        `Viewing clearing activated: ${profile.name}`,
      );
    }
  },

  enterAsGuest(): void {
    cacheSession({
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
    SanctuaryStorage.addLog(
      'SIGNAL',
      'SYSTEM',
      'Sanctuary entered under Guest Traveler status',
    );
  },

  async updateAccount(
    accountId: string,
    updates: { displayName?: string; email?: string },
  ): Promise<{ success: boolean; error?: string; account?: UserAccount }> {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user || authData.user.id !== accountId) {
      return { success: false, error: 'Please sign in again before updating your account.' };
    }

    const current = await accountFromUser(authData.user);
    const newDisplayName = updates.displayName?.trim() || current.displayName;
    const newEmail = updates.email?.trim().toLowerCase() || current.email;

    if (!newDisplayName) {
      return { success: false, error: 'Display name cannot be empty.' };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const { error: metadataError } = await supabase.auth.updateUser({
      data: { display_name: newDisplayName },
    });

    if (metadataError) {
      return { success: false, error: metadataError.message };
    }

    const { error: profileError } = await supabase
      .from('account_profiles')
      .update({ display_name: newDisplayName })
      .eq('id', accountId);

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    if (newEmail !== current.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (emailError) {
        return { success: false, error: emailError.message };
      }
    }

    const refreshed = await supabase.auth.getUser();
    const account = refreshed.data.user
      ? await accountFromUser(refreshed.data.user)
      : { ...current, displayName: newDisplayName };

    cacheSession({
      ...this.getSession(),
      account,
    });

    SanctuaryStorage.addLog(
      'INFO',
      'SYSTEM',
      `Account details updated for: ${account.username}`,
    );

    return {
      success: true,
      account,
      ...(newEmail !== current.email
        ? { error: 'Email change requested. Check your inbox to confirm it if email confirmation is enabled.' }
        : {}),
    };
  },

  async changePassword(
    accountId: string,
    currentPass: string,
    newPass: string,
  ): Promise<{ success: boolean; error?: string }> {
    if (!currentPass) {
      return { success: false, error: 'Please enter your current password.' };
    }

    if (newPass.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }

    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user || authData.user.id !== accountId) {
      return { success: false, error: 'Please sign in again before changing your password.' };
    }

    const email = authData.user.email;
    if (!email) {
      return { success: false, error: 'No email address is associated with this account.' };
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPass,
    });

    if (verifyError) {
      return { success: false, error: 'Your current password is incorrect.' };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPass,
    });

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    SanctuaryStorage.addLog(
      'SIGNAL',
      'SYSTEM',
      `Security credentials renewed for: ${authData.user.user_metadata?.username ?? email}`,
    );

    return { success: true };
  },

  async deleteAccount(
    _accountId: string,
    _passwordConfirm: string,
  ): Promise<{ success: boolean; error?: string }> {
    // Auth users must be deleted through a protected server-side function.
    return {
      success: false,
      error: 'Secure account deletion has not been configured yet. Your account has not been deleted.',
    };
  },

  logout(): void {
    cacheSession(guestSession());
    void supabase.auth.signOut();
    SanctuaryStorage.addLog(
      'INFO',
      'SYSTEM',
      'Sanctuary session sealed. Returned to the edge of the forest.',
    );
  },
};

// Keep the cached UI session aligned with Supabase's persisted authentication.
supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    setTimeout(() => {
      void syncSignedInAccount(session.user.id);
    }, 0);
    return;
  }

  const current = AuthService.getSession();

  // Supabase's initial empty session should not erase an intentional guest session.
  if (!current.isGuest) {
    cacheSession(guestSession());
  }
});
