// Test cases for InviteModal email validation

// Test case 1: Team invitation (requireSameDomain = false)
const teamInviteTest = {
  emails: "cuonglv.21ad@vku.udn.vn, user@gmail.com, test@example.com",
  requireSameDomain: false,
  userDomain: "gmail.com", // Current user domain
  expectedResult: {
    isValid: true,
    validEmails: ["cuonglv.21ad@vku.udn.vn", "user@gmail.com", "test@example.com"],
    error: ""
  }
};

// Test case 2: Workspace invitation (requireSameDomain = true)
const workspaceInviteTest = {
  emails: "cuonglv.21ad@vku.udn.vn, user@gmail.com",
  requireSameDomain: true,
  userDomain: "gmail.com", // Current user domain
  expectedResult: {
    isValid: false,
    validEmails: ["user@gmail.com"],
    error: "Emails must be from gmail.com domain: cuonglv.21ad@vku.udn.vn."
  }
};

// Test case 3: Invalid email format
const invalidEmailTest = {
  emails: "invalid-email, user@gmail.com",
  requireSameDomain: false,
  userDomain: "gmail.com",
  expectedResult: {
    isValid: false,
    validEmails: ["user@gmail.com"],
    error: "Invalid email format: invalid-email."
  }
};

console.log("Test cases for InviteModal validation:");
console.log("1. Team invite (no domain restriction):", teamInviteTest);
console.log("2. Workspace invite (domain restriction):", workspaceInviteTest);
console.log("3. Invalid email format:", invalidEmailTest);
