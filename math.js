
var R = require('./r');
var regression = require('regression');

var std = function (set) {
  var n = set.length;
  var m = mean(sum(set), n);

  return Math.sqrt(sum(set, function (acc, x) {
    return Math.pow((x - m), 2);
  }) / (n - 1));

};

var sum = function (set, fn) {
  fn = fn || function (acc, x) {
    return acc + x;
  };
  return set.reduce(fn, 0);
};

var mean = function (x, n) {
  return x / n;
};

var random = function (size) {
  var results = [];
  while(size--) {
    results.push(Math.random() * 100);
  }
  return results;
};

// var set = random(Math.round(Math.random() * 100));
var set = random(10);
var set2 = set.map(function (x) {
  return x + Math.round((Math.random() * 1000) / 10);
  // return x + 1;
});

console.log('sum', sum(set));
console.log('mean', mean(sum(set), set.length));
console.log('std', std(set))

console.log('R', R({set: set, set2: set2}, 'set', 'set2'));

var data = set.map(function (x, i) {
  return [x, set2[i]];
});
console.log('Regressions:');
console.log();
console.log('linear', regression('linear', data));

console.log();
console.log('exponential', regression('exponential', data));

console.log();
console.log('logarithmic', regression('logarithmic', data));

console.log();
console.log('power', regression('power', data));

console.log();
console.log('polynomial', regression('polynomial', data));
