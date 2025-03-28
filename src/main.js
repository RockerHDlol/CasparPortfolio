import * as THREE from 'three';
import './style.scss'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { color } from 'three/tsl';

const canvas = document.querySelector("#experience-canvas")
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

//Loadres
const textureLoader = new THREE.TextureLoader();

// Instantiate a loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

// Texture Loader wenn ich mehr will dan Second usw. und , am ende von first
const textureMap = {
    Baked: {
        day: "/textures/Room/Day/Texture.webp",
    },
};

const loadedTextures = {
    day: {},
};

Object.entries(textureMap).forEach(([key, paths])=>{
    const dayTexture = textureLoader.load(paths.day);
    dayTexture.flipY = false;
    dayTexture.colorSpace = THREE.SRGBColorSpace
    loadedTextures.day[key] = dayTexture;
});

const scene = new THREE.Scene();
loader.load("/models/Room_Portfolio.glb", (glb)=> {
    glb.scene.traverse((child)=> {
        if(child.isMesh) {
            Object.keys(textureMap).forEach((key) => {
                if(child.name.includes(key)) {
                    const material = new THREE.MeshBasicMaterial({
                        map: loadedTextures.day[key],
                    });

                    child.material = material;

                    if(child.material.map){
                        child.material.map.minFilter = THREE.LinearFilter;
                    }
                }
            });
        }
    });
    scene.add(glb.scene);
});


const camera = new THREE.PerspectiveCamera( 
    35, 
    sizes.width / sizes.height, 
    0.1, 
    1000 
);
camera.position.set(
    7.117271355794427,
    4.0791725040876425,
    -3.780114521883597
);

const renderer = new THREE.WebGLRenderer({ canvas:canvas, antialias: true });
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );


const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true; 
controls.dampingFactor = 0.05;
controls.update();
controls.target.set(
    5.880300046754647,
    4.033743924770472,
    -4.231677617667688
);

// Event Listeners
window.addEventListener("resize", ()=>{
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update Camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize( sizes.width, sizes.height );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const render = () =>{
    controls.update();

    //  console.log(camera.position);
    //  console.log("00000000000");
    //  console.log(controls.target);

	renderer.render( scene, camera );

    window.requestAnimationFrame(render)
}

render();