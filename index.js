'use strict';

exports.register = function (server, options, next) {
  server.on('tail', (response) => {
    if (response.response.variety !== 'view') {
      return;
    }
    
    const payload = response.response._payload._data;
    const path = response.path;

    const regex = /<[script|link][\w=\s\-\/"]+[href|src]="([\w\.\-_\/\?:]+)"[\w=\s\-\/"]*>/ig;
    const foundLinks = [];
    let matches = null;
    while ((matches = regex.exec(payload)) !== null) {
      const ref = matches[1];

      if (ref.indexOf('http://') === 0) {
        foundLinks.push(ref);
      }
    }

    if ( foundLinks.length > 0 ) {
      server.log(['info', 'secure-check'], { path, foundLinks});
    }
  });
  next();
};

exports.register.attributes = {
  name: 'secure-check',
  pkg: require('./package.json')
};
