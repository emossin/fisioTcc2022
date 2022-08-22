



module.exports.addNovoTempo = function(tempo) {
  arrayCount = arrayCount + 1;
     tempos[arrayCount] = tempo

    let fLen = tempos.length;

    console.log("fLen: " + fLen);
    for (let i = 0; i < fLen; i++) {
      console.log(tempos[i]+", ");
    }


};


module.exports.zeraListaTempos = function() {
  arrayCount = 0;
  tempos = new Array();
};
