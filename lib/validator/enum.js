exports = module.exports = function(req, source, value, rule) {
  const enums = source.enum || [];
  return !(enums.indexOf(value) < 0);
};
