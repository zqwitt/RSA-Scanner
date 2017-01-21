(function(){
  var Quagga = require('quagga');

  var App = {
    init: function(){
      App.attachListeners();
    },
    attachListeners: function(){
      var self = this;
      var inputField = $('.input-field input[type=file]');
      inputField.on("change", function(e){
        if(e.target.files && e.target.files.length){
          App.decode(URL.createObjectURL(e.target.files[0]));
        }
      })
    },
    detachListeners: function(){
      var inputField = $('.input-field input[type=file]');
      inputField.off("change");
    },
    decode: function(src){
      var self = this,
          config = $.extend({},self.state,{src:src});

      Quagga.decodeSingle(config, function(result){});
    },
    state:{
      src: null,
      numOfWorkers: 1,  // Needs to be 0 when used within node
      inputStream: {
        size: 800  // restrict input-size to be 800px in width (long-side)
      },
      locator: {
             patchSize: "medium",
             halfSample: false
      },
      decoder: {
        readers: ["code_128_reader","ean_reader","ean_8_reader","code_39_reader","code_39_vin_reader","codabar_reader","upc_reader","upc_e_reader","i2of5_reader"] // List of active readers
      },
      locate: true,
    }
  };

  App.init();

  Quagga.onProcessed(function(result) {
      var drawingCtx = Quagga.canvas.ctx.overlay,
          drawingCanvas = Quagga.canvas.dom.overlay;

      if (result) {
          if (result.boxes) {
              drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
              result.boxes.filter(function (box) {
                  return box !== result.box;
              }).forEach(function (box) {
                  Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
              });
          }

          if (result.box) {
              Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
          }

          if (result.codeResult && result.codeResult.code) {
              Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
          }
      }
  });

  Quagga.onDetected(function(result) {
      var code = result.codeResult.code,
          $node,
          canvas = Quagga.canvas.dom.image;

      $node = $('<div class="thumbnail"><div class="imgWrapper"><img /></div><div class="caption"><h4 class="code"></h4></div></div>');
      $node.find("img").attr("src", canvas.toDataURL());
      $node.find("h4.code").html(code);
      console.log(code);
      $("#results").prepend($node);
  });
})();
