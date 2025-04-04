import { auth, db } from "./firebase-config.js";
import { hasPermission, isValidRole } from "./role-config.js";
import { doc, getDoc } from "firebase/firestore";

// Middleware to validate user authentication and role
export const validateAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    // Get user document with role information
    const userDoc = await getDoc(doc(db, "users", decodedToken.uid));
    if (!userDoc.exists()) {
      return res.status(403).json({ error: "User not found" });
    }

    const userData = userDoc.data();
    if (!userData.role || !isValidRole(userData.role)) {
      return res.status(403).json({ error: "Invalid role assignment" });
    }

    // Attach user and role to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userData.role,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
};

// Middleware to check specific permissions
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};

// Middleware to validate role hierarchy for role management
export const validateRoleManagement = (req, res, next) => {
  const { targetRole } = req.body;
  const userRole = req.user?.role;

  if (!userRole || !targetRole) {
    return res.status(400).json({ error: "Invalid request" });
  }

  if (!isValidRole(targetRole)) {
    return res.status(400).json({ error: "Invalid target role" });
  }

  if (!canManageRole(userRole, targetRole)) {
    return res
      .status(403)
      .json({ error: "Insufficient permissions to manage this role" });
  }

  next();
};
