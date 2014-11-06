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

        //scene.add(new THREE.AmbientLight(0x333333));

        var light = new THREE.DirectionalLight(0xffffff, .5);
        light.position.set( -1, 0, 1 ).normalize();
        scene.add(light);

    var sphere = createSphere(radius, segments);
        sphere.rotation.y = rotation;
        scene.add(sphere)

    var clouds = createClouds(radius, segments);
        clouds.rotation.y = rotation;
        scene.add(clouds)

        var stars = createStars(6371, 64);
        scene.add(stars);

        var controls = new THREE.TrackballControls(camera);

        webglEl.appendChild(renderer.domElement);

        render();

        function render() {
                controls.update();
                sphere.rotation.y += 0.00005;
                clouds.rotation.y += 0.0005;
                requestAnimationFrame(render);
                renderer.render(scene, camera);
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

        function createStars1(radius, segments) {
                return new THREE.Mesh(
                        new THREE.SphereGeometry(radius, segments, segments),
                        new THREE.MeshBasicMaterial({
                                map:  THREE.ImageUtils.loadTexture('images/galaxy_starfield.png'),
                                side: THREE.BackSide
                        })
                );
        }
        function createStars(radius, segments) {
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
      }
}());
