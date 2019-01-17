'use strict';

const generateKey = args => (
  args.map(x => x.toString() + ':' + typeof(x)).join('|')
);

const memoize = (fn, time) => {

  const cache =  new Map();
  const timers = {};

  const timeDeleteKey = key => timers[key] = setTimeout(() => {
    console.dir(`Delete :${key}`),
    cache.delete(key);
  }, time);

  const memoized = async (...args) => {

    if (typeof args[args.length - 1] === 'function') {
      const cb = args.pop();
      const key = generateKey(args);
      if (cache.has(key)) {
        clearTimeout(timers[key]);
        timeDeleteKey(key);
        console.log('From cache:');
        cb(null, cache.get(key));
      } else {
        const promise = new Promise((resolve, reject) =>
          fn(...args, (err, data) => {
            if (err) reject(err);
            else resolve(data);
          }));
        console.log('Calculate:');
        try {
          const res = await promise;
          timeDeleteKey(key);
          cache.set(key, res);
          cb(null, res);
        } catch (err) {
          cb(err);
        }
      }
    } else {
      const key = generateKey(args);
      if (cache.has(key)) {
        clearTimeout(timers[key]);
        timeDeleteKey(key);
        console.log('From cache:');
        return cache.get(key);
      }
      const promise = new Promise((resolve, reject) =>
        fn(...args, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        }));
      console.log('Calculate:');
      const res = await promise;
      timeDeleteKey(key);
      cache.set(key, res);
      return res;
    }
  };

  const methods = {
    clear() {
      console.log('clean');
      cache.clear();
      return this;
    },
    get(...args) {
      const key = generateKey(args);
      if (!cache.has(key)) console.log(`No value with key: ${key}`);
      else console.log(cache.get(key));
      return this;
    },
    timeout(msec) {
      if (timer) clearTimeout(timer);
      const timer = setTimeout(() => this.clear(), msec);
      return this;
    },
    del(...args) {
      const key = generateKey(args);
      if (cache.delete(key)) console.log(`Delete value with key: ${args}`);
      else console.log(`No value with key: ${args}`);
      return this;
    },
    add(value, ...args) {
      const key = generateKey(args);
      cache.set(key, value);
      console.log(`Add ${value} with key ${args}`);
      return this;
    }
  };

  return Object.assign(memoized, methods);
};