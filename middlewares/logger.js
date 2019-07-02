logger = function(req, res, next){
    console.log('Loggging...');
    next();
};

module.exports = logger;