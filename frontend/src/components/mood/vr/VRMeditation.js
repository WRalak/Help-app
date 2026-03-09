import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';

const VRMeditation = () => {
  const containerRef = useRef();
  const sceneRef = useRef();

  useEffect(() => {
    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111122);

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 3);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    document.body.appendChild(VRButton.createButton(renderer));

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;

    // Create peaceful environment
    createMeditationEnvironment(scene);

    // Animation
    const animate = () => {
      renderer.setAnimationLoop(() => {
        controls.update();
        renderer.render(scene, camera);
      });
    };
    animate();

    // Cleanup
    return () => {
      renderer.setAnimationLoop(null);
      renderer.dispose();
    };
  }, []);

  const createMeditationEnvironment = (scene) => {
    // Create a calming skybox
    const skyGeometry = new THREE.SphereGeometry(500, 60, 40);
    const skyMaterial = new THREE.MeshBasicMaterial({
      color: 0x88aaff,
      side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);

    // Add floating particles (like stars or fireflies)
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = (Math.random() - 0.5) * 100;
      positions[i + 2] = (Math.random() - 0.5) * 100;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // Add a peaceful central object (like a glowing orb)
    const orbGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const orbMaterial = new THREE.MeshPhongMaterial({
      color: 0x88aaff,
      emissive: 0x224466,
      transparent: true,
      opacity: 0.8
    });
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    orb.position.set(0, 1.6, -2);
    scene.add(orb);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);

    // Add point lights for atmosphere
    const light1 = new THREE.PointLight(0x4466aa, 1, 10);
    light1.position.set(2, 3, 2);
    scene.add(light1);

    const light2 = new THREE.PointLight(0xaa88ff, 1, 10);
    light2.position.set(-2, 1, -2);
    scene.add(light2);
  };

  return <div ref={containerRef} className="w-full h-screen" />;
};

export default VRMeditation;