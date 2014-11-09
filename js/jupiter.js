if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var radius = 6371;
var tilt = 0; // was 0.41 but 0.01 is good
var rotationSpeed = 0.01; // was 0.02 but 0.01 is good

var cloudsScale = 1.005;
var moonScale = 0.23;

var MARGIN = 0;
var SCREEN_HEIGHT = window.innerHeight - MARGIN * 2;
var SCREEN_WIDTH  = window.innerWidth;

var container, stats;
var camera, controls, scene, sceneCube, renderer;
var geometry, meshPlanet, meshClouds, meshMoon;
var dirLight, pointLight, ambientLight;

var d, dPlanet, dMoon, dMoonVec = new THREE.Vector3();

var clock = new THREE.Clock();

init();
animate();

function init() {

  container = document.createElement( 'div' );
  document.body.appendChild( container );
  camera = new THREE.PerspectiveCamera( 25, SCREEN_WIDTH / SCREEN_HEIGHT, 50, 1e7 );
  camera.position.z = radius * 5; // was radius * 5
  camera.position.x = 0;
  camera.position.y = 0;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2( 0x000000, 0.00000025 );

  controls = new THREE.TrackballControls(camera);

  // controls = new THREE.FlyControls( camera );
  //
  // controls.movementSpeed = 1000;
  // controls.domElement = container;
  // controls.rollSpeed = Math.PI / 24;
  // controls.autoForward = false;
  // controls.dragToLook = false;

  dirLight = new THREE.DirectionalLight( 0xffffff, 0.4 );
  dirLight.position.set( 1, 0, 1 ).normalize(); // was 1,0,1
  scene.add( dirLight );

  ambientLight = new THREE.AmbientLight( 0x000000, 0.2 );
  scene.add( ambientLight );

  var planetTexture   = THREE.ImageUtils.loadTexture( "textures/jupitermap.jpg" );
  var cloudsTexture   = THREE.ImageUtils.loadTexture( "textures/earth_clouds_1024.png" );
  var normalTexture   = THREE.ImageUtils.loadTexture( "textures/flat_normal_2048.jpg" );
  var specularTexture = THREE.ImageUtils.loadTexture( "textures/grid_specular_2048.jpg" );

  var moonTexture = THREE.ImageUtils.loadTexture( "textures/moon_1024.jpg" );

  var shader = THREE.ShaderLib[ "normalmap" ];
  var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

  uniforms[ "tNormal" ].value = normalTexture;
  uniforms[ "uNormalScale" ].value.set( 0.85, 0.85 );

  uniforms[ "tDiffuse" ].value = planetTexture;
  uniforms[ "tSpecular" ].value = specularTexture;

  uniforms[ "enableAO" ].value = false;
  uniforms[ "enableDiffuse" ].value = true;
  uniforms[ "enableSpecular" ].value = true;

  uniforms[ "diffuse" ].value.setHex( 0xffffff );
  uniforms[ "specular" ].value.setHex( 0xddce71 );
  uniforms[ "ambient" ].value.setHex( 0x000000 );

  uniforms[ "reflectivity" ].value = 0; // added

  uniforms[ "shininess" ].value = 0; // was 15

  var parameters = {

    fragmentShader: shader.fragmentShader,
    vertexShader: shader.vertexShader,
    uniforms: uniforms,
    lights: true,
    fog: true

  };

  var materialNormalMap = new THREE.ShaderMaterial( parameters );

  // planet

  geometry = new THREE.SphereGeometry( radius, 100, 50 );
  geometry.computeTangents();

  meshPlanet = new THREE.Mesh( geometry, materialNormalMap );
  meshPlanet.rotation.y = 0;
  meshPlanet.rotation.z = tilt;
  scene.add( meshPlanet );

  // clouds

  // var materialClouds = new THREE.MeshLambertMaterial( { color: 0xffffff, map: cloudsTexture, transparent: true } );
  //
  // meshClouds = new THREE.Mesh( geometry, materialClouds );
  // meshClouds.scale.set( cloudsScale, cloudsScale, cloudsScale );
  // meshClouds.rotation.z = tilt;
  // scene.add( meshClouds );

  // moon

  var materialMoon = new THREE.MeshPhongMaterial( { color: 0xffffff, map: moonTexture } );

  meshMoon = new THREE.Mesh( geometry, materialMoon );
  meshMoon.position.set( radius, 0, radius );
  meshMoon.scale.set( moonScale, moonScale, moonScale );
  scene.add( meshMoon );

  // axes
  axis = buildAxes( 1000 );
  scene.add( axis );

  // stars

  var i, r = radius, starsGeometry = [ new THREE.Geometry(), new THREE.Geometry() ];

  for ( i = 0; i < 250; i ++ ) {

    var vertex = new THREE.Vector3();
    vertex.x = Math.random() * 2 - 1;
    vertex.y = Math.random() * 2 - 1;
    vertex.z = Math.random() * 2 - 1;
    vertex.multiplyScalar( r );

    starsGeometry[ 0 ].vertices.push( vertex );

  }

  for ( i = 0; i < 1500; i ++ ) {

    var vertex = new THREE.Vector3();
    vertex.x = Math.random() * 2 - 1;
    vertex.y = Math.random() * 2 - 1;
    vertex.z = Math.random() * 2 - 1;
    vertex.multiplyScalar( r );

    starsGeometry[ 1 ].vertices.push( vertex );

  }

  var stars;
  var starsMaterials = [
    new THREE.PointCloudMaterial( { color: 0x555555, size: 2, sizeAttenuation: false } ),
    new THREE.PointCloudMaterial( { color: 0x555555, size: 1, sizeAttenuation: false } ),
    new THREE.PointCloudMaterial( { color: 0x333333, size: 2, sizeAttenuation: false } ),
    new THREE.PointCloudMaterial( { color: 0x3a3a3a, size: 1, sizeAttenuation: false } ),
    new THREE.PointCloudMaterial( { color: 0x1a1a1a, size: 2, sizeAttenuation: false } ),
    new THREE.PointCloudMaterial( { color: 0x1a1a1a, size: 1, sizeAttenuation: false } )
  ];

  for ( i = 10; i < 30; i ++ ) {

    stars = new THREE.PointCloud( starsGeometry[ i % 2 ], starsMaterials[ i % 6 ] );

    stars.rotation.x = Math.random() * 6;
    stars.rotation.y = Math.random() * 6;
    stars.rotation.z = Math.random() * 6;

    s = i * 10;
    stars.scale.set( s, s, s );

    stars.matrixAutoUpdate = false;
    stars.updateMatrix();

    scene.add( stars );

  }

  renderer = new THREE.WebGLRenderer();
  renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
  renderer.sortObjects = false;

  renderer.autoClear = false;

  container.appendChild( renderer.domElement );

  // stats = new Stats();
  // stats.domElement.style.position = 'absolute';
  // stats.domElement.style.top = '0px';
  // stats.domElement.style.zIndex = 100;
  // container.appendChild( stats.domElement );

  window.addEventListener( 'resize', onWindowResize, false );

  // postprocessing

  var renderModel = new THREE.RenderPass( scene, camera );
  var effectFilm = new THREE.FilmPass( 0.35, 0.75, 2048, false );

  effectFilm.renderToScreen = true;

  composer = new THREE.EffectComposer( renderer );

  composer.addPass( renderModel );
  composer.addPass( effectFilm );

};

