module.exports = (req, res, next) => {
    // Check if req.isAdmin is true
    if (req.isVendor) {
        // User is an admin, proceed to the next middleware or route handler
        next();
      } else {
        // User is not an admin, send a 403 Forbidden response
        return res.status(403).send({ code: "FAILED", message: "Insufficient privileges for vendor" });
      }
  };