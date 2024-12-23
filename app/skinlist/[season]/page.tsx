"use client"
import skins from "@/public/skins.json"; // skins should be a Record<string, Season>
import { Object3D, Scene, TextureLoader } from "three";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

type Skin = {
    name: string;
    path: string;
};

type Season = {
    name: string;
    type: "season" | "handmade" | "other";
    skins: Skin[];
};

function isMeshType(object?: Object3D): object is THREE.Mesh {
    return object?.type === "Mesh";
}

async function init(
    canvasWidth: number,
    canvasHeight: number,
    canvas: HTMLCanvasElement,
    skinsDiv: HTMLDivElement,
    season: Season
) {
    const skins = season.skins;
    const scenes: Scene[] = [];
    for (const value of skins) {
        // Scene setup
        const scene = new THREE.Scene();
        const card = document.createElement("div");
        card.className = "flex flex-col shadow-2xl border border-neutral-800 w-[190px] p-2 rounded";
        const skinElement = document.createElement("div");
        skinElement.className = "mx-auto";
        skinElement.style.width = canvasWidth ? canvasWidth + "px" : "100px";
        skinElement.style.height = canvasHeight ? canvasHeight + "px" : "200px";
        card.appendChild(skinElement);
        const hr = document.createElement("hr");
        hr.className = "w-10/12 mx-auto mt-2 border-b-2 rounded";
        card.appendChild(hr);
        const name = document.createElement("p");
        name.className = "text-center text-xl font-semibold text-cyan-100 underline";
        name.innerText = value.name;
        name.onclick = () => {
            const canvas = document.createElement("canvas") as HTMLCanvasElement;
            if (canvas) {
                const img = new Image();
                img.src = "../skins/" + value.path; // Skin image path
                img.onload = () => {
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                        canvas.width = 64;
                        canvas.height = 64;
                        ctx.drawImage(img, 0, 0, 64, 64);
                        const link = document.createElement("a");
                        link.href = canvas.toDataURL("image/png");
                        link.download = "skin.png";
                        link.click();
                    }
                };
            }
        };
        card.appendChild(name);
        scene.userData.element = skinElement;
        skinsDiv.appendChild(card);

        // CAMERA
        const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 1, 800000);
        camera.position.set(3, 0, 0);
        camera.rotateZ(10);
        scene.userData.camera = camera;

        // CONTROLS
        const cameraControls = new OrbitControls(camera, scene.userData.element);
        cameraControls.enablePan = false;
        scene.userData.controls = cameraControls;

        // LIGHTS
        const ambientLight = new THREE.AmbientLight(0x7c7c7c, 10.0);
        ambientLight.position.set(0.32, 0.39, 0.7);
        const light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        light.position.set(0.32, 0, 0);
        const light2 = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        light2.position.set(0, 0, 0.7);
        const light3 = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        light3.position.set(-0.32, 0, 0);
        const light4 = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        light4.position.set(0, 0, -0.7);
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
        const skin = await textureLoader.loadAsync("../skins/" + value.path);
        skin.magFilter = THREE.NearestFilter;
        skin.minFilter = THREE.NearestFilter;

        // Apply texture to model
        model.scene.traverse(object => {
            if (isMeshType(object)) {
                const texture = (object.material as THREE.MeshBasicMaterial).map;
                if (texture?.source) {
                    texture.source = skin.source;
                }
            }
        });

        model.scene.position.set(0, -1, 0);
        model.scene.rotation.set(0, -1.2, 0);
        scene.add(model.scene);
        scenes.push(scene);
    }

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
    renderer.setClearColor(0x13131c, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setAnimationLoop(() => render(renderer, canvas, scenes));
}

function updateSize(renderer: THREE.WebGLRenderer, canvas: HTMLCanvasElement) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width || canvas.height !== height) {
        renderer.setSize(width, height, false);
    }
}

function render(renderer: THREE.WebGLRenderer, canvas: HTMLCanvasElement, scenes: Scene[]) {
    updateSize(renderer, canvas);

    canvas.style.transform = `translateY(${window.scrollY}px)`;

    renderer.setClearColor(0x13131c);
    renderer.setScissorTest(false);
    renderer.clear();

    renderer.setClearColor(0x1f2937);
    renderer.setScissorTest(true);

    scenes.forEach(function (scene) {
        scene.children[0].rotation.y = Date.now() * 0.001;

        const element = scene.userData.element;
        const rect = element.getBoundingClientRect();

        if (rect.bottom < 0 || rect.top > renderer.domElement.clientHeight ||
            rect.right < 0 || rect.left > renderer.domElement.clientWidth) {
            return;
        }

        const width = rect.right - rect.left;
        const height = rect.bottom - rect.top;
        const left = rect.left;
        const bottom = renderer.domElement.clientHeight - rect.bottom;

        renderer.setViewport(left, bottom, width, height);
        renderer.setScissor(left, bottom, width, height);

        const camera = scene.userData.camera;
        renderer.render(scene, camera);
    });
}

export default function SkinList() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const divRef = useRef<HTMLDivElement>(null);
    const isMounted = useRef(false);
    const params = useParams();
    const [season, setSeason] = useState<Season | null>(null);

    // Extract seasonId from URL params
    const seasonId = params?.season;

    // Set the season data when the params change
    useEffect(() => {
        //@ts-expect-error eslint почему то ругается
        if (seasonId && skins[seasonId]) {
            //@ts-expect-error eslint почему то ругается
            setSeason(skins[seasonId]);
        }
    }, [seasonId]);

    // Initialize WebGL when component mounts
    useEffect(() => {
        if (canvasRef.current && divRef.current && season && !isMounted.current) {
            init(160, 200, canvasRef.current, divRef.current, season).then();
            isMounted.current = true;
        }
    }, [season]);

    return (
        <div className="min-h-screen flex flex-col">
            {season && (
                <>
                    <p className="text-center h-fit text-white text-5xl font-semibold mt-20 z-30">
                        {season.type !== "handmade" && "Скины по"} {season.type === "season" && "сезону"} {season.name}
                    </p>

                    <canvas className="w-full h-full absolute left-0 top-0" ref={canvasRef}/>
                    <div className="flex justify-center">
                        <div
                            className="flex max-w-[75%] flex-wrap gap-2 mt-5 max-sm:flex-col justify-start absolute z-10"
                            ref={divRef}
                        >
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
