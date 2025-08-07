import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

const Galaxy = () => {
  const pointsRef = useRef();
  const materialRef = useRef();

  useEffect(() => {
    const particles = 5000;
    const positions = new Float32Array(particles * 3);
    const colors = new Float32Array(particles * 3);
    const sizes = new Float32Array(particles);

    const color = new THREE.Color();
    const radius = 100;
    const branches = 6;
    const spin = 1;
    const randomness = 0.5;
    const randomnessPower = 4;
    const insideColor = '#ff6030';
    const outsideColor = '#1b3984';

    const insideColorObj = new THREE.Color(insideColor);
    const outsideColorObj = new THREE.Color(outsideColor);

    for (let i = 0; i < particles; i++) {
      const i3 = i * 3;
      const branchAngle = (i % branches) * (Math.PI * 2) / branches;
      const randomX = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness;
      const randomY = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness;
      const randomZ = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness;
      const distance = Math.random() * radius;
      const mixedColor = insideColorObj.clone().lerp(outsideColorObj, distance / radius);

      positions[i3] = Math.cos(branchAngle + distance * spin) * distance + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + distance * spin) * distance + randomZ;

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;

      sizes[i] = Math.random() * 3;
    }

    pointsRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointsRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    pointsRef.current.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  }, []);

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001;
      pointsRef.current.rotation.x += 0.0005;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <shaderMaterial
        ref={materialRef}
        vertexShader={`
          attribute float size;
          varying vec3 vColor;
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying vec3 vColor;
          void main() {
            float r = length(gl_PointCoord - vec2(0.5));
            if (r > 0.5) discard;
            float alpha = 1.0 - smoothstep(0.4, 0.5, r);
            vec3 color = vColor * alpha;
            gl_FragColor = vec4(color, alpha);
          }
        `}
        vertexColors
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

const Stars = () => {
  const pointsRef = useRef();

  useEffect(() => {
    const stars = 2000;
    const positions = new Float32Array(stars * 3);
    for (let i = 0; i < stars; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 2000;
      positions[i3 + 1] = (Math.random() - 0.5) * 2000;
      positions[i3 + 2] = (Math.random() - 0.5) * 2000;
    }
    pointsRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial color="#ffffff" size={0.5} sizeAttenuation transparent opacity={0.8} />
    </points>
  );
};

const Nebula = () => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[80, 32, 32]} />
      <shaderMaterial
        transparent
        opacity={0.15}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float time;
          varying vec3 vNormal;
          void main() {
            vec3 color1 = vec3(0.2, 0.1, 0.5);
            vec3 color2 = vec3(0.8, 0.2, 0.9);
            vec3 color3 = vec3(0.1, 0.4, 0.8);
            float noise = sin(vNormal.x * 10.0 + time) * sin(vNormal.y * 10.0 + time) * sin(vNormal.z * 10.0 + time);
            noise = (noise + 1.0) * 0.5;
            vec3 color = mix(color1, color2, noise);
            color = mix(color, color3, abs(vNormal.y) * 0.5);
            float alpha = 0.1 + 0.2 * noise + 0.1 * abs(vNormal.y);
            gl_FragColor = vec4(color, alpha);
          }
        `}
        uniforms={{ time: { value: 0 } }}
      />
    </mesh>
  );
};

const App = () => {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas camera={{ position: [0, 0, 150], fov: 45 }}>
        <color attach="background" args={['#000000']} />
        <Galaxy />
        <Stars />
        <Nebula />
        <ambientLight intensity={0.1} />
        <pointLight position={[100, 100, 100]} intensity={1} color="#ffaa00" />
        <OrbitControls
          enableZoom
          enablePan
          enableRotate
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>

      <div className="absolute top-10 left-10 text-white z-10">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          3D 粒子银河
        </h1>
        <p className="text-lg text-gray-300">
          旋转、缩放以探索宇宙的奥秘
        </p>
      </div>

      <div className="absolute bottom-10 right-10 text-white text-sm opacity-70">
        使用鼠标控制视角 • 双击可重置视图
      </div>
    </div>
  );
};

export default App;