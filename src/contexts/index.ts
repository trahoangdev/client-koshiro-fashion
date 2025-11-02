/**
 * @fileoverview Central export file for all context-related functionality
 * This file provides a single entry point for importing contexts, hooks, and types
 */

// ============================================================================
// AUTHENTICATION CONTEXT
// ============================================================================

/**
 * Authentication hook for accessing user state and auth methods
 * @example
 * ```tsx
 * const { user, login, logout, isAuthenticated } = useAuth();
 * ```
 */
export { useAuth } from './useAuth';

/**
 * Authentication provider component for wrapping the app
 * @example
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export { AuthProvider } from './AuthContext';

/**
 * Authentication context instance (for advanced usage)
 */
export { AuthContext } from './AuthContextInstance';

/**
 * User interface type
 */
export type { User } from './authHelpers';

/**
 * Authentication context type
 */
export type { AuthContextType } from './AuthContextType';

/**
 * Authentication helper functions
 * @example
 * ```tsx
 * const roleName = getUserRoleName(user);
 * const isAdmin = isAdminUser(user);
 * ```
 */
export { normalizeUser, getUserRoleName, isAdminUser } from './authHelpers';

// ============================================================================
// LANGUAGE CONTEXT
// ============================================================================

/**
 * Language context hook and provider
 * @example
 * ```tsx
 * const { language, setLanguage } = useLanguage();
 * ```
 */
export { useLanguage, LanguageProvider } from './LanguageContext';

// ============================================================================
// NOTIFICATIONS CONTEXT
// ============================================================================
/**
 * Notifications context hook and provider (Admin only)
 * @example
 * ```tsx
 * const { notifications, unreadCount, markAsRead } = useNotifications();
 * ```
 */
export { useNotifications, NotificationsProvider } from './NotificationsContext';
