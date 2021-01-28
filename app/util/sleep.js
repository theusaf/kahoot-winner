module.exports = function sleep(n){
  return new Promise(function(resolve) {
    setTimeout(resolve,n * 1000);
  });
};
