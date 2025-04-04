// Role hierarchy definition
export const ROLE_HIERARCHY = {
  SUPER_ADMIN: ["ADMIN", "MANAGER", "USER"],
  ADMIN: ["MANAGER", "USER"],
  MANAGER: ["USER"],
  USER: [],
};

// Role permissions definition
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ["all"],
  ADMIN: ["manage_users", "view_analytics", "edit_content", "manage_roles"],
  MANAGER: ["view_analytics", "edit_content"],
  USER: ["view_content"],
};

// Utility functions for role management
export const hasPermission = (userRole, requiredPermission) => {
  if (!userRole || !ROLE_PERMISSIONS[userRole]) return false;
  return (
    ROLE_PERMISSIONS[userRole].includes("all") ||
    ROLE_PERMISSIONS[userRole].includes(requiredPermission)
  );
};

export const canManageRole = (userRole, targetRole) => {
  if (!userRole || !ROLE_HIERARCHY[userRole]) return false;
  return ROLE_HIERARCHY[userRole].includes(targetRole);
};

export const isValidRole = (role) => {
  return Object.keys(ROLE_HIERARCHY).includes(role);
};

// Default role for new users
export const DEFAULT_ROLE = "USER";

// Role display names for UI
export const ROLE_DISPLAY_NAMES = {
  SUPER_ADMIN: "Peaadministraator",
  ADMIN: "Administraator",
  MANAGER: "Haldur",
  USER: "Tavakasutaja",
};
