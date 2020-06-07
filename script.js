window.onload = useWebGl;

function useWebGl() {
  setUpWebGlCanvas();
}

function setUpWebGlCanvas() {
  const canvas = document.querySelector("#glCanvas");
  const webGlContext = canvas.getContext("webgl");
  if (!webGlContext) {
    alert("Looks like WebGL isn't supported on this browser.");
    return;
  }
  // set colour:
  webGlContext.clearColor(0.0, 0.0, 0.0, 1.0);
  // and now use that colour:
  webGlContext.clear(webGlContext.COLOR_BUFFER_BIT);
}
