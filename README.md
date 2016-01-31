# koa-interceptor
对请求参数进行提前验证，简化业务逻辑对参数的验证。

## Usage
```js
const interceptor = require('koa-interceptor');

// POST -> /?name=koa-interceptor&contributors=1&author=Clunt&type=publish
router.post('/', interceptor({
    // Query Test
    name: /^koa-interceptor$/
    contributors: 'number',
    author: {
      test: 'enum',
      enum: ['Clunt']
      required: true
    },
    type: function(req, value) {
      // req.query, req.body
      // value => 'publish'
      return true;
    }
  }, {
    // Body Test
  }, {
    // Option for this route
  }), index);
```