/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Kúla sem lituð er með flatri litun.  Hægt að snúa henni
//     með músinni og auka/minnka nákvæmni kúlunnar með hnöppum
//
//    Hjálmtýr Hafsteinsson, mars 2022
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var NumVertices = 36;

var pointsArray = [];
var normalsArray = [];

var movement = false; // Do we rotate?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var zDist = -5.0;

var fovy = 50.0;
var near = 0.2;
var far = 100.0;

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var materialShininess = 20.0;

var ctm;
var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var normalMatrix, normalMatrixLoc;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

function quad(a, b, c, d) {
  var vertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0),
  ];

  var indices = [a, b, c, a, c, d];

  var t1 = subtract(vertices[b], vertices[a]);
  var t2 = subtract(vertices[c], vertices[a]);
  var t3 = subtract(vertices[d], vertices[a]);
  var normal = normalize(cross(t2, t1));
  normal = vec4(normal);

  normalsArray.push(normal);
  normalsArray.push(normal);
  normalsArray.push(normal);

  normal = normalize(cross(t3, t2));
  normal = vec4(normal);

  normalsArray.push(normal);
  normalsArray.push(normal);
  normalsArray.push(normal);

  for (var i = 0; i < indices.length; ++i) {
    pointsArray.push(vertices[indices[i]]);
  }
}

function colorCube() {
  quad(2, 3, 7, 6);
  quad(5, 4, 0, 1);
  quad(2, 3, 0, 1);
  quad(7, 4, 0, 3);
  quad(2, 1, 5, 6);
  quad(7, 6, 5, 4);
}

window.onload = function init() {
  canvas = document.getElementById('gl-canvas');

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.9, 1.0, 1.0, 1.0);

  gl.enable(gl.DEPTH_TEST);

  //
  //  Load shaders and initialize attribute buffers
  //
  var program = initShaders(gl, 'vertex-shader', 'fragment-shader');
  gl.useProgram(program);

  ambientProduct = mult(lightAmbient, materialAmbient);
  diffuseProduct = mult(lightDiffuse, materialDiffuse);
  specularProduct = mult(lightSpecular, materialSpecular);

  colorCube();

  var nBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

  var vNormal = gl.getAttribLocation(program, 'vNormal');
  gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);

  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  modelViewMatrixLoc = gl.getUniformLocation(program, 'modelViewMatrix');
  projectionMatrixLoc = gl.getUniformLocation(program, 'projectionMatrix');
  normalMatrixLoc = gl.getUniformLocation(program, 'normalMatrix');

  projectionMatrix = perspective(fovy, 1.0, near, far);

  gl.uniform4fv(
    gl.getUniformLocation(program, 'ambientProduct'),
    flatten(ambientProduct),
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, 'diffuseProduct'),
    flatten(diffuseProduct),
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, 'specularProduct'),
    flatten(specularProduct),
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, 'lightPosition'),
    flatten(lightPosition),
  );
  gl.uniform1f(gl.getUniformLocation(program, 'shininess'), materialShininess);

  //event listeners for mouse
  canvas.addEventListener('mousedown', function (e) {
    movement = true;
    origX = e.clientX;
    origY = e.clientY;
    e.preventDefault(); // Disable drag and drop
  });

  canvas.addEventListener('mouseup', function (e) {
    movement = false;
  });

  canvas.addEventListener('mousemove', function (e) {
    if (movement) {
      spinY = (spinY + (e.clientX - origX)) % 360;
      spinX = (spinX + (origY - e.clientY)) % 360;
      origX = e.clientX;
      origY = e.clientY;
    }
  });

  // Event listener for mousewheel
  window.addEventListener('wheel', function (e) {
    if (e.deltaY > 0.0) {
      zDist += 0.2;
    } else {
      zDist -= 0.2;
    }
  });

  render();
};

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  modelViewMatrix = lookAt(vec3(0.0, 0.0, zDist), at, up);
  modelViewMatrix = mult(modelViewMatrix, rotateY(-spinY));
  modelViewMatrix = mult(modelViewMatrix, rotateX(spinX));

  normalMatrix = [
    vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
    vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
    vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2]),
  ];

  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));

  gl.drawArrays(gl.TRIANGLES, 0, NumVertices);

  window.requestAnimFrame(render);
}
