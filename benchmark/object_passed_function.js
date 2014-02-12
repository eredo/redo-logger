var Benchmark = require('benchmark');
var suite = new Benchmark.Suite();
var log = function() {};

suite
  .add('objects', function() {
    log({its: 'an object', thats: 'awesome'});
  })
  .add('only numbers', function() {
    log(1, 2, 3, 4);
  })
  .add('only strings', function() {
    log('test', 'doesnt', 'matter');
  })
  .add('mixed types strings numbers', function() {
    log(1, 'two', 3);
  })
  .add('arrays', function() {
    log([1, 2, 3, 4]);
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  })
  .run();
