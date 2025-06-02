"use client"
import skins from "@/public/skins.json"; // skins should be a Record<string, Season>
import { Scene, TextureLoader } from "three";
import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

type Skin = {
    name: string;
    path: string;
    slim: boolean;
};

type Season = {
    name: string;
    type: "season" | "handmade" | "other";
    skins: Skin[];
};

async function loadSkinTextures(skins: { path: string }[]): Promise<Record<string, THREE.Texture>> {
    const textureLoader = new TextureLoader();
    const textures: Record<string, THREE.Texture> = {};
    await Promise.all(
        skins.map(async (value) => {
            const skinTexture = await textureLoader.loadAsync("../skins/" + value.path);
            skinTexture.flipY = false;
            skinTexture.magFilter = THREE.NearestFilter;
            skinTexture.minFilter = THREE.NearestFilter;
            skinTexture.colorSpace = "srgb";
            skinTexture.format = THREE.RGBAFormat;
            textures[value.path] = skinTexture;
        })
    );
    return textures;
}

async function init(
    canvasWidth: number,
    canvasHeight: number,
    canvas: HTMLCanvasElement,
    skinsDiv: HTMLDivElement,
    season: Season
) {
    const skins = season.skins;
    const textures = await loadSkinTextures(skins);
    const modelLoader = new GLTFLoader();
    const model: GLTF = await modelLoader.loadAsync("/models/model.gltf");
    const modelSlim = await modelLoader.loadAsync("/models/slimmodel.gltf")
    const scenes: Scene[] = [];
    for (const value of skins) {
        const scene = new THREE.Scene();
        const card = document.createElement("div");
        card.className = "flex flex-col shadow-2xl border border-neutral-800 w-[190px] p-2 rounded";
        const skinElement = document.createElement("div");
        skinElement.className = "mx-auto";
        skinElement.style.width = (canvasWidth || 100) + "px";
        skinElement.style.height = (canvasHeight || 200) + "px";
        card.appendChild(skinElement);
        const hr = document.createElement("hr");
        hr.className = "w-10/12 mx-auto mt-2 border-b-2 rounded";
        card.appendChild(hr);
        const name = document.createElement("p");
        name.className = "text-center text-xl font-semibold text-cyan-100 underline";
        name.innerText = value.name;
        name.onclick = () => {
            const downloadCanvas = document.createElement("canvas") as HTMLCanvasElement;
            const img = new Image();
            img.src = "../skins/" + value.path;
            img.onload = () => {
                const ctx = downloadCanvas.getContext("2d");
                if (ctx) {
                    downloadCanvas.width = 64;
                    downloadCanvas.height = 64;
                    ctx.drawImage(img, 0, 0, 64, 64);
                    const link = document.createElement("a");
                    link.href = downloadCanvas.toDataURL("image/png");
                    link.download = "skin.png";
                    link.click();
                }
            };
        };
        card.appendChild(name);
        scene.userData.element = skinElement;
        skinsDiv.appendChild(card);
        const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 1, 800000);
        camera.position.set(3, 0, 0);
        camera.rotation.z = Math.PI / 18;
        scene.userData.camera = camera;
        const cameraControls = new OrbitControls(camera, scene.userData.element);
        cameraControls.enablePan = false;
        scene.userData.controls = cameraControls;
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
        const modelSkin = value.slim ? modelSlim.scene.clone() : model.scene.clone(true);
        const skinTexture = textures[value.path];
        modelSkin.traverse((object) => {
            if ((object as THREE.Mesh).isMesh) {
                const mesh = object as THREE.Mesh;
                if (Array.isArray(mesh.material)) {
                    const materials = mesh.material.map((mat) => {
                        const m = (mat as THREE.MeshBasicMaterial).clone();
                        m.map = skinTexture;
                        m.blendSrc = 200;
                        m.needsUpdate = true;
                        return m;
                    });
                    mesh.material = materials;
                } else {
                    const m = (mesh.material as THREE.MeshBasicMaterial).clone();
                    m.map = skinTexture;
                    m.blendSrc = 200;
                    m.needsUpdate = true;
                    mesh.material = m;
                }
            }
        });
        modelSkin.position.set(0, -1, 0);
        modelSkin.rotation.set(0, -1.2, 0);
        scene.add(modelSkin);
        scenes.push(scene);
    }
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
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

        if (
            rect.bottom < 0 ||
            rect.top > renderer.domElement.clientHeight ||
            rect.right < 0 ||
            rect.left > renderer.domElement.clientWidth
        ) {
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
                    <p className="text-center h-fit text-white text-5xl font-semibold mt-32 z-30">
                        {season.type !== "handmade" && "Скины по"} {season.type === "season" && "сезону"}{" "}
                        {season.name}
                    </p>

                    <canvas className="w-full h-full absolute left-0 top-0" ref={canvasRef} />
                    <div className="flex justify-center">
                        <div
                            className="flex max-w-[75%] flex-wrap gap-2 mt-5 max-sm:flex-col justify-start absolute z-10"
                            ref={divRef}
                        ></div>
                    </div>
                </>
            )}
        </div>
    );
}
