const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.status(401).send("No token provided. Access denied");
    req.user = jwt.verify(token, process.env.JWTKEY);
    next();
  } catch (error) {
    console.log(error);
    
    res.status(400).send("Invalid token");
  }
};
