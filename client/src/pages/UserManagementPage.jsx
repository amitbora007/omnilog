import React from 'react';
import AdminPage from './AdminPage.jsx';

/**
 * Backward-compatible wrapper for direct /admin/users deep links.
 * Renders the unified AdminPage pre-selected to the 'users' management tab.
 */
export default function UserManagementPage() {
  return <AdminPage defaultTab="users" />;
}
