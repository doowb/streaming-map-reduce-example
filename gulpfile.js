var gulp = require('gulp');
var through = require('through2');
var es = require('event-stream');

/**
 * make each word in a line to an object `{key: word, count: 1}`
 *
 * ```js
 *   var line = "This is a line that contains words that might have multiple words."
 *   return [
 *    { key: "This", count : 1},
 *    { key: "is", count : 1},
 *    { key: "a", count : 1},
 *    { key: "line", count : 1},
 *    { key: "that", count : 1},
 *    { key: "contains", count : 1},
 *    { key: "words", count : 1},
 *    { key: "that", count : 1},
 *    { key: "might", count : 1},
 *    { key: "have", count : 1},
 *    { key: "multiple", count : 1},
 *    { key: "words.", count : 1},
 *   ]
 * ```
 */

var map = function (line) {
  return line.split(' ').map(function (word) {
    return { key: word, count: 1};
  });
};

var mapObj = function (line) {
  return Object.keys(line).map(function (key) {
    return { key: key, count: line[key] };
  });
};

/**
 * reduce a list of words into an object of `{word: count}`
 *
 * ```js
 *   var words = [
 *    { key: "This", count : 1},
 *    { key: "is", count : 1},
 *    { key: "a", count : 1},
 *    { key: "line", count : 1},
 *    { key: "that", count : 1},
 *    { key: "contains", count : 1},
 *    { key: "words", count : 1},
 *    { key: "that", count : 1},
 *    { key: "might", count : 1},
 *    { key: "have", count : 1},
 *    { key: "multiple", count : 1},
 *    { key: "words.", count : 1},
 *   ]
 *   return {
 *     "This": 1,
 *     "is": 1,
 *     "a": 1,
 *     "line": 1,
 *     "that": 2,
 *     "contains": 1,
 *     "words": 1,
 *     "might": 1,
 *     "have": 1,
 *     "multiple": 1,
 *     "words.": 1
 *   }
 * ```
 */

var reduce = function (words, current) {
  return words.reduce(function (acc, word) {
    acc[word.key] = (acc[word.key] || 0) + word.count;
    return acc;
  }, current || {});
};

// plugin that makes data objects for each line containing its word counts
var mapper = function () {
  return through.obj(function (file, enc, cb) {
    console.log('reading', file.path);
    var stream = this;
    file.contents
      // split on lines
      .pipe(es.split())
      .pipe(es.map(function (data, next) {
        if (data && data.length)
          // push counted word objects into the stream
          stream.push(reduce(map(data)));
        next();
      }))
      .on('end', function () {
        console.log('finished reading', file.path);
        cb();
      });
  });
};

// map reduced object into array of `{key: word, count: count}` objects for the reducer use
var joiner = function () {
  return through.obj(function (line, enc, cb) {
    this.push(mapObj(line));
    cb();
  });
};

// reduce all the objects from each line into a single object
var reducer = function () {
  var results = {};
  return through.obj(function (line, enc, cb) {
    reduce(line, results);
    cb();
  }, function (cb) {
    this.push(results);
    cb();
  });
}

gulp.task('default', function () {
  return gulp.src('words*.txt', { buffer: false })
    .pipe(mapper())
    .pipe(joiner())
    .pipe(reducer())
    .on('data', function (data) {
      console.log('data', data);
    })
    .on('end', function () {
      console.log('done');
    })
    .on('error', function (err) {
      console.log('error', err);
    });
});
