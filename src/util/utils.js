module.exports = {
  logger: require('tracer').console({
    level: 'info',
    format: '{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    preprocess: function (data) {
      data.title = data.title.toUpperCase();
    }
  }),

jwtSecretKey: process.env.JWT_SECRET || '87R2hj3vhr38vHR673vH3vhR673Vhr3V8H67v3FV6'
};