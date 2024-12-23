"use client"
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Object3D, PerspectiveCamera, Scene, TextureLoader, WebGLRenderer } from "three";
import { useEffect, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

let camera: PerspectiveCamera;
let scene: Scene;
let renderer: WebGLRenderer;
let cameraControls: OrbitControls;
const teapotSize = 300;

type SkinViewerProps = {
    skin: string;
    width?: number;
    height?: number;
    className?: string;
};

function isMeshType(object?: Object3D): object is THREE.Mesh {
    return object?.type === 'Mesh'
}

async function init(canvasWidth: number, canvasHeight: number, container: HTMLDivElement, skinPath: string) {
    // CAMERA
    camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 1, 800000);
    camera.position.set(3, 0, 0);
    camera.rotateZ(10)

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0x7c7c7c, 10.0);
    ambientLight.position.set(0.32, 0.39, 0.7)

    const light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light.position.set(0.32, 0, 0);
    const light2 = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light2.position.set(0, 0, 0.7);
    const light3 = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light3.position.set(-0.32, 0, 0);
    const light4 = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light4.position.set(0, 0, -0.7);
    // scene itself
    scene = new THREE.Scene();
    // scene.background = new THREE.Color( 0xAAAAAA );

    scene.add(ambientLight);
    scene.add(light);
    scene.add(light2);
    scene.add(light3);
    scene.add(light4);

    // Load model and texture
    const modelLoader = new GLTFLoader();
    const textureLoader = new TextureLoader();

    // Load the model (change path as needed)
    const model = await modelLoader.loadAsync("/models/model.gltf");

    // Load the texture
    const skin = await textureLoader.loadAsync(skinPath);
    // Disable texture filtering to prevent smoothing (set to nearest-neighbor)
    skin.magFilter = THREE.NearestFilter;
    skin.minFilter = THREE.NearestFilter;
    // Apply the texture to the model
    model.scene.traverse(object => {
        if (isMeshType(object)) {
            object.material.map.source = skin.source;
        }
    });
    model.scene.position.set(0, -1, 0)
    model.scene.rotation.set(0,-1.2,0)

    // Add the model to the scene
    scene.add(model.scene);

    scene.userData.element = container;
    scene.userData.camera = camera;

    // RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });  // Disable anti-aliasing in renderer
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvasWidth, canvasHeight);
    container.appendChild(renderer.domElement);

    // CONTROLS
    cameraControls = new OrbitControls(camera, renderer.domElement);
    cameraControls.enablePan = false;
    cameraControls.addEventListener('change', () => {
        renderer.render(scene, camera)
    });

    renderer.render(scene, camera)
}

export default function Skin({ skin, width, height, className }: SkinViewerProps) {
    const isMount = useRef(false);
    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (divRef.current && !isMount.current) {
            isMount.current = true;
            init(width ? width : 100, height ? height : 200, divRef.current, skin).then()
        }
    }, []);

    return <div className={className ? className : `w-[${width ? width : 100}px] h-[${height ? height : 200}px]`} ref={divRef}></div>;
}