function onWindowResize( event ) {

  SCREEN_HEIGHT = window.innerHeight;
  SCREEN_WIDTH  = window.innerWidth;

  renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

  camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
  camera.updateProjectionMatrix();

  composer.reset();

};

function buildAxes( length ) {
        var axes = new THREE.Object3D();

        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true ) ); // -Z

        return axes;

};

function buildAxis( src, dst, colorHex, dashed ) {
        var geom = new THREE.Geometry(),
            mat;

        if(dashed) {
                mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
        } else {
                mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
        }

        geom.vertices.push( src.clone() );
        geom.vertices.push( dst.clone() );
        geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

        var axis = new THREE.Line( geom, mat, THREE.LinePieces );

        return axis;

}

function animate() {
  controls.update();
  requestAnimationFrame( animate );

  render();
  // stats.update();

};

function render() {

  // rotate the planet and clouds

  var delta = clock.getDelta();

  meshPlanet.rotation.y += rotationSpeed * delta;
  // meshClouds.rotation.y += 1.25 * rotationSpeed * delta;

  camera.rotation.z = tilt;

  // slow down as we approach the surface

  dPlanet = camera.position.length();

  dMoonVec.subVectors( camera.position, meshMoon.position );
  dMoon = dMoonVec.length();

  if ( dMoon < dPlanet ) {

    d = ( dMoon - radius * moonScale * 1.01 );

  } else {

    d = ( dPlanet - radius * 1.01 );

  }

  // controls.movementSpeed = 0.33 * d;
  // controls.update( delta );

  renderer.clear();
  composer.render( delta );

};
