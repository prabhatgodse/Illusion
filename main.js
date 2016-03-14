// Wait for it
var OSG = window.OSG;
OSG.globalify();
var osg = window.osg;
var osgViewer = window.osgViewer;
var viewer;


function getShader() {
    var vertexshader = [
    '#ifdef GL_ES',
    'precision highp float;',
    '#endif',
    'attribute vec3 Vertex;',
    'attribute vec3 Normal;',
    'uniform mat4 ModelViewMatrix;',
    'uniform mat4 ProjectionMatrix;',
    'uniform mat4 NormalMatrix;',
    'uniform mat4 ViewMatrix;',
    'uniform vec4 eyePos;',
    'varying vec4 position;',
    'varying vec3 normal;',
    'varying vec3 eyeVec;',
    '',
    'void main(void) {',
    '   gl_Position = ProjectionMatrix * ModelViewMatrix * vec4(Vertex, 1.0);',
    '   normal = normalize(vec3(NormalMatrix * vec4(Normal, 1.0)));',
    '   position = ModelViewMatrix * vec4(Vertex, 1.0);',
    '   eyeVec = ViewMatrix[3].xyz - position.xyz;',
    '   }'
    ].join('\n');


    var fragHead = [
        '#ifdef GL_ES',
        'precision highp float;',
        '#endif',
        'varying vec4 position;',
        'varying vec3 normal;',
        'varying vec3 eyeVec;',
        'varying vec3 n;',
        'uniform vec4 diffuse;',
        'uniform float density; //  { \"min\": 0.0,  \"max\": 0.8, \"step\": 0.01, \"value\": 0.2 } ',
        ''
    ].join('\n');

    var fragLight = [
        '',
        'uniform vec4 pLightColor0;',
        'uniform vec3 pLightPos0;',
        'uniform float pLightAttn0;',
        'uniform vec3 ambientLight;',
        ''
    ].join('\n');

    var fragmentshader = [
        '',
        'void main(void) {',
        '   vec3 l_dir0 = normalize(pLightPos0 - position.xyz);',
        '   vec3 eye = normalize(eyeVec);',
        '   vec3 n = normalize(normal);',
        '   float intensity = max(dot(n, l_dir0), 0.0);',

        '   float z = gl_FragCoord.z/gl_FragCoord.w;',
        '   float fog = clamp(exp(-density*density * z*z * 1.44), 0.0, 1.0);',
        '   vec4 fragColor = diffuse * pLightColor0 * intensity + vec4(ambientLight, 1.0) * 0.4;',
        '   fragColor.a = 1.0;',
        '   gl_FragColor = mix(vec4(0.7, 0.3, 0.3, 1.0), fragColor, fog );',
        '}',
        ''
    ].join( '\n' );

    fragmentshader = fragHead + fragLight + fragmentshader;
    var program = new osg.Program(
        new osg.Shader( 'VERTEX_SHADER', vertexshader ),
        new osg.Shader( 'FRAGMENT_SHADER', fragmentshader ) );

    program.trackAttributes = {};
    program.trackAttributes.attributeKeys = [];
    program.trackAttributes.attributeKeys.push( 'Material' );

    return program;
}


var ANIM_FPS = 30;
var ANIM_STEP = 1.0 / ANIM_FPS;

function createScene() {

    var MoonUpdateCallback = function() {};

    MoonUpdateCallback.prototype = {
        angle : 0,
        revolve: 0,
        update : function(node, nv) {
            var t = nv.getFrameStamp().getSimulationTime();
            var dt = t - node._lastUpdate;
            if ( dt < ANIM_STEP ) {
                return true;
            }

            var m = node.getMatrix();
            osg.Matrix.makeRotate(this.angle, 0, 0, 1, m);
            osg.Matrix.setTrans(m, 10, 0, 0);

            //Rotate about origin
            var origRotate = osg.Matrix.makeRotate(this.revolve, 0, 0, 1, osg.Matrix.create());
            osg.Matrix.mult(origRotate, m, m);
            node._lastUpdate = t;

            this.angle += 0.04;
            this.revolve += 0.06;
            return true;
        }
    }

    // Here we create a special Node
    // that will hold the transformation.
    var group = new osg.MatrixTransform();
    group.setMatrix( osg.Matrix.makeTranslate( 0, 0, 0, osg.Matrix.create() ) );

    //Box
    var shader = getShader();
    var size = 5;
    var box = osg.createTexturedBox( 0, 0, 0, size, size, size );
    box.getOrCreateStateSet().setAttributeAndModes(shader);

    var density = osg.Uniform.createFloat1( 0.045, 'density' );
    box.getOrCreateStateSet().addUniform(density);
    box.getOrCreateStateSet().addUniform(osg.Uniform.createFloat4([0.3, 0.54, 0.39, 1.0], 'diffuse'));

    group.addChild( box );

    //Sphere
    var sphereT = new osg.MatrixTransform();
    sphereT.setMatrix(osg.Matrix.makeTranslate(9, 0, 0, osg.Matrix.create()));
    sphereT.addUpdateCallback(new MoonUpdateCallback());

    var sphere = osg.createTexturedSphere(6);
    sphere.getOrCreateStateSet().setAttributeAndModes(shader);
    sphere.getOrCreateStateSet().addUniform(osg.Uniform.createFloat4([0.7, 0.54, 0.39, 1.0], 'diffuse'));

    sphereT.addChild(sphere);
    group.addChild(sphereT);

    //Light params
    var mainNode = new osg.Node();
    mainNode.addChild( group );
    var mainSS = mainNode.getOrCreateStateSet();
    mainSS.addUniform(osg.Uniform.createFloat4([0.1, 0.54, 0.65, 1.0], 'pLightColor0'));
    mainSS.addUniform(osg.Uniform.createFloat3([0.0, 0.0, 50.0], 'pLightPos0'));
    mainSS.addUniform(osg.Uniform.createFloat1(2.0, 'pLightAttn0'));
    mainSS.addUniform(osg.Uniform.createFloat3([225/255, 228/255, 181/255], 'ambientLight'));

    mainNode.getOrCreateStateSet().setAttributeAndModes( new osg.CullFace( 'DISABLE' ) );

    

    var viewMatrixArr = viewer.getCamera().getViewMatrix();
    var ViewMatrix = osg.Uniform.createMatrix4( viewMatrixArr, 'ViewMatrix' );
    mainNode.getOrCreateStateSet().addUniform( ViewMatrix );

    //Update callback
    var CameraUpdateCallback = function() {};
    CameraUpdateCallback.prototype = {
        update : function(node, nv) {
            var viewMat = viewer.getCamera().getViewMatrix();
            var ViewMatrix = osg.Uniform.createMatrix4( viewMat, 'ViewMatrix' );
            mainNode.getOrCreateStateSet().addUniform( ViewMatrix );
            node.traverse(nv);
        }
    }

    mainNode.setUpdateCallback(new CameraUpdateCallback());
    return mainNode;
}

var main = function() {
    // The 3D canvas.
    var canvas = document.getElementById( '3DView' );


    // The viewer
    viewer = new osgViewer.Viewer( canvas );
    viewer.init();
    // viewer.setLightingMode( osgViewer.View.LightingMode.NO_LIGHT );
    // viewer.setLight( lightnew );

    var mainNode = createScene();
    viewer.getCamera().setClearColor( [ 0.7, 0.3, 0.3, 1.0 ] );
    viewer.setSceneData( mainNode );
    viewer.setupManipulator();

    //Camera update callback
    var camera = viewer.getCamera();
    

    viewer.run();

    
}

window.addEventListener( 'load', main, true );