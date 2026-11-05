const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authentication required', code: 'TOKEN_MISSING' });
  }

  try {
    // jwt.verify checks both the signature and the exp claim.
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Session expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Invalid token', code: 'TOKEN_INVALID' });
  }
}

module.exports = { requireAuth };
