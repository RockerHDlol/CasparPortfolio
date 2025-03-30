import * as THREE from 'three';
import './style.scss'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from "gsap"

const canvas = document.querySelector("#experience-canvas")
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const modals = {
    workPC: document.querySelector(".modal.workPC"),
    workCamera: document.querySelector(".modal.workCamera"),
    workEvent: document.querySelector(".modal.workEvent"),
    aboutMe: document.querySelector(".modal.aboutMe"),
    contact: document.querySelector(".modal.contact"),
};

document.querySelectorAll(".modal-exit-button").forEach(button=>{
    button.addEventListener("click", (e)=>{
        const modal = e.target.closest(".modal");
        hideModal(modal);
    });
});

const showModal = (modal) => {
    modal.style.display = "block";

    gsap.set(modal, {
        opacity: 0
    });

    gsap.to(modal, {
        opacity: 1,
        duration: 0.5,
    });
};

const hideModal = (modal) => {
    gsap.to(modal, {
        opacity: 0,
        duration: 0.5,
        onComplete: ()=>{
            modal.style.display = "none";
        },
    });
};

const raycasterObjects = [];
let currentIntersects = [];

const socialLinks = {
    YouTube: "https://www.youtube.com",
    Instagram: "https://www.instagram.com",
    Artstaion: "https://www.artstation.com",
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

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

window.addEventListener("mousemove", (e)=>{
    pointer.x = ( e.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( e.clientY / window.innerHeight ) * 2 + 1; 
});

window.addEventListener("click", (e)=>{
    if(currentIntersects.length> 0) {
        const object = currentIntersects[0].object;

        Object.entries(socialLinks).forEach(([key, url]) =>{
            if(object.name.includes(key)){
                const newWindow = window.open();
                newWindow.opener = null;
                newWindow.location = url;
                newWindow.target = "_blank";
                newWindow.rel = "noopener noreferrer";
            }
        });

        if (object.name.includes("WorkPC_Button")){
            showModal(modals.workPC);
        }else if (object.name.includes("workCamera_Button")){
            showModal(modals.workCamera);
        }else if (object.name.includes("workEvent_Button")){
            showModal(modals.workEvent);
        }else if (object.name.includes("aboutMe_Button")){
            showModal(modals.aboutMe);
        }else if (object.name.includes("contact_Button")){
            showModal(modals.contact);
        }

    }
});

loader.load("/models/Room_Portfolio.glb", (glb)=> {
    glb.scene.traverse((child)=> {
        if(child.isMesh) {
            if (child.name.includes("Raycaster")){
                raycasterObjects.push(child);
            }
            
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

// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );


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

    // Raycaster

    raycaster.setFromCamera( pointer, camera );

	currentIntersects = raycaster.intersectObjects(raycasterObjects);

	for ( let i = 0; i < currentIntersects.length; i ++ ) {
		currentIntersects[ i ].object.material.color.set( 0xff0000 );
	}

    if (currentIntersects.length > 0) {
        const currentIntersectsObject = currentIntersects[0].object

        if(currentIntersectsObject.name.includes("Pointer")){
                document.body.style.cursor = "pointer";
            }else{
                document.body.style.cursor = "default";
            }
        }else{
            document.body.style.cursor = "default";
        }

	renderer.render( scene, camera );

    window.requestAnimationFrame(render);
}

render();