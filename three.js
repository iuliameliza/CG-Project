let renderer,
    scene,
    camera,
    sphereBg,
    nucleus,
    objs,
    controls,
    container = document.getElementById("canvas_container"),
    timeout_Debounce,
    noise = new SimplexNoise(),
    blobScale = 5,
    raycaster = new THREE.Raycaster(), // Needed for object intersection
    mouse = new THREE.Vector2(), // Needed for mouse coordinates
    flag = false,
    listener,
    sound,
    audioLoader;

init();
animate();


function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.01, 1000)
    camera.position.set(0, 0, 230);

    const directionalLight = new THREE.DirectionalLight("#ffffff", 0.5);
    directionalLight.position.set(0, 50, 30);
    scene.add(directionalLight);

    let ambientLight = new THREE.AmbientLight("#ffffff", 0.75);
    ambientLight.position.set(0, 20, 20);
    scene.add(ambientLight);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // OrbitControl
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1;
    controls.maxDistance = 350;
    controls.minDistance = 100;
    controls.enablePan = false;
    controls.enableKeys = false;

    const loader = new THREE.TextureLoader();
    const textureSphereBg = loader.load('https://i.ibb.co/Ldk6xP3/image-2022-05-19-172225298.png');
    const textureParticle = loader.load("https://i.ibb.co/FzwqgpD/toppng-com-coolest-pink-galaxy-background-blue-light-star-particle-light-particle-989x1014.png");
    const textureCloud = loader.load("https://i.ibb.co/K2cJzpz/CITYPNG-COM-Download-White-Grey-Real-Sky-Cloud-PNG-1738x884.png");
    const textureRainDrop = loader.load("https://i.ibb.co/xSYdfkt/pngwing-com-2.png");
    const textureBirds = loader.load("https://i.ibb.co/Df8LZc4/pngwing-com-3.png");

    // Audio
    listener = new THREE.AudioListener();
    camera.add(listener);

    sound = new THREE.Audio(listener);
    // let stream = 'https://drive.google.com/file/d/1kICw6ctLl-p25e6cPnNDRfZpRRmLJyyy/view?usp=sharing';
    let stream = 'New Home (Slowed).mp3';

    audioLoader = new THREE.AudioLoader();
    audioLoader.load(stream, function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.05);
        sound.setLoop(true);
        // sound.play();
    });

    // Center nucleus
    let icosahedronGeometry = new THREE.IcosahedronGeometry(45, 50);
    let lambertMaterial = new THREE.MeshPhongMaterial({
        color: '#FFC0CB',
        shininess: 500,
        shading: THREE.SmoothShading,
        reflectivity: 1
    });
    nucleus = new THREE.Mesh(icosahedronGeometry, lambertMaterial);
    scene.add(nucleus);

    // Sphere  Background
    textureSphereBg.anisotropy = 64;
    let geometrySphereBg = new THREE.SphereBufferGeometry(150, 50, 50);
    let materialSphereBg = new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: textureSphereBg,
        color: "#F8CDE6"
    });
    sphereBg = new THREE.Mesh(geometrySphereBg, materialSphereBg);
    scene.add(sphereBg);


    // Moving Objects
    let objGeometry = new THREE.Geometry();

    for (let i = 0; i < 100; i++) {
        let particle = randomPointSphere(150);

        particle.velocity = THREE.MathUtils.randInt(50, 200);

        particle.startX = particle.x;
        particle.startY = particle.y;
        particle.startZ = particle.z;

        objGeometry.vertices.push(particle);
    }
    let objMaterial = new THREE.PointsMaterial({
        size: 10,
        color: "#ece1bc",
        transparent: true,
        opacity: 0.7,
        map: textureParticle,
        blending: THREE.AdditiveBlending,
    });
    objMaterial.depthWrite = false;
    objs = new THREE.Points(objGeometry, objMaterial);
    scene.add(objs);

    // Fixed Objs
    function createFloatingObjs(texture, size, total, color, blending) {
        let pointGeometry = new THREE.Geometry();
        let pointMaterial = new THREE.PointsMaterial({
            size: size,
            map: texture,
            transparent: true,
            blending: blending,
            opacity: 0.8,
            color: color,
            alphaTest: 0.05
        });

        for (let i = 0; i < total; i++) {
            let radius = THREE.MathUtils.randInt(135, 100);
            let particles = randomPointSphere(radius);
            pointGeometry.vertices.push(particles);
        }
        return new THREE.Points(pointGeometry, pointMaterial);
    }
    scene.add(createFloatingObjs(textureCloud, 90, 10, "#ffffff", THREE.NormalBlending));
    scene.add(createFloatingObjs(textureRainDrop, 5, 100, '#ffffff', THREE.AdditiveBlending));
    scene.add(createFloatingObjs(textureBirds, 25, 15, '#ffffff', THREE.NormalBlending));


    function randomPointSphere(radius) {
        let theta = 2 * Math.PI * Math.random();
        let phi = Math.acos(2 * Math.random() - 1);
        let dx = 0 + (radius * Math.sin(phi) * Math.cos(theta));
        let dy = 0 + (radius * Math.sin(phi) * Math.sin(theta));
        let dz = 0 + (radius * Math.cos(phi));
        return new THREE.Vector3(dx, dy, dz);
    }

}


