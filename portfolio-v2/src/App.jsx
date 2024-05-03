import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './App.css';

function App() {
  const mountRef = useRef(null);
  const lineRefs = useRef([]);
  const sceneRef = useRef(null);
  const [linePresets, setLinePresets] = useState([
    { 
      points: [ // regular pentagon
        new THREE.Vector3(0, 10, 0), // top point
        new THREE.Vector3(10, 2, 0), // top right point
        new THREE.Vector3(5.88, -10, 0), // bottom right point
        new THREE.Vector3(-5.88, -10, 0), // bottom left point
        new THREE.Vector3(-10, 2, 0), // top left point
        new THREE.Vector3(0, 10, 0) // back to top point to close the pentagon
      ], 
      color: 0xffff00,
      checked: true,
      name: "5"
    },
    { 
      points: [ // square
        new THREE.Vector3(10, 10, 0), // top right corner
        new THREE.Vector3(-10, 10, 0), // top left corner
        new THREE.Vector3(-10, -10, 0), // bottom left corner
        new THREE.Vector3(10, -10, 0), // bottom right corner
        new THREE.Vector3(10, 10, 0) // back to top right corner to close the square
      ], 
      color: 0x0000ff,
      checked: true,
      name: "4"
    },
    { 
      points: [ // triangle
        new THREE.Vector3(-10, -10, 0), // bottom left point
        new THREE.Vector3(0, 10, 0), // top point
        new THREE.Vector3(10, -10, 0), // bottom right point
        new THREE.Vector3(-10, -10, 0) // back to bototm left point to close the triangle
      ], 
      color: 0xff0000,
      checked: true,
      name: "3"
    },
    { 
      points: [ // line
        new THREE.Vector3(0, 10, 0), // left point
        new THREE.Vector3(0, -10, 0) // right point
      ], 
      color: 0x00ff00,
      name: "2"
    },
  ]);
  const presetRef = useRef(linePresets);
  const [checkboxState, setCheckboxState] = useState(Array(linePresets.length).fill(true));
  const initialized = useRef(false);

  function isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  useEffect(() => {

    if (!isWebGLAvailable()) {
      alert('WebGL not available');
      return;
    }

    if (initialized.current) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    linePresets.forEach((preset, index) => lineInit(scene, preset, index));

    camera.position.z = 30;

    const animate = function () {
      requestAnimationFrame(animate);

      // Rotate each line
      lineRefs.current.forEach((line) => {
        line.rotation.y += 0.01;
      });

      renderer.render(scene, camera);
    };

    animate();
    
    // save scene to ref for use in lineInit
    sceneRef.current = scene;
    initialized.current = true;
  }, [linePresets]);

  function lineInit(scene, preset, index) {
    const lineMaterial = new THREE.LineBasicMaterial({ color: preset.color });
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(preset.points);
    const line = new THREE.Line(lineGeometry, lineMaterial);
    lineRefs.current.forEach((line, index) => {
      if (presetRef.current[index].checked) {
        line.rotation.y = ((index + 1) / lineRefs.current.length) * 2 * Math.PI; // Calculate rotation amount in radians
      }
    });
    scene.add(line);
    lineRefs.current[index] = line;
  }

  function handleCheckboxChange(index) {
    let newCheckboxState = [...checkboxState];
    newCheckboxState[index] = !newCheckboxState[index];
    setCheckboxState(newCheckboxState);
    lineRefs.current[index].visible = !lineRefs.current[index].visible;
  }


  return (
    <>
      <h1>Polyrhythm</h1>
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', paddingBottom: '4vh'}}>
        {linePresets.map((preset, index) => (
          <span key={index}>
            <input type="checkbox" checked={checkboxState[index]} onChange={() => handleCheckboxChange(index)} />
            <label>{preset.name}</label>
          </span>
        ))}
      </div>
      <div ref={mountRef} style={{ position: 'relative', zIndex: 0 }} />
    </>
  );
}

export default App;