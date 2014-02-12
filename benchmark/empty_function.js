var Benchmark = require('benchmark');
var suite = new Benchmark.Suite();

var level = 1000,
    nullFunction = function() {},
    evaluatedFunction = function() {
      if (level > 2000) {

      }
    },
    wrapperOne = function() {
      var i = 0;
      return i++;
    },
    wrapperTwo = function() {
      var x = 0;
      return x--;
    };

suite
  .add('stripped', function() {
    wrapperOne();
    wrapperTwo();
  })
  .add('emptyFunction', function() {
    wrapperOne();
    nullFunction('test', 'blub');
    wrapperTwo();
  })
  .add('evaluatedFunction', function() {
    wrapperOne();
    evaluatedFunction('test', 'blub');
    wrapperTwo();
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  })
  .run();
