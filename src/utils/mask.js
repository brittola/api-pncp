const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return email;
  const [user, domain] = email.split('@');
  if (!domain) return '***';
  const visible = user.slice(0, 1);
  return `${visible}${'*'.repeat(Math.max(user.length - 1, 1))}@${domain}`;
};

const maskCnpj = (cnpj) => {
  if (!cnpj || typeof cnpj !== 'string' || cnpj.length !== 14) return '**************';
  return `${cnpj.slice(0, 2)}******${cnpj.slice(-4)}`;
};

module.exports = { maskEmail, maskCnpj };
