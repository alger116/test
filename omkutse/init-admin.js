// Initialize first admin user if no users exist
const initializeAdmin = () => {
  const users = JSON.parse(localStorage.getItem("users")) || [];

  if (users.length === 0) {
    // Create default admin user
    const adminUser = {
      id: Date.now(),
      username: "admin",
      password: "admin123", // In production, this should be hashed
      role: "admin",
    };

    users.push(adminUser);
    localStorage.setItem("users", JSON.stringify(users));

    console.log("Admin user created successfully");
    console.log("Username: admin");
    console.log("Password: admin123");
  }
};

// Run initialization
initializeAdmin();
