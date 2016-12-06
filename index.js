'use strict';
const util = require('util');
var P2PSpider = require('./lib');
const MIN_LEN = 100*1024*1024;

function buffer2String(src){
	if(!src){
		return src;
	}
	if(util.isBuffer(src)){
        return src.toString();
	}
	if(util.isObject(src)){
       for(var key in src){
       	  if(key=='pieces'){
       	  	delete src[key];
       	  	continue;
       	  }
      	  src[key]=buffer2String(src[key]);
	   }
	   return src;
	}else {
	   return src;
	}
}
var count =0;
var p2p = P2PSpider({
    nodesMaxSize: 200,   // be careful
    maxConnections: 400, // be careful
    timeout: 5000
});

p2p.ignore(function (infohash, rinfo, callback) {
    var theInfohashIsExistsInDatabase = false;
    callback(theInfohashIsExistsInDatabase);
});

p2p.on('metadata', function (metadata) {
	count++;
	buffer2String(metadata);
	var isPass = false;
	var oInfo = metadata.info;
	var oFileArr = oInfo.files;
	if(oInfo.length &&  oInfo.name){
		oFileArr = oFileArr || [];
		var oFile = {};
		oFile.length = oInfo.length;
		oFile.path = [oInfo.name];
		oFileArr.push(oFile);
		// console.log('no file:'+JSON.stringify(oFileArr));
	}
	var oVideoReg = /\.(avi|mpg|divx|div|xvid|mpeg|wmv|asf|asx|mpe|m1v|m2v|dat|mp4|m4v|dv|dif|mjpg|mjpeg|mov|qt|rm|rmvb|3gp|3g2|h261|h264|yuv|raw|flv|swf|vob|mkv|ogm)$/ig;
	var oZipReg = /\.(rar|cab|arj|lzh|ace|7-zip|tar|gzip|uue|bz2|jar|iso|z)$/ig;
    for (var i = 0; i < oFileArr.length; i++) {
    	var oFile = oFileArr[i];
    	if(oFile.length > MIN_LEN && (oVideoReg.test(oFile.path[0]) || oZipReg.test(oFile.path[0]))){
			isPass = true;
			break;
    	}
    };
    if(!isPass){
		return ;
    }
	var oLog = {}
	oLog.time = new Date().getTime();
	oLog.index = count;
	oLog.data = JSON.stringify(metadata);
    console.log(JSON.stringify(oLog));
});

p2p.listen(6881, '0.0.0.0');