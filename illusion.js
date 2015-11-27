/**
 * Created by prabhatgodse on 3/21/14.
 */
var gl;
var currentlyPressesKeys = {};
var Illusion = {};
var shaderProgram;
var ext;
var canvas;
var camera;

function initGL(canvas) {
    try {
        gl = canvas.getContext("webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
        ext = gl.getExtension("OES_vertex_array_object");
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

// function handleLoadedTexture(texture) {
//     gl.bindTexture(gl.TEXTURE_2D, texture);
//     gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
//     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
//     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
//     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
//     gl.bindTexture(gl.TEXTURE_2D, null);
// }


// var hazeTexture;
// var hardWaterTexture;
// var stoneFloorTexture;
// var currentTextureId;
// var raptorTexture;
// var grassTexture;

// function initTexture() {
//     hazeTexture = gl.createTexture();
//     hazeTexture.image = new Image();
//     hazeTexture.image.onload = function () {
//         handleLoadedTexture(hazeTexture)
//     }

//     hazeTexture.image.src = "Textures/haze.jpg";    //"scene/MedievalBarrel/MedBarrelDiffuse.jpg";

//     //
//     //Create 2nd texture
//     hardWaterTexture = gl.createTexture();
//     hardWaterTexture.image = new Image();
//     hardWaterTexture.image.onload = function () {
//         handleLoadedTexture(hardWaterTexture)
//     }

//     hardWaterTexture.image.src = "Textures/hardWater.jpg";

//     //
//     //Create floor texture.
//     stoneFloorTexture = gl.createTexture();
//     stoneFloorTexture.image = new Image();
//     stoneFloorTexture.image.onload = function() {
//         handleLoadedTexture(stoneFloorTexture);
//     }
//     stoneFloorTexture.image.src = "Textures/stoneFloor.jpg";

//     //
//     //Fetch grass texture
//     grassTexture = gl.createTexture();
//     grassTexture.image = new Image();
//     grassTexture.image.onload = function() {
//         handleLoadedTexture(grassTexture);
//     };
//     grassTexture.image.src = "Textures/grass_texture.jpg";

//     //Godzilla's textures
//     raptorTexture = gl.createTexture();
//     raptorTexture.image = new Image();
//     raptorTexture.image.onload = function() {
//         handleLoadedTexture(raptorTexture);
//     }
//     raptorTexture.image.src = "Textures/raptor.jpg";

// }

//Frame buffer for reading out the rendered pixels
var rrtFramebuffer;
var rrtTexture;
var rrtDepthTexture;
function initTextureFrameBuffer() {
    rrtFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, rrtFramebuffer);
    rrtFramebuffer.width = 512;
    rrtFramebuffer.height = 512;

    //Create texture object
    rrtTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, rrtTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, rrtFramebuffer.width, rrtFramebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    var renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, rrtFramebuffer.width, rrtFramebuffer.height);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rrtTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}
// var mMatrix = mat4.create();
// var vMatrix = mat4.create();
// var mMatrixStack = [];
// var pMatrix = mat4.create();

// function mvPushMatrix() {
//     var copy = mat4.create();
//     mat4.set(mMatrix, copy);
//     mMatrixStack.push(copy);
// }

// function mvPopMatrix() {
//     if (mMatrixStack.length == 0) {
//         throw "Invalid popMatrix!";
//     }
//     mMatrix = mMatrixStack.pop();
// }


// function setMatrixUniforms() {
//     gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
//     gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
//     gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);

//     var normalMatrix = mat3.create();
//     var mvMatrix = mat4.create();
//     mat4.multiply(vMatrix, mMatrix, mvMatrix);

//     mat4.toInverseMat3( mvMatrix, normalMatrix);
//     mat3.transpose(normalMatrix);
//     gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);

//     var lightMatrix = mat4.lookAt([pointLightPositionX, pointLightPositionY, pointLightPositionZ], [0, 0, 0], [0, 1, 0]);
//     gl.uniformMatrix4fv(shaderProgram.lightMVMatrix, false, lightMatrix);
// }

//
// Mouse Events
function handleKeyDown(event) {
    currentlyPressesKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
    if(currentlyPressesKeys[84]) {
        //'T' button. Switch texture.
        if (currentTextureId === 0)
            currentTextureId = 1;
        else
            currentTextureId = 0;
    }
    currentlyPressesKeys[event.keyCode] = false;
}

//Manipulate the camera parameters based on key press.
function handleKeys() {
    if (currentlyPressesKeys[83]) {
        // 'S' button. Zoom in
        //speed = -0.1;
        yPos -= 0.25;
    } else if(currentlyPressesKeys[87]) {
        // 'W' key. Move forward
        yPos += 0.25;
    } else {
        speed = 0.0;
    }
    if(currentlyPressesKeys[38]) {
        // 'UP' arrow
        pitch += 1.0;
    }
    if(currentlyPressesKeys[40]) {
        // 'DOWN' arrow
        pitch -= 1.0;
    }
    if(currentlyPressesKeys[65]) {
        // 'A' key move left.
        xPos -= 0.5;
        //xPos -= Math.sin(degToRad(yaw)) * 0.1;
    }
    if(currentlyPressesKeys[68]) {
        // 'D' key move right
        xPos += 0.5;
        //xPos -= Math.sin(degToRad(yaw)) * 0.1;
    }

    if(currentlyPressesKeys[37]) {
        // 'LEFT' arrow
        yaw += 1.0
    }
    if(currentlyPressesKeys[39]) {
        // 'RIGHT' arrow
        yaw -= 1.0;
    }
}

var isMouseDown = false;
var prevMouseX = null;
var prevMouseY = null;
function handleMouseDown(event) {
    //Left click
    if(event.button == 0) {
        isMouseDown = true;
        prevMouseX = event.clientX;
        prevMouseY = event.clientY;
    }
}

function handleMouseUp(event) {
    if(event.button == 0) {
        isMouseDown = false;
    }
}

function handleMouseMove(event) {
    if(isMouseDown) {
        var position = event;

        //Detect movement directionsw
        var deltaX = position.clientX - prevMouseX;
        var deltaY = position.clientY - prevMouseY;

        // var newRotationMatrix = mat4.create();
        // mat4.identity(newRotationMatrix);
        // mat4.rotate(newRotationMatrix, degToRad(deltaX / 10), [0, 1, 0]);
        // mat4.rotate(newRotationMatrix, degToRad(deltaY / 10), [1, 0, 0]);

        // mat4.multiply(newRotationMatrix, cameraRotateMatrix, cameraRotateMatrix);

        camera.rotateWithMouseMove(deltaX, deltaY);
        prevMouseY = position.y;
        prevMouseX = position.x;
    }
}

function handleMouseWheel(event) {
    var delta = event.wheelDelta;
    if (delta > 0) {
        xPos -= Math.sin(degToRad(yaw)) * -(2);
        zPos -= Math.cos(degToRad(yaw)) * -(2);
    } else if(delta < 0) {
        xPos -= Math.sin(degToRad(yaw)) * (2);
        zPos -= Math.cos(degToRad(yaw)) * (2);
    }
}

//
// Keyboard events
//Toggle transparency
function toggleTransparency() {
    enableTransparency = !enableTransparency;
}
var enableAnimation = true;
function toggleAnimation() {
    enableAnimation = !enableAnimation;
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

window.onresize = function(event) {
    camera.updateAspectRatio(gl.viewportWidth / gl.viewportHeight);
}

//
// Movement variables.
var pitch = 0;
var pitchRate = 0;

var yaw = 0;
var yawRate = 0;

var xPos = 0;
var yPos = 0;
var zPos = 100;

var xRot = 25;
var yRot = 0;
var zRot = 0;
var zoomVal = 0.0;
var speed = 0;
// var cameraRotateMatrix = mat4.create();
// mat4.identity(cameraRotateMatrix);

//
//Lighting variables.
var ambientR = 0.02;
var ambientG = 0.02;
var ambientB = 0.02;

var enableTransparency = false;
var enableShadows = true;

var lightingDirection = [-0.25, -0.25, -1.0];
// var directionColorR = 0.8;
// var directionColorG = 0.8;
// var directionColorB = 0.8;

var pointLightDiffuseColorR = 0.8;
var pointLightDiffuseColorG = 0.8;
var pointLightDiffuseColorB = 0.8;

var pointLightSpecularColorR = 0.15;
var pointLightSpecularColorG = 0.15;
var pointLightSpecularColorB = 0.15;

var pointLightPositionX = 0.0;
var pointLightPositionY = 10.0;
var pointLightPositionZ = 0.0;

var transparentAlpha = 1.0;
var phongComponent = 50.0;

var lightModulator = 1;

function initBuffers() {
    // Start setting up VAO (vertex array object)
    for (var idx in Illusion_ObjectList) {
        var each_illusion = Illusion_ObjectList[idx];
        each_illusion.initBuffers();
    }
}

function initIllusionLighting() {
    //Set the lighting parameters and pass the buffers to graphics card
    //Apply scene lighting effects
    gl.useProgram(shaderProgram);
    gl.uniform3f(shaderProgram.ambientColorUniform, ambientR, ambientG, ambientB);

    //Apply light position
    gl.uniform3f(shaderProgram.pointLights[0].position, pointLightPositionX, pointLightPositionY, pointLightPositionZ);

    //Apply point light colors.
    gl.uniform3f(shaderProgram.pointLights[0].diffuseColor, pointLightDiffuseColorR, pointLightDiffuseColorG, pointLightDiffuseColorB);
    gl.uniform3f(shaderProgram.pointLights[0].specularColor, pointLightSpecularColorR, pointLightSpecularColorG, pointLightSpecularColorB);
    gl.uniform1f(shaderProgram.phongComponent, phongComponent);

    gl.uniform3f(shaderProgram.pointLights[1].position, -10.0, -10.0, -10.0);
    gl.uniform3f(shaderProgram.pointLights[1].diffuseColor, 0.12, 0.07, 0.12);
    gl.uniform3f(shaderProgram.pointLights[1].specularColor, 0.25, 0.27, 0.20);

    //Apply the spot lights
    gl.uniform3f(shaderProgram.spotLights[0].position, 50.0, 3.0, 5.0);
    gl.uniform3f(shaderProgram.spotLights[0].direction, 0.0, 1.0, 0.0);
    gl.uniform3f(shaderProgram.spotLights[0].spotColor, 0.8, 0.1, 0.0);

    gl.uniform1f(shaderProgram.spotLights[0].coneAngle, degToRad(120));
    gl.uniform1f(shaderProgram.spotLights[0].linearAtt, 2);
}

function Illusion_Geometry() {
    this.vertices = [];
    this.normals = [];
    this.uvs = [];
    this.indices = [];
}

function basicCube(BoxW) {
    var cube = new Illusion_Geometry();
    cube.vertices = [
                                    -BoxW, -BoxW, BoxW,
                                    BoxW, -BoxW, BoxW,
                                    BoxW, BoxW, BoxW,
                                    -BoxW, BoxW, BoxW,
                                    BoxW, -BoxW, -BoxW,
                                    -BoxW, -BoxW, -BoxW,
                                    -BoxW, BoxW, -BoxW,
                                    BoxW, BoxW, -BoxW
                                ];
    cube.normals = [
                                    0.0, 1.0, 0.0,
                                    0.0, 1.0, 0.0,
                                    0.0, 1.0, 0.0,
                                    0.0, 1.0, 0.0,
                                    0.0, 1.0, 0.0,
                                    0.0, 1.0, 0.0,
                                    0.0, 1.0, 0.0,
                                    0.0, 1.0, 0.0
                                ];
    cube.uvs = [
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0
    ];
    cube.indices = [0, 1, 2,    2, 3, 0,
                                7, 2, 1,    7, 1, 4,
                                6, 5, 0,    3, 6, 0,
                                6, 3, 2,    7, 6, 2,
                                5, 4, 1,    0, 5, 1,
                                6, 7, 4,    6, 4, 5];
    return cube;
}

var animTime = 0;
var prevTime = 0;
var G = -9.8;

var Illusion_ObjectList = [];
var scaleFactor = 1.0;

function initObjects() {
    var texture1 = new Illusion.Texture({url : "Textures/stoneFloor.jpg"});
    texture1.loadTexture();

    //Build Material & Shaders
    var material1 = new Illusion.Material({});
    material1.addTexture(texture1, "color", "colorTexture0");

    material1.fetchShaderFromUrl("basic_vertex.vert", "basic_fragment.frag", 0);

    var teapot_object = new Illusion.ShapeNode("teapot");
    teapot_object.setDiffuseColor(0.8, 0.8, 0.8);
    teapot_object.setSpecularColor(0.2, 0.2, 0.2);
    teapot_object.setPhongComponent(20.0);
    teapot_object.isTransparent = false;
    teapot_object.alpha = 0.8;
    //teapot_object.addTexture(hardWaterTexture);
    teapot_object.setDiffuseColor(0.4, 0.72, 0.34);

    teapot_object.applyScaling([0.5, 0.5, 0.5]);
    teapot_object.buildGeometryWithObjFile('/scene/teapot.txt');
    teapot_object.material = material1;


    var texture2 = new Illusion.Texture({url : "Textures/hardWater.jpg"});
    texture2.loadTexture();

    var material2 = new Illusion.Material({});
     material2.addTexture(texture2, "color", "colorTexture0");
    material2.fetchShaderFromUrl("basic_vertex.vert", "basic_fragment.frag", 0);

    var medival_barrel_object = new Illusion.ShapeNode("medival-barrel");
    medival_barrel_object.applyTransformations([-15.0, 30.0, 8.0]);
    medival_barrel_object.velocity = 0.0;
    medival_barrel_object.material = material2;
    medival_barrel_object.animationCallback = function() {
        this.rotateY += 2;
        this.scaleMatrix[0] += 0.03 * scaleFactor;
        //this.scaleMatrix[1] += 0.03 * scaleFactor;
        //this.scaleMatrix[2] += 0.03 * scaleFactor;
        //Toggle the scaling from 0.5 - 2.5;
        if(this.scaleMatrix[0] > 2.5) {
            scaleFactor = -1;
        } else if(this.scaleMatrix[0] < 0.5) {
            scaleFactor = 1;
        }

        var timeNow = new Date().getTime();

        if(prevTime > 0) {
            dT = timeNow - prevTime;
            dT /= 500.0;   //Convert to seconds
            medival_barrel_object.velocity = medival_barrel_object.velocity + G * dT;

            //if(medival_barrel_object.velocity >=0) {
                var displacement = medival_barrel_object.velocity * dT;
                this.translateMatrix[1] += displacement;
            //}
            if(medival_barrel_object.translateMatrix[1] <0) {
                medival_barrel_object.velocity = Math.abs(medival_barrel_object.velocity) * 0.6;
                medival_barrel_object.translateMatrix[1] = 0;
            }
        }
        prevTime = timeNow;
    }
    medival_barrel_object.buildGeometryWithObjFile('scene/MedievalBarrel/MedievalBarrel_OBJ.OBJ');

    var tank_object = new Illusion.ShapeNode("tank");
    tank_object.material = material1;
    //tank_object.addTexture(hazeTexture);
    tank_object.applyTransformations([10.0, -1.0, 8.0]);
    tank_object.setDiffuseColor(0.5, 0.35, 0.15);
    tank_object.setSpecularColor(0.15, 0.15, 0.15);
    tank_object.setPhongComponent(15.0);
    tank_object.rotateX = -90;
    tank_object.rotateZ = -45;
    tank_object.applyScaling([0.5, 0.5, 0.5]);
    //tank_object.buildGeometryWithObjFile('scene/tank/Tiger_I.obj');
    tank_object.buildGeometryWithObjFile('scene/box.obj');
    // tank_object.buildGeometryWithObjFile('scene/mini.obj');


    var BoxW = 10.0;
    var floor_object = new Illusion.ShapeNode("floor");
    floor_object.material = material1;
    floor_object.applyTransformations([0.0, 15.0, 8.0]);
    floor_object.geo = basicCube(BoxW);

    floor_object.animationCallback = function() {
        //ext.bindVertexArrayOES(this.vao);

        // this.geo.vertices[0] = Math.sin((new Date().getTime())/700.0) * 10.0;
        // this.geo.vertices[1] = Math.cos((new Date().getTime())/700.0) * 10.0;
        // gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.geo.vertices), gl.STATIC_DRAW);

        // ext.bindVertexArrayOES(null);
    }

    var object1 = new Illusion.ShapeNode("object1");
    object1.material = material1;
    object1.setDiffuseColor(0.3, 0.6, 0.45);
    object1.applyScaling([500.0, 2.0, 500.0]);
    object1.applyTransformations([0.0, -5.0, 0.0]);
    object1.buildGeometryWithObjFile('scene/box.obj');

    //Illusion_ObjectList.push(floor_object);
    Illusion_ObjectList.push(teapot_object);
    Illusion_ObjectList.push(medival_barrel_object);
    Illusion_ObjectList.push(tank_object);
    Illusion_ObjectList.push(object1);
    //Illusion_Animator_Add(animateLight);
}

function drawScene() {
    //Render scene to texture
    if(enableShadows) {
        //gl.bindFramebuffer(gl.FRAMEBUFFER, rrtFramebuffer);
        //drawOrigScene();
        //gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        //gl.uniform1i(shaderProgram.depthCheck, false);
    }
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //Attach depth buffer
    //gl.activeTexture(gl.TEXTURE1);
    //gl.bindTexture(gl.TEXTURE_2D, rrtTexture);
    //gl.uniform1i(shaderProgram.samplerDepthUniform, 1);
    // mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 10000.0, pMatrix);
    // mat4.identity(vMatrix);
    // mat4.identity(mMatrix);
    // mat4.translate(vMatrix, [-xPos, -yPos, -zPos]);
    // mat4.multiply(vMatrix, cameraRotateMatrix);

    camera.setEyePosition(xPos, yPos, zPos);

    for (var idx in Illusion_ObjectList) {
        var iObject = Illusion_ObjectList[idx];

        iObject.renderObject(camera.projectionMatrix, camera.matrix);
        //setMatrixUniforms();
        // Illusion_ObjectList[1].renderObject();
        //gl.drawElements(gl.TRIANGLES, iObject.geo.indices.length, gl.UNSIGNED_SHORT, 0);//Illusion_ObjectList[idx].geo.indices * 2);
        //ext.bindVertexArrayOES(null);
    }
}


var lastTime = 0;
var lightTime = 0;
var sign = 1;
var Illusion_Animation_Handler = [];

function animateLight() {
    var timeNow = new Date().getTime();
    lightModulator = (Math.sin(timeNow/550));
    pointLightPositionX += lightModulator;
    pointLightPositionY += (Math.cos(timeNow/550));

    pointLightDiffuseColorR += (lightModulator) * 0.01;
    pointLightSpecularColorG += (lightModulator) * 0.01;
    //pointLightDiffuseColorB += Math.abs(lightModulator) * 0.1;

    //Apply light position
    gl.uniform3f(shaderProgram.pointLights[0].position, pointLightPositionX, pointLightPositionY, pointLightPositionZ );

    //Apply point light colors.
    gl.uniform3f(shaderProgram.pointLights[0].diffuseColor, pointLightDiffuseColorR, pointLightDiffuseColorG, pointLightDiffuseColorB);
    gl.uniform3f(shaderProgram.pointLights[0].specularColor, pointLightSpecularColorR, pointLightSpecularColorG, pointLightSpecularColorB);
}


function Illusion_Animator_Add(anim) {
    Illusion_Animation_Handler.push(anim);
}
function Illusion_Fire_Animations() {
    for (var idx in Illusion_ObjectList) {
        Illusion_ObjectList[idx].animationCallback();
    }
    for (var idx in Illusion_Animation_Handler) {
        //Illusion_Animation_Handler[idx]();
    }
}
function animate() {
    var timeNow = new Date().getTime();

    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;

        if(elapsed > 30) {
            if(xRot > 20) {
                sign = -1;
            } else if(xRot < -20) {
                sign = 1;
            }
        }
        xRot += 0.5 * sign;
        yRot += (90 * elapsed) / 1000.0;
        zRot += (90 * elapsed) / 1000.0;
    }
    lastTime = timeNow;
}


function tick() {
    requestAnimFrame(tick);
    //Re-frame the canvas on screen size change.
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;

    handleKeys();
    drawScene();
    if(enableAnimation)
    Illusion_Fire_Animations();
}

var renderFrameBuffer;
var renderTexture;

function initFrameBuffer() {
    renderFrameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, renderFrameBuffer);
    renderFrameBuffer.width = 512;
    renderFrameBuffer.height = 512;

    renderTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, renderTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, renderTexture.width, renderTexture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    var renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, renderTexture.width, renderTexture.height);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function webGLStart() {
    drawScene();
    tick();
}


function initIllusion() {
    canvas = document.getElementById("prabhat-canvas");
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    //Set default texture file name
    currentTextureId = 0;
    initGL(canvas);
    camera = new Illusion.Camera(45, gl.viewportWidth / gl.viewportHeight, 0.1, 10000.0);
    //initShaders();

    //Illusion.ShaderComposer.getShaderByMask(0, callback);

    //initShaderCode(callback);
    //function callback() {
        //shaderProgram = Illusion.ShaderComposer.shaderProgram;
        //initTextureFrameBuffer();
        //initFrameBuffer();
        //initTexture();
        initObjects();
    //}
    gl.clearColor(0.2265, 0.496, 0.789, 1.0);
    gl.enable(gl.DEPTH_TEST);

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    //Mouse
    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;
    document.onmousewheel = handleMouseWheel;

    webGLStart();
}
