/* stage.js — keeps the 1600×900 stage fitted to one screen (fluid + scroll on phones). */
(function () {
  var stage = document.getElementById('stage');
  AK.isMobile = false;
  function fit() {
    var W = innerWidth, H = innerHeight;
    if (W < 820) {
      AK.isMobile = true;
      Object.assign(stage.style, { width: '100%', height: '100%', left: '0', top: '0', margin: '0', transform: 'none', overflowY: 'auto' });
    } else {
      AK.isMobile = false;
      var k = Math.min(W / 1600, H / 900);
      Object.assign(stage.style, { width: '1600px', height: '900px', left: '50%', top: '50%', margin: '-450px 0 0 -800px', transform: 'scale(' + k + ')', overflowY: 'visible' });
    }
  }
  addEventListener('resize', fit);
  fit();
})();
