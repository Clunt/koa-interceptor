'use strict';
const validator = require('./lib/validator');

const defaultRule = {
  required: false
};

const res = {
  status: {
    code: 1
  }
};

exports = module.exports = function serve(query, body, opts) {
  query = query || {};
  body = body || {};
  opts = opts || {};
  return function* interceptor(next) {
    const waitForTest = [];
    for (let key in query) {
      waitForTest.push({
        _key: key,
        _type: 'query',
        test: query[key]
      });
    }
    for (let key in body) {
      waitForTest.push({
        _key: key,
        _type: 'body',
        test: body[key]
      });
    }
    for (let i = 0; i < waitForTest.length; i++) {
      let item = waitForTest[i];
      if (!test(this.request, item, this.request[item._type][item._key], item.test)) {
        return this.body = opts.res || res;
      }
    }
    yield next;
  }
};

/**
 * test
 * @param  {Object} req  [query, body]
 * @param  {Object} rule [key, type, test]
 * @return {Boolean}     {pass: true, error: false}
 */
function test(req, source, value, rule) {
  value = typeof value !== 'undefined' ? value : '';
  switch (typeof rule) {
    case 'string':
      return testString(req, Object.assign({}, defaultRule, source), value, rule);
    case 'object':
      return testObject(req, source, value, rule);
    case 'function':
      if (value.length === 0) return !source.required;
      return rule(value, req);
  };
}

function testString(req, source, value, rule) {
  if (value.length === 0) return !source.required;
  switch (typeof validator[rule]) {
    case 'function':
      return validator[rule](req, source, value, rule);
    case 'object':
      return validator[rule].test(value);
    default:
      return true;
  }
}

function testObject(req, source, value, rule) {
  if (value.length === 0) return !rule.required;
  if (typeof rule.test === 'string') {
    // 普通对象，针对字符串的拓展
    return testString(req, Object.assign({}, defaultRule, rule), value, rule.test);
  } else if (typeof rule.test === 'function') {
    // 正则 or 函数
    return rule.test(value, req);
  } else {
    return true;
  }
}
