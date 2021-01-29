module.exports = function toFlat(array){
  let str = "";
  const a = Array.from(array);
  a.sort();
  for(let i = 0; i < a.length; i++) {
    if(a[i] === null) {
      str += "N";
    } else {
      str += a[i];
    }
  }
  return str;
};
