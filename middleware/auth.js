const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req,res, next) => {
    try{
        const token = req.cookies.jwt;
        if(!token) return res.redirect("/login");

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) return res.redirect("/login");
        req.user = user;
        res.locals.user = user;
        next();
    } catch (error) {
        res.clearCookie("jwt");
        res.redirect("/login");
    }
};

//role check authorize(admiin,doctor)
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return res.status(403).json({message: "You are not authorized to access this route"});
        }
        next();
    };
};


exports.optionalAuth = async (req, res, next) => {
  res.locals.user = null;
  try {
    const token = req.cookies.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (user) {
        req.user = user;
        res.locals.user = user;
      }
    }
  } catch (err) {
    res.clearCookie("token");
  }
  next();
};