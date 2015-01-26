/**
 * Created by prabhatgodse on 3/21/14.
 */
var gl;
var currentlyPressesKeys = {};

function initGL(canvas) {
    try {
        gl = canvas.getContext("webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

function initShaderCode(callback) {
    function getShader(shaderScript, type) {
        if (!shaderScript) {
            return null;
        }
        var shader;
        if (type == "fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (type == "vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, shaderScript);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

            console.log(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }
    var shaderFragmentCode = "";
    var shaderVertexCode = "";
    jQuery.get("shader_fragment", function(data) {
        shaderFragmentCode = data;
        jQuery.get("shader_vertex", function(data) {
            shaderVertexCode = data;
            var frag = getShader(shaderFragmentCode, "fragment");
            var vert = getShader(shaderVertexCode, "vertex");
            initShaders(vert, frag);
            callback();
        })
    })
}
var shaderProgram;

function initShaders(vertexShader, fragmentShader) {
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix");
    shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");
    shaderProgram.lightMVMatrix =  gl.getUniformLocation(shaderProgram, "lightMVMatrix");
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
    shaderProgram.samplerDepthUniform = gl.getUniformLocation(shaderProgram, "uDepthSampler");
    shaderProgram.alphaUniform = gl.getUniformLocation(shaderProgram, "uAlpha");
    shaderProgram.layerTexture = gl.getUniformLocation(shaderProgram, "layerTextures");
    shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
    shaderProgram.pointLightPosition = gl.getUniformLocation(shaderProgram, "pointLightPosition");
    shaderProgram.pointLightDiffuseColor = gl.getUniformLocation(shaderProgram, "uPointLightDiffuseColor");
    shaderProgram.pointLightSpecularColor = gl.getUniformLocation(shaderProgram, "uPointLightSpecularColor");
    shaderProgram.phongComponent = gl.getUniformLocation(shaderProgram, "uPhongComponent");
    shaderProgram.materialDiffuseColor = gl.getUniformLocation(shaderProgram, "uMaterialDiffuseColor");
    shaderProgram.materialSpecularColor = gl.getUniformLocation(shaderProgram, "uMaterialSpecularColor");
    shaderProgram.useTexture = gl.getUniformLocation(shaderProgram, "useTexture");

    shaderProgram.pointLights = [];
    shaderProgram.pointLights[0] = {position:{}, diffuseColor:{}, specularColor:{}};
    shaderProgram.pointLights[0].position = gl.getUniformLocation(shaderProgram, "point_lights[0].position");
    shaderProgram.pointLights[0].diffuseColor = gl.getUniformLocation(shaderProgram, "point_lights[0].diffuseColor");
    shaderProgram.pointLights[0].specularColor = gl.getUniformLocation(shaderProgram, "point_lights[0].specularColor");

    shaderProgram.pointLights[1] = {position:{}, diffuseColor:{}, specularColor:{}};
    shaderProgram.pointLights[1].position = gl.getUniformLocation(shaderProgram, "point_lights[1].position");
    shaderProgram.pointLights[1].diffuseColor = gl.getUniformLocation(shaderProgram, "point_lights[1].diffuseColor");
    shaderProgram.pointLights[1].specularColor = gl.getUniformLocation(shaderProgram, "point_lights[1].specularColor");

    //Link Spot lights to GLSL code
    shaderProgram.spotLights = [];
    shaderProgram.spotLights[0] = {position:{}, direction:{}, coneAngle:{}, spotColor:{}, linearAtt:{}};
    shaderProgram.spotLights[0].position = gl.getUniformLocation(shaderProgram, "spot_lights[0].position");
    shaderProgram.spotLights[0].direction = gl.getUniformLocation(shaderProgram, "spot_lights[0].direction");
    shaderProgram.spotLights[0].coneAngle = gl.getUniformLocation(shaderProgram, "spot_lights[0].coneAngle");
    shaderProgram.spotLights[0].spotColor = gl.getUniformLocation(shaderProgram, "spot_lights[0].color");
    shaderProgram.spotLights[0].linearAtt = gl.getUniformLocation(shaderProgram, "spot_lights[0].linearAtt");
}


function handleLoadedTexture(texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
}


var hazeTexture;
var hardWaterTexture;
var stoneFloorTexture;
var currentTextureId;
var raptorTexture;
var grassTexture;

function initTexture() {
    hazeTexture = gl.createTexture();
    hazeTexture.image = new Image();
    hazeTexture.image.onload = function () {
        handleLoadedTexture(hazeTexture)
    }

    hazeTexture.image.src = "Textures/haze.jpg";    //"scene/MedievalBarrel/MedBarrelDiffuse.jpg";

    //
    //Create 2nd texture
    hardWaterTexture = gl.createTexture();
    hardWaterTexture.image = new Image();
    hardWaterTexture.image.onload = function () {
        handleLoadedTexture(hardWaterTexture)
    }

    hardWaterTexture.image.src = "Textures/hardWater.jpg";

    //
    //Create floor texture.
    stoneFloorTexture = gl.createTexture();
    stoneFloorTexture.image = new Image();
    stoneFloorTexture.image.onload = function() {
        handleLoadedTexture(stoneFloorTexture);
    }
    stoneFloorTexture.image.src = "Textures/stoneFloor.jpg";

    //
    //Fetch grass texture
    grassTexture = gl.createTexture();
    grassTexture.image = new Image();
    grassTexture.image.onload = function() {
        handleLoadedTexture(grassTexture);
    };
    grassTexture.image.src = "Textures/grass_texture.jpg";

    //Godzilla's textures
    raptorTexture = gl.createTexture();
    raptorTexture.image = new Image();
    raptorTexture.image.onload = function() {
        handleLoadedTexture(raptorTexture);
    }
    raptorTexture.image.src = "Textures/raptor.jpg";

}

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
var mMatrix = mat4.create();
var vMatrix = mat4.create();
var mMatrixStack = [];
var pMatrix = mat4.create();

function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mMatrix, copy);
    mMatrixStack.push(copy);
}

function mvPopMatrix() {
    if (mMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mMatrix = mMatrixStack.pop();
}


function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
    gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);

    var normalMatrix = mat3.create();
    var mvMatrix = mat4.create();
    mat4.multiply(vMatrix, mMatrix, mvMatrix);

    mat4.toInverseMat3( mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);

    var lightMatrix = mat4.lookAt([pointLightPositionX, pointLightPositionY, pointLightPositionZ], [0, 0, 0], [0, 1, 0]);
    gl.uniformMatrix4fv(shaderProgram.lightMVMatrix, false, lightMatrix);
}

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

        var newRotationMatrix = mat4.create();
        mat4.identity(newRotationMatrix);
        mat4.rotate(newRotationMatrix, degToRad(deltaX / 10), [0, 1, 0]);
        mat4.rotate(newRotationMatrix, degToRad(deltaY / 10), [1, 0, 0]);

        mat4.multiply(newRotationMatrix, cameraRotateMatrix, cameraRotateMatrix);

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


//
// Movement variables.
var pitch = 0;
var pitchRate = 0;

var yaw = 0;
var yawRate = 0;

var xPos = 0;
var yPos = 0;
var zPos = 0;

var xRot = 25;
var yRot = 0;
var zRot = 0;
var zoomVal = 0.0;
var speed = 0;
var cameraRotateMatrix = mat4.create();
mat4.identity(cameraRotateMatrix);

//
//Lighting variables.
var ambientR = 0.2;
var ambientG = 0.2;
var ambientB = 0.2;

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

var pointLightPositionX = 10.0;
var pointLightPositionY = 10.0;
var pointLightPositionZ = 10.0;

var transparentAlpha = 1.0;
var phongComponent = 50.0;

var lightModulator = 1;
var ext;

function initBuffers() {
    // Start setting up VAO (vertex array object)
    for (var idx in Illusion_ObjectList) {
        var each_illusion = Illusion_ObjectList[idx];
        ext.bindVertexArrayOES(each_illusion.vao);

        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(each_illusion.geo.vertices), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

        var normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(each_illusion.geo.normals), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

        var textureUV = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureUV);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(each_illusion.geo.uvs), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(each_illusion.geo.indices), gl.STATIC_DRAW);

        //Finished setting up VAO for this object
        ext.bindVertexArrayOES(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
}

function initIllusionLighting() {
    //Set the lighting parameters and pass the buffers to graphics card
    //Apply scene lighting effects

    gl.uniform3f(shaderProgram.ambientColorUniform, ambientR, ambientG, ambientB);

    //Apply light position
    gl.uniform3f(shaderProgram.pointLights[0].position, pointLightPositionX, pointLightPositionY, pointLightPositionZ);

    //Apply point light colors.
    gl.uniform3f(shaderProgram.pointLights[0].diffuseColor, pointLightDiffuseColorR, pointLightDiffuseColorG, pointLightDiffuseColorB);
    gl.uniform3f(shaderProgram.pointLights[0].specularColor, pointLightSpecularColorR, pointLightSpecularColorG, pointLightSpecularColorB);
    gl.uniform1f(shaderProgram.phongComponent, phongComponent);

    gl.uniform3f(shaderProgram.pointLights[1].position, -10.0, -10.0, -10.0);
    gl.uniform3f(shaderProgram.pointLights[1].diffuseColor, 0.12, 0.17, 0.18);
    gl.uniform3f(shaderProgram.pointLights[1].specularColor, 0.25, 0.27, 0.20);

    //Apply the spot lights
    gl.uniform3f(shaderProgram.spotLights[0].position, 0.0, 10.0, 0.0);
    gl.uniform3f(shaderProgram.spotLights[0].direction, 0.0, -1.0, 0.0);
    gl.uniform3f(shaderProgram.spotLights[0].spotColor, 0.8, 0.8, 0.0);

    gl.uniform1f(shaderProgram.spotLights[0].coneAngle, degToRad(120));
    gl.uniform1f(shaderProgram.spotLights[0].linearAtt, 2);
}

function Illusion_Geometry() {
    this.vertices = [];
    this.normals = [];
    this.uvs = [];
    this.indices = [];
}

function Illusion_Group(id) {
    this.vao = ext.createVertexArrayOES();
    this.geo = new Illusion_Geometry();
    this.id = id;
    this.diffuseColor = {r:0.0, g:0.0, b:0.0};
    this.specularColor = {r:0.0, g:0.0, b:0.0};
    this.phongComponent = 10.0;  //The shineness factor of the specular color.
    this.alpha = 1.0;
    this.isTransparent = false;
    this.textureArray = [];

    this.translateMatrix = [0.0, 0.0, 0.0];
    this.scaleMatrix = [1.0, 1.0, 1.0];
    this.rotateX = 0.0;
    this.rotateY = 0.0;
    this.rotateZ = 0.0;

    //Order in which objects are rendered.
    // 1: meaning this object is rendered first
    this.renderOrder = 1.0;
    this.setDiffuseColor = function(r, g, b) {
        this.diffuseColor.r = r;
        this.diffuseColor.g = g;
        this.diffuseColor.b = b;
    };
    this.setSpecularColor = function(r, g, b) {
        this.specularColor.r = r;
        this.specularColor.g = g;
        this.specularColor.b = b;
    }
    this.setPhongComponent = function(p) {
        self.phongComponent = p;
    }
    this.setAlpha = function(a) {
        self.alpha = a;
    }
    this.addTexture = function(tex) {
        this.textureArray.push(tex);
    }

    this.createAnimation = function() {

    }

    this.animationCallback = function(){};

    this.applyTransformations = function(mat) {
        this.translateMatrix = mat;
    }
    this.applyScaling = function(mat) {
        this.scaleMatrix = mat;
    }

    this.makeTransparentWithAlpha = function(a) {
        this.isTransparent = true;
        this.alpha = a;
    }

    this.buildGeometryWithObjFile = function(obj_file_path) {
        var thisObj = this;
        jQuery.get(obj_file_path, function(data) {
            var mesh = new obj_loader.Mesh(data);
            thisObj.geo.vertices = mesh.vertices;
            thisObj.geo.normals = mesh.vertexNormals;
            thisObj.geo.uvs = mesh.textures;
            thisObj.geo.indices = mesh.indices;
            ILLUSION_LOADED_OBJECT_COUNT += 1;
            webGLStart();
        });
    }

    this.renderObject = function() {
        if (this.isTransparent) {
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
            gl.enable(gl.BLEND);
            gl.uniform1f(shaderProgram.alphaUniform, this.alpha);
        } else {
            gl.enable(gl.DEPTH_TEST)
            gl.disable(gl.BLEND);
            gl.uniform1f(shaderProgram.alphaUniform, 1.0);
        }
        //Set the material base colors
        if (this.textureArray.length == 0) {
            gl.uniform1i(shaderProgram.useTexture, false);
        } else {
            gl.uniform1i(shaderProgram.useTexture, true);
        }
        gl.uniform3f(shaderProgram.materialDiffuseColor, this.diffuseColor.r, this.diffuseColor.g, this.diffuseColor.b);
        gl.uniform3f(shaderProgram.materialSpecularColor, this.specularColor.r, this.specularColor.g, this.specularColor.b);
        gl.uniform1f(shaderProgram.phongComponent, this.phongComponent);
        //Set the textures
        if  (this.textureArray.length > 1) {
            gl.uniform1i(shaderProgram.layerTexture, true);
        } else {
            gl.uniform1i(shaderProgram.layerTexture, false);
        }
        var tIdx = 0;
        for (var idx in this.textureArray) {
            gl.activeTexture(gl.TEXTURE0 + tIdx);
            gl.bindTexture(gl.TEXTURE_2D, this.textureArray[idx]);
            if(tIdx == 0)
                gl.uniform1i(shaderProgram.samplerUniform, idx);
            else
                gl.uniform1i(shaderProgram.samplerDepthUniform, idx);
            tIdx += 1;
        }
        mat4.identity(mMatrix);
        mat4.translate(mMatrix, this.translateMatrix);
        mat4.scale(mMatrix, this.scaleMatrix);
        mat4.rotate(mMatrix, degToRad(this.rotateX), [1, 0, 0]);
        mat4.rotate(mMatrix, degToRad(this.rotateY), [0, 1, 0]);
        mat4.rotate(mMatrix, degToRad(this.rotateZ), [0, 0, 1]);

        ext.bindVertexArrayOES(this.vao);
    }
};

var Illusion_ObjectList = [];
var scaleFactor = 1.0;
function initObjects() {
    var teapot_object = new Illusion_Group("teapot");
    teapot_object.setDiffuseColor(0.8, 0.8, 0.8);
    teapot_object.setSpecularColor(0.2, 0.2, 0.2);
    teapot_object.setPhongComponent(20.0);
    teapot_object.addTexture(stoneFloorTexture);
    teapot_object.isTransparent = true;
    teapot_object.alpha = 0.8;
    //teapot_object.addTexture(hardWaterTexture);
    teapot_object.setDiffuseColor(0.4, 0.72, 0.34);

    teapot_object.applyScaling([0.5, 0.5, 0.5]);
    teapot_object.buildGeometryWithObjFile('/scene/teapot.txt');

    var medival_barrel_object = new Illusion_Group("medival-barrel");
    medival_barrel_object.addTexture(hazeTexture);
    medival_barrel_object.applyTransformations([-15.0, -5.0, 8.0]);
    medival_barrel_object.animationCallback = function() {
        this.rotateY += 2;
        this.scaleMatrix[0] += 0.03 * scaleFactor;
        this.scaleMatrix[1] += 0.03 * scaleFactor;
        this.scaleMatrix[2] += 0.03 * scaleFactor;
        //Toggle the scaling from 0.5 - 2.5;
        if(this.scaleMatrix[0] > 2.5) {
            scaleFactor = -1;
        } else if(this.scaleMatrix[0] < 0.5) {
            scaleFactor = 1;
        }
    }
    medival_barrel_object.buildGeometryWithObjFile('scene/MedievalBarrel/MedievalBarrel_OBJ.OBJ');

    var tank_object = new Illusion_Group("tank");
    //tank_object.addTexture(hazeTexture);
    tank_object.applyTransformations([10.0, -1.0, 8.0]);
    tank_object.setDiffuseColor(0.5, 0.15, 0.15);
    tank_object.setSpecularColor(0.15, 0.15, 0.15);
    tank_object.setPhongComponent(15.0);
    tank_object.rotateX = -90;
    tank_object.rotateZ = -45;
    tank_object.applyScaling([0.05, 0.05, 0.05]);
    //tank_object.buildGeometryWithObjFile('scene/tank/Tiger_I.obj');
    //tank_object.buildGeometryWithObjFile('scene/sphere.obj');
    tank_object.buildGeometryWithObjFile('scene/mini.obj');


    var floor_object = new Illusion_Group("floor");
    floor_object.addTexture(grassTexture);
    floor_object.geo.vertices = [
                                    -20.0, -8.0, -20.0,
                                    20.0, -8.0, -20.0,
                                    20.0, -8.0, 20.0,
                                    -20.0, -8.0, 20.0
                                ];
    floor_object.geo.normals = [
                                    0.0, 1.0, 0.0,
                                    0.0, 1.0, 0.0,
                                    0.0, 1.0, 0.0,
                                    0.0, 1.0, 0.0
                                ];
    floor_object.geo.uvs = [
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0
    ];
    floor_object.geo.indices = [0, 3, 1,    1, 3, 2];
    ILLUSION_LOADED_OBJECT_COUNT += 1;

    Illusion_ObjectList.push(floor_object);
    Illusion_ObjectList.push(teapot_object);
    Illusion_ObjectList.push(medival_barrel_object);
    Illusion_ObjectList.push(tank_object);
    //Illusion_Animator_Add(animateLight);
}


function drawOrigScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //Attach depth buffer
    //gl.activeTexture(gl.TEXTURE1);
    //gl.bindTexture(gl.TEXTURE_2D, rrtTexture);
    //gl.uniform1i(shaderProgram.samplerDepthUniform, 1);

    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
    mat4.identity(vMatrix);
    mat4.identity(mMatrix);

    mat4.translate(vMatrix, [-0.0, 0.0, -zPos]);
    mat4.multiply(vMatrix, cameraRotateMatrix);
    mat4.scale(vMatrix, [1.0, -1.0, 1.0]);
    //mat4.rotate(mvMatrix, degToRad(-pitch), [1, 0, 0]);
    //mat4.rotate(mvMatrix, degToRad(-yaw), [0, 1, 0]);
    //xPos -= Math.sin(degToRad(yaw)) * speed;
    //zPos -= Math.cos(degToRad(yaw)) * speed;
    //mat4.multiply(mvMatrix, cameraRotateMatrix);
    //mat4.translate(mvMatrix, [-xPos, -yPos, -zPos]);

    setMatrixUniforms();

    //Apply scene lighting effects
//    gl.uniform3f(shaderProgram.ambientColorUniform, ambientR, ambientG, ambientB);
//
//    //Apply light position
//    gl.uniform3f(shaderProgram.pointLightPosition, pointLightPositionX, pointLightPositionY, pointLightPositionZ );
//
//    //Apply point light colors.
//    gl.uniform3f(shaderProgram.pointLightDiffuseColor, pointLightDiffuseColorR, pointLightDiffuseColorG, pointLightDiffuseColorB);
//    gl.uniform3f(shaderProgram.pointLightSpecularColor, pointLightSpecularColorR, pointLightSpecularColorG, pointLightSpecularColorB);
//    gl.uniform1f(shaderProgram.phongComponent, phongComponent);
//
//    //Apply scene vertex positions
//    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
//    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
//
//    //Apply the scene vertex normals
//    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
//    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, cubeVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
//
//    //Apply scene texture co-ordinates
//    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
//    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
//    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

    gl.enable(gl.DEPTH_TEST)
    gl.disable(gl.BLEND);
    gl.uniform1f(shaderProgram.alphaUniform, 1.0);


    //Draw object 1: Barrel
    //Set the textures
    gl.uniform1i(shaderProgram.layerTexture, false);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, stoneFloorTexture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);
    gl.drawElements(gl.TRIANGLES, multipleObjectIndexLength[1], gl.UNSIGNED_SHORT, multipleObjectIndices[1] * 2);

    /*
     Prepare Teapot
     */
    //mat4.rotate(mMatrix, degToRad(xRot), [0, 1, 0]);
    //mat4.translate(mMatrix, [degToRad(xRot*0)+20, 10.0, 0.0]);
    mat4.translate(mMatrix, [10, 0.0, 0.0]);
    setMatrixUniforms();

    gl.uniform1i(shaderProgram.layerTexture, true);
    //Bind the first texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, stoneFloorTexture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    //Bind a second texture
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, hazeTexture);
    gl.uniform1i(shaderProgram.samplerDepthUniform, 1);

    //Draw object 0: Teapot
    gl.drawElements(gl.TRIANGLES, multipleObjectIndexLength[0], gl.UNSIGNED_SHORT, 0);


    //Draw object 2: Floor
    //Alpha blending & transparency effects
    mat4.identity(mMatrix);
    setMatrixUniforms();
    if (enableTransparency) {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_CONSTANT_ALPHA);
        //gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.uniform1f(shaderProgram.alphaUniform, transparentAlpha);
    } else {
        gl.enable(gl.DEPTH_TEST)
        gl.disable(gl.BLEND);
        gl.uniform1f(shaderProgram.alphaUniform, 1.0);
    }
    //Set the textures
    gl.uniform1i(shaderProgram.layerTexture, false);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, grassTexture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);


    //gl.drawElements(gl.TRIANGLES, multipleObjectIndexLength[2], gl.UNSIGNED_SHORT, multipleObjectIndices[2] * 2);    //IMP: always multiple by 2. Since the size of unsigned_short

    //Render the scene to texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, rrtTexture);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
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
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 10000.0, pMatrix);
    mat4.identity(vMatrix);
    mat4.identity(mMatrix);
    mat4.translate(vMatrix, [-xPos, -yPos, -zPos]);
    mat4.multiply(vMatrix, cameraRotateMatrix);
    for (var idx in Illusion_ObjectList) {
        Illusion_ObjectList[idx].renderObject();
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, Illusion_ObjectList[idx].geo.indices.length, gl.UNSIGNED_SHORT, 0);//Illusion_ObjectList[idx].geo.indices * 2);
        ext.bindVertexArrayOES(null);
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
        Illusion_Animation_Handler[idx]();
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
var ILLUSION_MAX_OBJECT_COUNT = 4;
var ILLUSION_LOADED_OBJECT_COUNT = 0;

