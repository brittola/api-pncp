const calcDigit = (digits, weights) => {
  const sum = digits.reduce((acc, d, i) => acc + d * weights[i], 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
};

const validateCnpj = (cnpj) => {
  if (!/^\d{14}$/.test(cnpj)) return false;

  const digits = cnpj.split('').map(Number);

  if (digits.every((d) => d === digits[0])) return false;

  const first = calcDigit(digits.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (first !== digits[12]) return false;

  const second = calcDigit(digits.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (second !== digits[13]) return false;

  return true;
};

module.exports = validateCnpj;
