// Remove chaves perigosas de objetos vindos do cliente para mitigar NoSQL
// injection (operadores como $gt, $where) e ataques via dot-notation.
// Feito in-place em req.body e req.params, pois no Express 5 req.query é
// somente-leitura (os filtros de query já são validados/coeridos por
// express-validator nas rotas).
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
