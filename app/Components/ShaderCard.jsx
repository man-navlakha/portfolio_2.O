"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ShaderCard({ showOverlay = true }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    const { clientWidth, clientHeight } = mountRef.current;
    renderer.setSize(clientWidth, clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = "anonymous";
    const imageTexture = textureLoader.load(
      "https://ik.imagekit.io/pxc/mannavlakha/ps.png",
      (tex) => {
        // Once loaded, pass real image aspect ratio to shader
        const imgW = tex.image.naturalWidth || tex.image.width;
        const imgH = tex.image.naturalHeight || tex.image.height;
        uniforms.u_imageAspect.value = imgW / imgH;
      }
    );

    const uniforms = {
      u_image: { value: imageTexture },
      u_time: { value: 0.0 },
      u_hoverState: { value: 0.0 },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_resolution: {
        value: new THREE.Vector2(clientWidth, clientHeight),
      },
      u_imageAspect: { value: 1.0 }, // updated on texture load
    };

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform sampler2D u_image;
      uniform float u_time;
      uniform float u_hoverState;
      uniform vec2 u_mouse;
      uniform vec2 u_resolution;
      uniform float u_imageAspect;
      
      varying vec2 vUv;

      // Compute "object-fit: cover" UVs
      vec2 coverUv(vec2 uv, float containerAspect, float imageAspect) {
        vec2 result = uv;
        if (imageAspect > containerAspect) {
          // Image is wider than container → crop sides
          float scale = containerAspect / imageAspect;
          result.x = uv.x * scale + (1.0 - scale) * 0.5;
        } else {
          // Image is taller than container → crop top/bottom
          float scale = imageAspect / containerAspect;
          result.y = uv.y * scale + (1.0 - scale) * 0.5;
        }
        return result;
      }

      void main() {
        vec2 uv = vUv;
        float containerAspect = u_resolution.x / u_resolution.y;

        float ribs = 60.0;
        
        float ribFract = fract(uv.x * ribs);
        float ribDistortion = (ribFract - 0.5) * 2.0;

        vec2 aspect = vec2(containerAspect, 1.0);
        float dist = distance(uv * aspect, u_mouse * aspect);
        
        // Increased the radius from 0.4 to 0.8
        float hoverIntensity = smoothstep(0.8, 0.0, dist) * u_hoverState;

        float finalDistortion = ribDistortion * 0.015 * (1.0 - hoverIntensity);
        vec2 distortedUv = vec2(uv.x + finalDistortion, uv.y);

        // Apply cover mapping so the image isn't stretched
        vec2 coverMappedUv = coverUv(distortedUv, containerAspect, u_imageAspect);

        vec4 texColor = texture2D(u_image, coverMappedUv);

        float ribLight = sin(uv.x * ribs * 3.14159 * 2.0) * 0.08;
        texColor.rgb += ribLight * (1.0 - hoverIntensity);

        gl_FragColor = texColor;
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let targetHoverState = 0;

    const el = mountRef.current;

    const onMouseMove = (event) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = 1.0 - (event.clientY - rect.top) / rect.height;
      uniforms.u_mouse.value.set(x, y);
    };

    const onMouseEnter = () => {
      targetHoverState = 1.0;
    };
    const onMouseLeave = () => {
      targetHoverState = 0.0;
    };

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseenter", onMouseEnter);
    el.addEventListener("mouseleave", onMouseLeave);

    const onResize = () => {
      if (!el) return;
      const width = el.clientWidth;
      const height = el.clientHeight;
      renderer.setSize(width, height);
      uniforms.u_resolution.value.set(width, height);
    };
    window.addEventListener("resize", onResize);

    let animationFrameId;
    const clock = new THREE.Clock();

    const render = () => {
      uniforms.u_time.value = clock.getElapsedTime();

      uniforms.u_hoverState.value +=
        (targetHoverState - uniforms.u_hoverState.value) * 0.05;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", onResize);
      if (el) {
        el.removeEventListener("mousemove", onMouseMove);
        el.removeEventListener("mouseenter", onMouseEnter);
        el.removeEventListener("mouseleave", onMouseLeave);
        if (el.contains(renderer.domElement)) {
          el.removeChild(renderer.domElement);
        }
      }
      cancelAnimationFrame(animationFrameId);
      geometry.dispose();
      material.dispose();
      imageTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full cursor-pointer group overflow-hidden bg-black" style={{ borderRadius: 'inherit' }}>
      <div ref={mountRef} className="absolute inset-0 w-full h-full z-0" />

      {showOverlay && (
        <div className="absolute inset-0 z-10 flex flex-col justify-between pointer-events-none">
          <div className="relative flex justify-end p-8">
            <div className="absolute right-[0px] w-30 h-30 bg-black/80 blur-3xl rounded-full" />
            <h3
              className="relative text-white font-bold text-xl leading-tight text-right rotate-[-5deg] drop-shadow-2xl opacity-90 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-105"
              style={{
                fontFamily: "'Comic Sans MS', cursive, sans-serif",
              }}
            >
              Portfolio
              <br />
              &apos;2025
            </h3>
          </div>

          <div className="w-full p-8 pt-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-1 drop-shadow-lg translate-y-2 transition-transform duration-500 group-hover:translate-y-0">
            <h1 className="text-white font-extrabold sm:text-4xl text-3xl">
              Man Navlakha
            </h1>
            <span className="text-gray-200 text-md font-medium tracking-wide">
              Developer • Designer • Creator
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
