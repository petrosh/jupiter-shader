// Based on code created by Bjorn Sandvik at thematicmapping.org
(function () {

        var webglEl = document.getElementById('webgl');

        if (!Detector.webgl) {
                Detector.addGetWebGLMessage(webglEl);
                return;
        }

        var width  = window.innerWidth,
                height = window.innerHeight;

        // Earth params
        var radius   = 0.5,
                segments = 32,
                rotation = 6;

        var scene = new THREE.Scene();

        var camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
        camera.position.z = 1.5;

        var renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);

        renderer.autoClear = false; // ADDED
        //scene.add(new THREE.AmbientLight(0x333333));

        var light = new THREE.DirectionalLight(0xffffff, .5);
        light.position.set( 1, 0, 1 ).normalize();
        scene.add(light);

        // UNIFORMS
        var shader = THREE.ShaderLib[ "normalmap" ];
				var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

				//uniforms[ "tNormal" ].value = normalTexture;
				uniforms[ "uNormalScale" ].value.set( 0.85, 0.85 );

				//uniforms[ "tDiffuse" ].value = planetTexture;
				//uniforms[ "tSpecular" ].value = specularTexture;

				uniforms[ "enableAO" ].value = false;
				uniforms[ "enableDiffuse" ].value = true;
				uniforms[ "enableSpecular" ].value = true;

				uniforms[ "diffuse" ].value.setHex( 0xffffff );
				uniforms[ "specular" ].value.setHex( 0x333333 );
				uniforms[ "ambient" ].value.setHex( 0x000000 );

				uniforms[ "shininess" ].value = 15;

				var parameters = {

					fragmentShader: shader.fragmentShader,
					vertexShader: shader.vertexShader,
					uniforms: uniforms,
					lights: true,
					fog: true

				};

				var materialNormalMap = new THREE.ShaderMaterial( parameters );
      // GO CREATE

    var sphere = createSphere(radius, segments);
        sphere.rotation.y = rotation;
        scene.add(sphere)

    var clouds = createClouds(radius, segments);
        clouds.rotation.y = rotation;
        scene.add(clouds)

        var stars = createStars(90, 64);
        scene.add(stars);

        var controls = new THREE.TrackballControls(camera);

        render();

        function render() {
          controls.update();
          sphere.rotation.y += 0.00005;
          clouds.rotation.y += 0.0005;
          postprocess();
          webglEl.appendChild(renderer.domElement);
          requestAnimationFrame(render);
          renderer.render(scene, camera);
        }

        function postprocess(){
          var renderModel = new THREE.RenderPass( scene, camera );
          //renderModel.autoClear = false; // ADDED
          var effectFilm = new THREE.FilmPass( 0.35, 0.75, 2048, false );
          effectFilm.renderToScreen = true;
          composer = new THREE.EffectComposer( renderer );
          composer.addPass( renderModel );
          composer.addPass( effectFilm );
        }

        function createSphere(radius, segments) {
                return new THREE.Mesh(
                        new THREE.SphereGeometry(radius, segments, segments),
                        new THREE.MeshPhongMaterial({
                                map:         THREE.ImageUtils.loadTexture('images/jupitermap.jpg'),
                                specular:    new THREE.Color('grey'),
                                reflectivity: 0,
                                shininess: 0
                        })
                );
        }

        function createClouds(radius, segments) {
                return new THREE.Mesh(
                        new THREE.SphereGeometry(radius + 0.003, segments, segments),
                        new THREE.MeshPhongMaterial({
                                map:         THREE.ImageUtils.loadTexture('images/atmosphere.png'),
                                transparent: true
                        })
                );
        }

        function createStars(radius, segments) {
                return new THREE.Mesh(
                        new THREE.SphereGeometry(radius, segments, segments),
                        new THREE.MeshBasicMaterial({
                                map:  THREE.ImageUtils.loadTexture('images/galaxy_starfield.png'),
                                side: THREE.BackSide
                        })
                );
        }

}());
