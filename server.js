// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('8d-JzsAEQb_z3nnq');
var isProduction = (process.env.NODE_ENV === 'production');
var port = (isProduction ? 80 : 8000);

var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

var server = http.createServer(function(request, response){
  var filePath = false;
  if(request.url == '/')
    filePath = 'public/index.html';
  else
    filePath = 'public' + request.url;
  
  var absPath = './' + filePath;
  serveStatic(response, cache, absPath);
});

server.listen(port, function(err){
  if(err){
    console.error(err);
    process.exit(-1);
  }
  console.log('listening on port ' + port);
});

function send404(response){
  response.writeHead(404, {'Content-Type': 'text/plain'});
  response.write('Error 404: resource not found.');
  response.end();
}

function sendFile(response, filePath, fileContents){
  response.writeHead(200, {"content-type": mime.lookup(path.basename(filePath))});
  response.end(fileContents);
}

function serveStatic(response, cache, absPath){
  if(cache[absPath])
    sendFile(response, absPath, cache[absPath]);
  else{
    fs.exists(absPath, function(exists){
      if(exists){
        fs.readFile(absPath, function(err, data){
          if(err)
            send404(response);
          else{
            cache[absPath] = data;
            sendFile(response, absPath, data);
          }
        });
      }
      else
        send404(response);
    });
  }
}