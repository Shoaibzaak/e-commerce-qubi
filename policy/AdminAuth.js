module.exports = (req, res, next) => {
  if (req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length !== 2)
      return res.status(401).send({ code: "FAILED", message: "Invalid Token" });

    const userType = parts[0];
    if (userType !== "GHA")
      return res.status(401).send({ code: "Failed", message: "Unauthorized request" });

    const token = parts[1];
    Services.JwtService.verify(token, (error, user) => {
      if (error) return res.forbidden("Access Denied");

      const userId = Services.HashService.decrypt(user.id);
      const userRole = user.role; // Assuming the role is included in the token payload

      // Check if the user has the required role (admin or vendor)
      if (userRole !== "admin" && userRole !== "vendor") {
        return res.status(403).send({ code: "FAILED", message: "Insufficient privileges" });
      }

      const query = { _id: userId };
      Model.Admin.findOne(query)
        .then((foundUser) => {
          if (!foundUser) return res.forbidden("Unauthorized request");

          req.user = foundUser;

          // Check if the user is a vendor or admin based on the role
          if (userRole === "vendor") {
            req.isVendor = true;
            req.isAdmin = false;
          } else {
            req.isVendor = false;
            req.isAdmin = true;
          }

          next();
        })
        .catch((err) => {
          console.log(err);
          return res.status(404).json({ status: false, message: "User not found" });
        });
    });
  } else {
    return res.status(401).send({ code: "FAILED", message: "Token Missing" });
  }
};


// const Services = require("../services/index");
// const Model = require("../models/index");
// module.exports = (req, res, next) => {
//   if (req.headers && req.headers.authorization) {
//     const parts = req.headers.authorization.split(" ");
//     if (parts.length !== 2)
//       return res.status(401).send({ code: "FAILED", message: "Invalid Token" });
//     const userType = parts[0];
//     if (userType !== "GHA")
//       return res
//         .status(401)
//         .send({ code: "Failed", message: "Unauthorized request" });
//     const token = parts[1];
//     Services.JwtService.verify(token, (error, user) => {
//       if (error) return res.forbidden("Access Denied");
//       const query = { _id: Services.HashService.decrypt(user.id) };
//       Model.Admin.findOne(query)
//         .then((user) => {
//           if (!user) return res.forbidden("Unauthorized request");
//           req.user = user;
//           next();
//         })
//         .catch((err) => {
//           console.log(err);
//           return res
//             .status(404)
//             .json({ status: false, message: "User not found" });
//         });
//     });
//   } else {
//     return res.status(401).send({ code: "FAILED", message: "Token Missing" });
//   }
// };
