'use strict';

const generateKey = args => (
  args.map(x => x.toString() + ':' + typeof(x)).join('|')
);

const memoize = fn => {
  const cache =  new Map();
  return async (...args) => {
    if (typeof(args[args.length - 1]) === 'function') {
      const cb = args.pop();
      const key = generateKey(args);
      if (cache.has(key)) {
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
            cache.set(key, res);
            cb(null, res);
          } catch (err) {
            cb(err, null)
          }
      }
    } else {
      const key = generateKey(args);
      if (cache.has(key)) {
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
      cache.set(key, res);
      return res;
    }
  };
};