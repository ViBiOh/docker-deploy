import test from 'ava';
import sinon from 'sinon';
import Fetch from 'js-fetch';
import btoa from '../Tools/btoa';
import localStorageService from './LocalStorageService';
import DockerService, { authStorage } from './DockerService';

let data;
let getItemSpy;

test.beforeEach(() => {
  data = null;

  function send(url, auth, method, content) {
    if (data) {
      return Promise.resolve(data);
    }

    return Promise.resolve({
      url,
      auth,
      content,
      method,
    });
  }

  const fetch = (url, auth) => ({
    get: () => send(url, auth, 'get'),
    post: body => send(url, auth, 'post', body),
    put: body => send(url, auth, 'put', body),
    delete: () => send(url, auth, 'delete'),
  });

  sinon.stub(localStorageService, 'isEnabled').callsFake(() => false);
  getItemSpy = sinon.spy(localStorageService, 'getItem');

  sinon.stub(Fetch, 'url').callsFake(url => ({
    auth: auth => ({
      ...fetch(url, auth),
      error: () => fetch(url, auth),
    }),
  }));
});

test.afterEach(() => {
  Fetch.url.restore();
  localStorageService.isEnabled.restore();
  localStorageService.getItem.restore();
});

test.serial('should determine if already logged', (t) => {
  sinon.stub(localStorageService, 'getItem').callsFake(() => 'token');

  t.true(DockerService.isLogged());
  localStorageService.getItem.restore();
});

test.serial('should determine if not already logged', (t) => {
  sinon.stub(localStorageService, 'getItem').callsFake(() => '');

  t.false(DockerService.isLogged());
  localStorageService.getItem.restore();
});

test.serial('should login with given username and password', t =>
  DockerService.login('admin', 'password').then((result) => {
    t.true(/auth$/.test(result.url));
    t.is(result.auth, `Basic ${btoa('admin:password')}`);
  }));

test.serial('should store token in localStorage on login', (t) => {
  const setItemSpy = sinon.spy(localStorageService, 'setItem');

  return DockerService.login('admin', 'password').then(() => {
    localStorageService.setItem.restore();
    t.true(setItemSpy.calledWith(authStorage, `Basic ${btoa('admin:password')}`));
  });
});

test.serial('should drop stored token from localStorage on logout', (t) => {
  const removeItemSpy = sinon.spy(localStorageService, 'removeItem');

  return DockerService.logout().then(() => {
    localStorageService.removeItem.restore();
    t.true(removeItemSpy.calledWith(authStorage));
  });
});

test.serial('should list containers with auth', t => DockerService.containers()
  .then(() => {
    localStorageService.getItem.restore();
    t.true(getItemSpy.calledWith(authStorage));
  });
);

test.serial('should return results when listing containers', (t) => {
  data = {
    results: [{
      id: 1,
    }],
  };

  return DockerService.containers().then(value => t.deepEqual(value, [{ id: 1 }]));
});

test.serial('should create container with given args', t =>
  DockerService.create('test', 'composeFileContent').then((result) => {
    t.is(result.url).to.match(/containers\/test\/$/);
    t.is(result.content, 'composeFileContent');
  }),
);

[
  { method: 'infos', args: ['test'], httpMethod: 'get', url: /containers\/test\/$/ },
  {
    method: 'create',
    args: [
      'test',
      'composeFileContent',
    ],
    httpMethod: 'post',
    url: /containers\/test\/$/,
  },
  { method: 'start', args: ['test'], httpMethod: 'post', url: /containers\/test\/start$/ },
  { method: 'stop', args: ['test'], httpMethod: 'post', url: /containers\/test\/stop$/ },
  { method: 'restart', args: ['test'], httpMethod: 'post', url: /containers\/test\/restart$/ },
  { method: 'delete', args: ['test'], httpMethod: 'delete', url: /containers\/test\/$/ },
].forEach((param) => {
  test.serial(`for ${param.method}`, t => DockerService[param.method].apply(null, param.args)
    .then((result) => {
      t.is(result.method, param.httpMethod);
      t.true(param.url.test(result.url));
      t.true(getItemSpy.calledWith(authStorage));
    }),
  );
});

test.serial('should send auth on logs opening', (t) => {
  const onMessage = sinon.spy();
  const wsSend = sinon.spy();
  const getItemStub = sinon.stub(localStorageService, 'getItem').callsFake(() => 'token');

  global.WebSocket = () => ({
    send: wsSend,
    onmessage: onMessage,
  });

  DockerService.logs('test', onMessage).onopen();
  localStorageService.getItemStub.restore();

  t.true(wsSend.calledWith('token'));
  t.true(getItemStub.calledWith(authStorage));
});

test.serial('should call onMessage when receiving', (t) => {
  const onMessage = sinon.spy();
  const wsSend = sinon.spy();
  sinon.stub(localStorageService, 'getItem').callsFake(() => 'token');

  global.WebSocket = () => ({
    send: wsSend,
    onmessage: onMessage,
  });

  DockerService.logs('test', onMessage).onmessage({ data: 'test' });
  localStorageService.getItem.restore();

  t.true(onMessage.calledWith('test'));
});

test.serial('should send auth on events opening', (t) => {
  const onMessage = sinon.spy();
  const wsSend = sinon.spy();
  const getItemStub = sinon.stub(localStorageService, 'getItem').callsFake(() => 'token');

  global.WebSocket = () => ({
    send: wsSend,
    onmessage: onMessage,
  });

  DockerService.events(onMessage).onopen();
  localStorageService.getItemStub.restore();

  t.true(wsSend.calledWith('token'));
  t.true(getItemStub.calledWith(authStorage));
});

test.serial('should send auth on events opening', (t) => {
  const onMessage = sinon.spy();
  const wsSend = sinon.spy();
  sinon.stub(localStorageService, 'getItem').callsFake(() => 'token');

  global.WebSocket = () => ({
    send: wsSend,
    onmessage: onMessage,
  });

  DockerService.events(onMessage).onmessage({ data: 'test' });
  localStorageService.getItem.restore();

  t.true(onMessage.calledWith('test'));
});
