const dummyPassword = (length) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?";
  let password = '';

  // Ensure at least one special character
  const specialChar = charset[Math.floor(Math.random() * "!@$%^&".length)];
  password += specialChar;

  // Generate the rest of the password
  for (let i = 1; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
  }

  return password;
};

module.exports = {
  dummyPassword,
};
