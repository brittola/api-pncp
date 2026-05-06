const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const spec = yaml.load(
  fs.readFileSync(path.join(__dirname, '../docs/swagger.yaml'), 'utf8')
);

module.exports = spec;
