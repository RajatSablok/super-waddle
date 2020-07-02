const JWT = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("auth-token");
  if (!token)
    return res.status(400).json({
      message: "Access Denied!, no token entered",
    });

  try {
    const verified = JWT.verify(token, process.env.JWT_KEY);

    req.user = verified;
    // console.log(verified);

    next();
    // console.log("next");
  } catch (err) {
    res.status(400).json({
      error: "Auth failed, check auth-token",
    });
  }
};
