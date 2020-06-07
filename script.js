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

  const vertexShaderCode = getVertexShaderCode();
  const fragmentShaderCode = getFragmentShaderCode();
  const shaderProgram = initShaderProgram(
    webGlContext,
    vertexShaderCode,
    fragmentShaderCode
  );

  const programInfo = getProgramInfo(webGlContext, shaderProgram);
  const buffers = initializeBuffers(webGlContext);
  drawScene(webGlContext, programInfo, buffers);
}

function getVertexShaderCode() {
  const vertexShaderCode = `
    attribute vec4 aVertexPosition;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `;
  return vertexShaderCode;
}

function getFragmentShaderCode() {
  const fragmentShaderCode = `
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
  `;
  return fragmentShaderCode;
}

function initShaderProgram(webGlContext, vertexShaderCode, fragmentShaderCode) {
  const vertexShader = loadShader(
    webGlContext,
    webGlContext.VERTEX_SHADER,
    vertexShaderCode
  );

  const fragmentShader = loadShader(
    webGlContext,
    webGlContext.FRAGMENT_SHADER,
    fragmentShaderCode
  );

  const shaderProgram = createShaderProgram(
    webGlContext,
    vertexShader,
    fragmentShader
  );

  const creatingShaderProgramWorked = webGlContext.getProgramParameter(
    shaderProgram,
    webGlContext.LINK_STATUS
  );

  if (!creatingShaderProgramWorked) {
    alert(
      "Shader program init failed: " +
        webGlContext.getProgramInfoLog(shaderProgram)
    );
    return null;
  }

  return shaderProgram;
}

function loadShader(webGlContext, type, source) {
  const shader = webGlContext.createShader(type);
  webGlContext.shaderSource(shader, source);
  webGlContext.compileShader(shader);

  const compiledOk = webGlContext.getShaderParameter(
    shader,
    webGlContext.COMPILE_STATUS
  );

  if (!compiledOk) {
    alert("Error compiling shaders: " + webGlContext.getShaderInfoLog(shader));
    webGlContext.deleteShader(shader);
    return null;
  }

  return shader;
}

function createShaderProgram(webGlContext, vShader, fShader) {
  const shaderProgram = webGlContext.createProgram();
  webGlContext.attachShader(shaderProgram, vShader); // vertex shader
  webGlContext.attachShader(shaderProgram, fShader); // fragment shader
  webGlContext.linkProgram(shaderProgram);
  return shaderProgram;
}

function getProgramInfo(webGlContext, shaderProgram) {
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: webGlContext.getAttribLocation(
        shaderProgram,
        "aVertexPosition"
      ),
    },
    uniformLocations: {
      projectionMatrix: webGlContext.getUniformLocation(
        shaderProgram,
        "uProjectionMatrix"
      ),
      modelViewMatrix: webGlContext.getUniformLocation(
        shaderProgram,
        "uModelViewMatrix"
      ),
    },
  };
  return programInfo;
}

function initializeBuffers(webGlContext) {
  const positionBuffer = webGlContext.createBuffer();
  // will apply buffer operations to positionBuffer:
  webGlContext.bindBuffer(webGlContext.ARRAY_BUFFER, positionBuffer);

  const squarePositions = [-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0];

  // to build the shape: positions array -> Float32Array -> fill current buffer in WebGL
  webGlContext.bufferData(
    webGlContext.ARRAY_BUFFER,
    new Float32Array(squarePositions),
    webGlContext.STATIC_DRAW
  );

  return {
    position: positionBuffer,
  };
}

function drawScene(webGlContext, programInfo, buffers) {
  webGlContext.clearColor(0.0, 0.0, 0.0, 1.0);
  webGlContext.clearDepth(1.0); // clear everything
  webGlContext.enable(webGlContext.DEPTH_TEST);
  webGlContext.depthFunc(webGlContext.LEQUAL); // near things obscure far things

  // clear canvas before drawing:
  webGlContext.clear(
    webGlContext.COLOR_BUFFER_BIT | webGlContext.DEPTH_BUFFER_BIT
  );

  // create camera perspective matrix projectionMatrix with these settings:
  const fieldOfView = (45 * Math.PI) / 180; // 45 degrees in radians
  const canvasAspectRatio =
    webGlContext.canvas.clientWidth / webGlContext.canvas.clientHeight;
  const zNear = 0.1; // show objects farther than 0.1 units away
  const zFar = 100.0; // sshowee objects closer than 100 units away
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(
    projectionMatrix,
    fieldOfView,
    canvasAspectRatio,
    zNear,
    zFar
  );

  // set drawing position to "identity" point (scene center):
  const modelViewMatrix = mat4.create();

  // move drawing position to where to start drawing the square:
  const destinationMatrix = modelViewMatrix;
  const matrixToTranslate = modelViewMatrix;
  const amountToTranslate = [-0.0, 0.0, -6.0];
  mat4.translate(destinationMatrix, matrixToTranslate, amountToTranslate);

  // tell WebGL how to get positions from position buffer into vertexPosition attribute:
  {
    const numberOfComponentsPerIteration = 2;
    const type = webGlContext.FLOAT; // buffer data is 32bit floats
    const normalize = false;
    const stride = 0; // how many bytes to get from one set of values to the next
    // 0 = use type and numberOfComponentsPerIteration above
    const offset = 0; // how many bytes inside the buffer to start from
    webGlContext.bindBuffer(webGlContext.ARRAY_BUFFER, buffers.position);
    webGlContext.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numberOfComponentsPerIteration,
      type,
      normalize,
      stride,
      offset
    );
    webGlContext.enableVertexAttribArray(
      programInfo.attribLocations.vertexPosition
    );
  }

  // tell WebGL to use program when drawing:
  webGlContext.useProgram(programInfo.program);

  // set shader uniforms:
  webGlContext.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  );
  webGlContext.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );

  {
    const offset = 0;
    const vertexCount = 4;
    webGlContext.drawArrays(webGlContext.TRIANGLE_STRIP, offset, vertexCount);
  }
}