function animate() {
    // Objs  Animation
    objs.geometry.vertices.forEach(function (v) {
        v.x += (0 - v.x) / v.velocity;
        v.y += (0 - v.y) / v.velocity;
        v.z += (0 - v.z) / v.velocity;

        v.velocity -= 0.3;

        if (v.x <= 5 && v.x >= -5 && v.z <= 5 && v.z >= -5) {
            v.x = v.startX;
            v.y = v.startY;
            v.z = v.startZ;
            v.velocity = THREE.MathUtils.randInt(50, 300);
        }
    });


    // Nucleus Animation
    nucleus.geometry.vertices.forEach(function (v) {
        let time = Date.now();
        v.normalize();
        let distance = nucleus.geometry.parameters.radius + noise.noise3D(
            v.x + time * 0.0005,
            v.y + time * 0.0003,
            v.z + time * 0.0008
        ) * blobScale;
        v.multiplyScalar(distance);
    })
    nucleus.geometry.verticesNeedUpdate = true;
    nucleus.geometry.normalsNeedUpdate = true;
    nucleus.geometry.computeVertexNormals();
    nucleus.geometry.computeFaceNormals();
    nucleus.rotation.y += 0.002;

    // Sphere Background Animation
    // sphereBg.rotation.x += 0.002;
    sphereBg.rotation.y += 0.002;
    // sphereBg.rotation.z += 0.002;


    controls.update();
    objs.geometry.verticesNeedUpdate = true;
    window.addEventListener('click', onDocumentMouseDown, false);
    window.addEventListener('keydown', onDocumentKeyDown, false);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

function onDocumentKeyDown(event) {
    let keyCode = event.which;

    if (keyCode == 87 || keyCode == 38) { // Up (W)
        if (nucleus.geometry.parameters.radius < 70)
            nucleus.geometry.parameters.radius += 2;
    } else if (keyCode == 83 || keyCode == 40) { // Down (S)
        if (nucleus.geometry.parameters.radius > 20)
            nucleus.geometry.parameters.radius -= 2;
    } else if (keyCode == 32) { // Space
        if (flag == false) {    // Audio Stopped
            flag = true;
            sound.play();
        } else {                //Audio playing
            flag = false;
            sound.pause();
        }
    }
};

function onDocumentMouseDown(event) {
    // mouse coordinates:
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    // converting 2d coordinates to 3d Space:
    raycaster.setFromCamera(mouse, camera);
    // checking if it intersects with an array object
    var intersects = raycaster.intersectObjects([nucleus]);

    // change the color:
    if (intersects.length > 0) {
        let h = Math.random();
        intersects[0].object.material.color.setHSL(h, 1, 0.85);
    }
}

// Resize
window.addEventListener("resize", () => {
    clearTimeout(timeout_Debounce);
    timeout_Debounce = setTimeout(onWindowResize, 80);
});
function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

