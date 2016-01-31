/*!
 * koa-interceptor <https://github.com/Clunt/koa-interceptor>
 * A koa request interceptor middleware
 *
 * Copyright (c) 2016 Clunt.
 * Released under the MIT license.
 */

'use strict';

var should = require('should');
var koa = require('koa');
var http = require('http');
var request = require('supertest');
var interceptor = require('../index');
var bodyParser = require('koa-bodyparser');
var router = require('koa-router');
var assert = require('assert');
var _ = require('lodash');

describe('koa-interceptor', function () {
  var success = 'success';
  var error = {status: {code:1}};

  it('should work without any options', function (done) {
    var app = koa();
    var route = router();

    route.get('/', interceptor({}, {}, {}), function() {
      this.body = success;
    });

    app.use(route.routes());
    request(http.createServer(app.callback()))
      .get('/')
      .expect(success)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  it('should work with String', function (done) {
    var app = koa();
    var route = router();

    route.get('/', interceptor({
      email: 'email',
      contributors: 'posint'
    }), function() {
      this.body = success;
    });

    app.use(route.routes());
    request(http.createServer(app.callback()))
      .get('/?name=koa-interceptor&contributors=1&author=Clunt&type=publish&email=clunt@foxmail.com')
      .expect(success)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  it('should work with RegExp', function (done) {
    var app = koa();
    var route = router();

    route.get('/', interceptor({
      name: /^koa-interceptor$/,
      email: /^clunt@foxmail\.com$/,
      contributors: /^1$/,
      author: /^Clunt$/,
      type: /^publish$/
    }), function() {
      this.body = success;
    });

    app.use(route.routes());
    request(http.createServer(app.callback()))
      .get('/?name=koa-interceptor&contributors=1&author=Clunt&type=publish&email=clunt@foxmail.com')
      .expect(success)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  it('should work with Object', function (done) {
    var app = koa();
    var route = router();

    route.get('/', interceptor({
      name: {
        required: true
      }
    }), function() {
      this.body = success;
    });

    app.use(route.routes());
    request(http.createServer(app.callback()))
      .get('/?name=name')
      .expect(success)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  it('should work with POST', function (done) {
    var app = koa();
    var route = router();

    route.post('/', interceptor(null, {
      name: {
        required: true
      }
    }), function() {
      this.body = success;
    });

    app.use(bodyParser());
    app.use(route.routes());
    request(http.createServer(app.callback()))
      .post('/')
      .send({name: 'Clunt'})
      .expect(success)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  it('should work with Full Option', function (done) {
    var app = koa();
    var route = router();

    route.post('/', interceptor({
      ip: 'none',
      empty: 'fun'
    }, {
      method: {
        test: 'enum',
        enum: ['POST', 'GET'],
        required: true
      },
      max: function(value, req) {
        return value > req.body.min;
      },
      min: function(value, req) {
        return value < req.body.max;
      },
      all: function(value, req) {
        return true;
      },
      mix: {
        test: function(value, req) {
          return true;
        },
        required: true
      }
    }), function() {
      this.body = success;
    });

    app.use(bodyParser());
    app.use(route.routes());
    request(http.createServer(app.callback()))
      .post('/?ip=196.128.0.1')
      .send({method: 'GET', mix: 0, max: 10, min: 5})
      .expect(success)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  it('should work with ERROR', function (done) {
    var app = koa();
    var route = router();

    route.get('/', interceptor({
      version: {
        test: 'enum',
      }
    }), function() {
      this.body = success;
    });

    app.use(bodyParser());
    app.use(route.routes());
    request(http.createServer(app.callback()))
      .get('/?version=0.0.1')
      .expect(error)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  it('should work with custorm ERROR', function (done) {
    var app = koa();
    var route = router();

    route.get('/', interceptor({
      name: {
        required: true
      }
    }, null, {
      res: '错误数据'
    }), function() {
      this.body = success;
    });

    app.use(bodyParser());
    app.use(route.routes());
    request(http.createServer(app.callback()))
      .get('/')
      .expect('错误数据')
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });
});
