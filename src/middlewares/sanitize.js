const FORBIDDEN_KEY = /^\$|\./;

const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    value.forEach(sanitizeValue);
    return;
  }

  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (FORBIDDEN_KEY.test(key)) {
        delete value[key];
        continue;
      }
      sanitizeValue(value[key]);
    }
  }
};

const sanitize = (req, res, next) => {
  sanitizeValue(req.body);
  sanitizeValue(req.params);
  next();
};

module.exports = sanitize;
