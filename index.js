'use strict';

exports.register = function (server, options, next) {
  server.on('tail', (response) => {
    if (response.response.variety !== 'view') {
      return;
    }
    
    const payload = response.response._payload._data;
    const path = response.path;

    const regex = /<(img|script|link)[\w=\s\-\/\+"]+(?:data-img|href|src)="([\w\.\-_\/\?:]+)"[\w=\s\-\/"]*>/ig;
    const foundLinks = {};
    let matches = null;
    while ((matches = regex.exec(payload)) !== null) {
      const type = matches[1];
      const ref = matches[2];

      if (ref.indexOf('http://') === 0) {
        if (!foundLinks[type]) {
          foundLinks[type] = [];
        }
        foundLinks[type].push(ref);
      }
    }

    if ( Object.getOwnPropertyNames(foundLinks).length ) {
      server.log(['info', 'secure-check'], { path, foundLinks});
    }
  });
  next();
};

exports.register.attributes = {
  name: 'secure-check',
  pkg: require('./package.json')
};