function webGLStart() {
    //Once all Geometry and textures are loaded. Begin scene drawing.
    if (ILLUSION_LOADED_OBJECT_COUNT == ILLUSION_MAX_OBJECT_COUNT) {
        //Send the object geometry to Graphics Card and begin rendering.
        initBuffers();
        initIllusionLighting();
        drawScene();
        tick();
    }
}


function initIllusion() {
    var canvas = document.getElementById("prabhat-canvas");
    //Set default texture file name
    currentTextureId = 0;
    initGL(canvas);
    ext = gl.getExtension("OES_vertex_array_object");
    //initShaders();
    initShaderCode(callback);
    function callback() {
        initTextureFrameBuffer();
        initFrameBuffer();
        initTexture();
        initObjects();
    }
    gl.clearColor(0.2265, 0.496, 0.789, 1.0);
    gl.enable(gl.DEPTH_TEST);

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    //Mouse
    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;
    document.onmousewheel = handleMouseWheel;

    var state1 = IllusionLibrary.createState("Phong shader");  // alerts 'bla'
    state1.setTexture();
    //mySingleton.publicMethod();
    //console.log(ss.key);

    //Twitter API
//     $.ajax({
//     url: "https://api.twitter.com/1.1/followers/ids.json?q=namo",
//     type: "GET",
//     data: { cursor: "-1", 
//             screen_name: "twitterapi" },
//     cache: false,
//     dataType: 'json',

//     success: function(data) { alert('hello!'); console.log(data);},
//     error: function(html) { alert(html); },
//     headers: {'Authorization':'OAuth', 
//         'oauth_consumer_key' : "HdFdA3C3pzTBzbHvPMPw", 
//         'oauth_nonce' : "4148fa6e3dca3c3d22a8315dfb4ea5bb", 
//         'oauth_signature' : 'uDZP2scUz6FUKwFie4FtCtJfdNE%3D', 
//         'oauth_signature_method' : "HMAC-SHA1", 
//         'oauth_timestamp' : "1359955650", 
//         'oauth_token' : '1127121421-aPHZHQ5BCUoqfHER2UYhQYUEm0zPEMr9xJYizXl', 
//         'oauth_version' : '1.0'}
// });


function setHeader(xhr) {
    if(xhr && xhr.overrideMimeType) {
        xhr.overrideMimeType("application/j-son;charset=UTF-8");
    }

    //var nonce = freshNonce();
    //var timestamp = freshTimestamp();
    //var signature = sign(nonce,timestamp);

    //alert(signature);
    //alert(accessToken+"-"+consumerKey);
    //alert(oauth_version+"-"+oauth_signature_method);
    xhr.setRequestHeader('Authorization','OAuth');
    xhr.setRequestHeader('key', 'ncjns8QuSCFkJTQWBUlsXOhoT');
    xhr.setRequestHeader('secret', 'tef28qsyKbP3WD3fUoGVfsmW4D6ve27Sblts8qWCLuVX2Kbtr3');
    xhr.setRequestHeader('oauth_token_secret','ShN57hUAXkJizcjXp2sFdsYjBi9GQXuaCQYSxL61eEdzu%3D');
    xhr.setRequestHeader('oauth_token', '17711498-DRV4ssmHcLPE8O1vbl5XXmdmz7K4fsPVj06wmeGod');
}
}
