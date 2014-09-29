var fs = require('fs');
var optimize = require('../index.js');
var assert = require('assert');
var loadFile = require('./utils/loadFile');
var _ = require('lodash');

describe("Duplicate file", function(done){
  
  var cwd = __dirname;
  var base = cwd + '/basic/modules';
  var output = ['umd3', 'umd2', 'umd1', 'add', 'test'];
  
  before(function(done){
    var optimizer = optimize({
      baseUrl: base
    }, {
      umd: true
    });

    optimizer.on('dependency', function(dependency){
      loadFile(dependency, base, cwd, optimizer.addFile.bind(optimizer));
    });

    loadFile({path: base + '/test.js', name: 'test'}, base, cwd, function(err, file){
      optimizer.addFile(err, file);
      loadFile({path: base + '/add.js', name: 'add'}, base, cwd, function(err, file){        
        optimizer.addFile(err, file);
        
        optimizer.done(function(optimized){
          output = optimized;

          done();
        });
      });
    });
  });
  
  it("should have 5 items", function(){
    assert.equal(output.length, 5);
  });

  it("should have the test last", function(){
    assert.equal(output[4].name, 'test');
  });

  output.forEach(function(name){
    it(name + " should have a named module", function(){
      assert.equal(_.where(output, {name:name})[0].content, fs.readFileSync(cwd + '/basic/namedModules/' + name + '.js').toString('utf8'));
    });
  });
  
});