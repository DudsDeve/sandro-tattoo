"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { STUDIO } from "@/lib/data/studio";
import {
  decodeTopoJSON,
  easeInOutQuart,
  generateEarthTexture,
  GLOBE_R,
  latLngTo3D,
  normAngle,
} from "@/lib/globe-geo";
import { RegionMap } from "@/components/home/RegionMap";
import "./globe.css";

const GREEN = 0x4c5634;
const GREEN_LIGHT = 0x8b9a6b;
const LAT = STUDIO.address.geo.lat;
const LNG = STUDIO.address.geo.lng;

const ARRIVAL = [
  { zoom: 6, duration: 1600, kicker: "PAÍS", label: "Irlanda" },
  { zoom: 11, duration: 1700, kicker: "CIDADE", label: "Dublin" },
  { zoom: 14, duration: 1800, kicker: "REGIÃO", label: "Área aproximada" },
] as const;

type ThreeBag = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  globe: THREE.Group;
  markerGroup: THREE.Group;
  pin: THREE.Mesh;
  glowSphere: THREE.Mesh;
  rings: Array<{ mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; off: number }>;
  glowMat: THREE.MeshBasicMaterial;
};

type AnimState = {
  animating: boolean;
  zoomed: boolean;
  progress: number;
  direction: "in" | "out";
  startRotY: number;
  startRotX: number;
  startCamZ: number;
  startCamY: number;
  targetRotY: number;
  targetRotX: number;
  baseTargetRotY: number;
  baseTargetRotX: number;
  resetRotY: number;
  bordersLoaded: boolean;
};

type Hud = { kicker: string; label: string } | null;

export function GlobeZoom() {
  const containerRef = useRef<HTMLDivElement>(null);
  const threeRef = useRef<ThreeBag | null>(null);
  const flyToken = useRef(0);
  const anim = useRef<AnimState>({
    animating: false,
    zoomed: false,
    progress: 0,
    direction: "in",
    startRotY: 0,
    startRotX: 0,
    startCamZ: 0,
    startCamY: 0,
    targetRotY: 0,
    targetRotX: 0,
    baseTargetRotY: 0,
    baseTargetRotX: 0,
    resetRotY: 0,
    bordersLoaded: false,
  });

  const [zoomed, setZoomed] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mapOn, setMapOn] = useState(false);
  const [hud, setHud] = useState<Hud>(null);
  const [stageIndex, setStageIndex] = useState(-1);
  const [mapZoom, setMapZoom] = useState<number>(ARRIVAL[0].zoom);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let w = el.clientWidth;
    let h = el.clientHeight;
    const R = GLOBE_R;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 1, 2000);
    camera.position.set(0, 60, 380);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    el.appendChild(renderer.domElement);

    const globe = new THREE.Group();
    scene.add(globe);

    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x060606,
      emissive: 0x020202,
      shininess: 5,
    });
    globe.add(new THREE.Mesh(new THREE.SphereGeometry(R, 64, 64), sphereMat));

    const gridMat = new THREE.LineBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.2 });
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts: THREE.Vector3[] = [];
      for (let lng = 0; lng <= 360; lng += 4) pts.push(latLngTo3D(lat, lng - 180, R + 0.2));
      globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
    }
    for (let lng = -180; lng < 180; lng += 30) {
      const pts: THREE.Vector3[] = [];
      for (let lat = -90; lat <= 90; lat += 4) pts.push(latLngTo3D(lat, lng, R + 0.2));
      globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
    }

    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float rim = pow(0.55 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
          gl_FragColor = vec4(0.298, 0.337, 0.204, 0.9) * rim;
        }`,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    globe.add(new THREE.Mesh(new THREE.SphereGeometry(R * 1.18, 64, 64), atmosMat));

    const innerMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float rim = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          gl_FragColor = vec4(0.298, 0.337, 0.204, 0.2) * rim;
        }`,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      transparent: true,
    });
    globe.add(new THREE.Mesh(new THREE.SphereGeometry(R * 1.005, 64, 64), innerMat));

    const starBuf = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      const sr = 500 + Math.random() * 900;
      const sth = Math.random() * Math.PI * 2;
      const sph = Math.acos(2 * Math.random() - 1);
      starBuf[i * 3] = sr * Math.sin(sph) * Math.cos(sth);
      starBuf[i * 3 + 1] = sr * Math.sin(sph) * Math.sin(sth);
      starBuf[i * 3 + 2] = sr * Math.cos(sph);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starBuf, 3));
    scene.add(
      new THREE.Points(
        starGeo,
        new THREE.PointsMaterial({
          color: 0xffffff,
          size: 0.7,
          transparent: true,
          opacity: 0.45,
          sizeAttenuation: true,
        }),
      ),
    );

    const markerGroup = new THREE.Group();
    const mPos = latLngTo3D(LAT, LNG, R + 2);
    const pinMat = new THREE.MeshBasicMaterial({ color: GREEN_LIGHT });
    const pin = new THREE.Mesh(new THREE.SphereGeometry(2.8, 16, 16), pinMat);
    pin.position.copy(mPos);
    markerGroup.add(pin);

    const glowMat = new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.12 });
    const glowSphere = new THREE.Mesh(new THREE.SphereGeometry(9, 16, 16), glowMat);
    glowSphere.position.copy(mPos);
    markerGroup.add(glowSphere);

    const rings: ThreeBag["rings"] = [];
    for (let i = 0; i < 2; i++) {
      const rMat = new THREE.MeshBasicMaterial({
        color: GREEN,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      });
      const rMesh = new THREE.Mesh(new THREE.RingGeometry(4 + i * 6, 5 + i * 6, 48), rMat);
      rMesh.position.copy(mPos);
      rMesh.lookAt(new THREE.Vector3(0, 0, 0));
      markerGroup.add(rMesh);
      rings.push({ mesh: rMesh, mat: rMat, off: i * Math.PI });
    }

    const beamEnd = mPos.clone().normalize().multiplyScalar(R + 35);
    markerGroup.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([mPos, beamEnd]),
        new THREE.LineBasicMaterial({ color: GREEN, transparent: true, opacity: 0.2 }),
      ),
    );
    markerGroup.visible = false;
    globe.add(markerGroup);

    const dLight = new THREE.DirectionalLight(0x8b9a6b, 0.9);
    dLight.position.set(300, 200, 250);
    scene.add(dLight);
    const dLight2 = new THREE.DirectionalLight(0x4c5634, 0.4);
    dLight2.position.set(-200, -100, -200);
    scene.add(dLight2);
    scene.add(new THREE.AmbientLight(0x1a1a1a, 0.8));

    const tp = latLngTo3D(LAT, LNG);
    anim.current.baseTargetRotY = Math.atan2(tp.x, tp.z);
    anim.current.baseTargetRotX = Math.asin(tp.y / R) * 0.25;

    let borderMat: THREE.LineBasicMaterial | null = null;

    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((r) => r.json())
      .then((topo) => {
        const polygons = decodeTopoJSON(topo, "countries");
        const tex = generateEarthTexture(polygons);
        sphereMat.map = tex;
        sphereMat.needsUpdate = true;

        const linePoints: THREE.Vector3[] = [];
        polygons.forEach((coords) => {
          for (let i = 0; i < coords.length - 1; i++) {
            const [lng1, lat1] = coords[i];
            const [lng2, lat2] = coords[i + 1];
            if (Math.abs(lng2 - lng1) > 90) continue;
            linePoints.push(latLngTo3D(lat1, lng1, R + 0.6));
            linePoints.push(latLngTo3D(lat2, lng2, R + 0.6));
          }
        });

        borderMat = new THREE.LineBasicMaterial({
          color: 0xa8b88c,
          transparent: true,
          opacity: 0,
        });
        globe.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(linePoints), borderMat));
        anim.current.bordersLoaded = true;
        setLoading(false);
      })
      .catch(() => setLoading(false));

    threeRef.current = { scene, camera, renderer, globe, markerGroup, pin, glowSphere, rings, glowMat };

    let time = 0;
    let frameId = 0;

    function tick() {
      frameId = requestAnimationFrame(tick);
      time += 0.016;
      const st = anim.current;

      if (st.bordersLoaded && borderMat && borderMat.opacity < 0.92) {
        borderMat.opacity = Math.min(borderMat.opacity + 0.01, 0.92);
      }

      if (st.animating) {
        st.progress = Math.min(st.progress + 0.006, 1);
        const t = easeInOutQuart(st.progress);

        if (st.direction === "in") {
          globe.rotation.y = THREE.MathUtils.lerp(st.startRotY, st.targetRotY, t);
          globe.rotation.x = THREE.MathUtils.lerp(st.startRotX, st.targetRotX, t);
          camera.position.z = THREE.MathUtils.lerp(st.startCamZ, 158, t);
          camera.position.y = THREE.MathUtils.lerp(st.startCamY, 12, t);

          if (t > 0.35) {
            markerGroup.visible = true;
            const s = Math.min((t - 0.35) / 0.25, 1);
            const e = 1 - Math.pow(1 - s, 3);
            pin.scale.setScalar(e);
            glowSphere.scale.setScalar(e);
            rings.forEach((r) => r.mesh.scale.setScalar(e));
          }
        } else {
          globe.rotation.y = THREE.MathUtils.lerp(st.startRotY, st.resetRotY, t);
          globe.rotation.x = THREE.MathUtils.lerp(st.startRotX, 0, t);
          camera.position.z = THREE.MathUtils.lerp(st.startCamZ, 380, t);
          camera.position.y = THREE.MathUtils.lerp(st.startCamY, 60, t);
          if (t > 0.15) markerGroup.visible = false;
        }

        camera.lookAt(0, 0, 0);
        if (st.progress >= 1) {
          st.animating = false;
          st.zoomed = st.direction === "in";
        }
      } else if (!st.zoomed) {
        globe.rotation.y += 0.002;
      }

      if (markerGroup.visible) {
        rings.forEach((r) => {
          const phase = time * 2.5 + r.off;
          const wave = (Math.sin(phase) + 1) / 2;
          r.mesh.scale.setScalar((1 + wave * 0.6) * (pin.scale.x || 1));
          r.mat.opacity = 0.5 * (1 - wave * 0.7);
        });
        glowMat.opacity = 0.1 + Math.sin(time * 1.8) * 0.05;
      }

      renderer.render(scene, camera);
    }
    tick();

    function onResize() {
      if (!el) return;
      w = el.clientWidth;
      h = el.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frameId);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  const flyToStreet = useCallback(async () => {
    const token = ++flyToken.current;
    setMapOn(true);
    setMapZoom(ARRIVAL[0].zoom);

    for (let i = 0; i < ARRIVAL.length; i++) {
      if (token !== flyToken.current) return;
      const stage = ARRIVAL[i];
      setStageIndex(i);
      setHud({ kicker: stage.kicker, label: stage.label });
      setMapZoom(stage.zoom);
      await new Promise((resolve) => window.setTimeout(resolve, stage.duration));
    }

    if (token === flyToken.current) setShowCard(true);
  }, []);

  const handleZoomIn = useCallback(() => {
    const st = anim.current;
    const t = threeRef.current;
    if (!t || st.animating) return;

    st.direction = "in";
    st.progress = 0;
    st.animating = true;
    st.startRotY = t.globe.rotation.y;
    st.startRotX = t.globe.rotation.x;
    st.startCamZ = t.camera.position.z;
    st.startCamY = t.camera.position.y;
    st.targetRotY = normAngle(t.globe.rotation.y, st.baseTargetRotY);
    st.targetRotX = st.baseTargetRotX;

    setZoomed(true);
    setHud({ kicker: "ÓRBITA", label: "Aproximando da Irlanda" });
    window.setTimeout(() => {
      setHud({ kicker: "PAÍS", label: "Irlanda" });
      void flyToStreet();
    }, 2400);
  }, [flyToStreet]);

  const handleZoomOut = useCallback(() => {
    flyToken.current += 1;
    const st = anim.current;
    const t = threeRef.current;
    if (!t || st.animating) return;

    setShowCard(false);
    setMapOn(false);
    setHud(null);
    setStageIndex(-1);
    setMapZoom(ARRIVAL[0].zoom);

    st.direction = "out";
    st.progress = 0;
    st.animating = true;
    st.startRotY = t.globe.rotation.y;
    st.startRotX = t.globe.rotation.x;
    st.startCamZ = t.camera.position.z;
    st.startCamY = t.camera.position.y;
    st.resetRotY = t.globe.rotation.y + 0.5;

    window.setTimeout(() => setZoomed(false), 1400);
  }, []);

  const latHem = LAT >= 0 ? "N" : "S";
  const lngHem = LNG >= 0 ? "E" : "W";

  return (
    <section id="localizar" className="globe-locate relative h-[100svh] min-h-[560px] overflow-hidden bg-black">
      <div ref={containerRef} className="absolute inset-0" />
      <div
        className="globe-map absolute inset-0 z-[4] bg-black transition-opacity duration-700"
        style={{
          opacity: mapOn ? 1 : 0,
          pointerEvents: mapOn ? "auto" : "none",
        }}
      >
        {mapOn && (
          <RegionMap
            lat={LAT}
            lng={LNG}
            zoom={mapZoom}
            radius={750}
            className="h-full w-full"
          />
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[35%] bg-gradient-to-b from-black/85 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[35%] bg-gradient-to-t from-black/85 to-transparent" />

      <div className="pointer-events-none absolute left-1/2 top-[7%] z-[6] -translate-x-1/2 text-center">
        <span className="label-mono text-[0.65rem]">Estúdio de tatuagem</span>
        <h2 className="font-display mt-2 text-[clamp(1.4rem,3vw,2.4rem)] tracking-[0.18em] text-ink">
          ENCONTRE-NOS
        </h2>
      </div>

      {loading && (
        <div className="absolute bottom-[11%] left-1/2 z-[6] flex -translate-x-1/2 items-center gap-2">
          <span className="globe-pulse h-1.5 w-1.5 rounded-full bg-bg-accent" />
          <span className="text-[0.68rem] tracking-[0.15em] text-ink-muted">Carregando mapa…</span>
        </div>
      )}

      <div
        className="absolute bottom-[11%] left-1/2 z-[6] -translate-x-1/2 transition-opacity duration-500"
        style={{ opacity: zoomed || loading ? 0 : 1, pointerEvents: zoomed || loading ? "none" : "auto" }}
      >
        <button
          type="button"
          className="globe-cta flex items-center gap-2.5 border border-line-accent/50 bg-bg-accent/10 px-7 py-3.5 text-[0.72rem] font-medium tracking-[0.22em] text-ink backdrop-blur-md"
          onClick={handleZoomIn}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B9A6B" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          LOCALIZAR ESTÚDIO
        </button>
      </div>

      {hud && zoomed && !showCard && (
        <div className="pointer-events-none absolute left-1/2 top-[22%] z-[7] w-[min(92vw,640px)] -translate-x-1/2 text-center">
          <p className="label-mono">{hud.kicker}</p>
          <p className="font-display mt-2 text-3xl text-ink md:text-5xl">{hud.label}</p>
          {stageIndex >= 0 && (
            <div className="mx-auto mt-5 flex max-w-md justify-center gap-1.5">
              {ARRIVAL.map((s, i) => (
                <span
                  key={s.kicker}
                  className="h-[2px] flex-1"
                  style={{ background: i <= stageIndex ? "#8B9A6B" : "#1A1A1A" }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div
        className="pointer-events-none absolute bottom-[7%] left-1/2 z-[6] -translate-x-1/2 font-mono text-[0.68rem] tracking-[0.25em] text-bg-accent"
        style={{ opacity: zoomed ? 1 : 0, transition: "opacity 0.8s ease 0.4s" }}
      >
        {Math.abs(LAT).toFixed(0)}°{latHem} · {Math.abs(LNG).toFixed(0)}°{lngHem}
      </div>

      <aside
        className="absolute right-[4%] top-1/2 z-[8] flex max-w-[320px] border border-line-accent/20 bg-black/88 backdrop-blur-xl transition-all duration-700"
        style={{
          opacity: showCard ? 1 : 0,
          transform: showCard ? "translateY(-50%) translateX(0)" : "translateY(-50%) translateX(30px)",
          pointerEvents: showCard ? "auto" : "none",
        }}
      >
        <span className="w-[3px] shrink-0 bg-gradient-to-b from-transparent via-bg-accent to-transparent" />
        <div className="flex flex-col px-6 py-7">
          <span className="label-mono">Região aproximada</span>
          <h3 className="font-display mt-2 text-2xl tracking-wide">{STUDIO.name}</h3>
          <p className="mt-3 text-sm text-ink-secondary">{STUDIO.address.city}, {STUDIO.address.country}</p>
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">
            O círculo marca a região — o endereço exato é confirmado na consulta.
          </p>
          <p className="mt-3 text-sm text-moss">{STUDIO.phone}</p>
          <div className="my-5 h-px bg-line-accent/20" />
          <div className="flex flex-col gap-2.5">
            <a
              href={STUDIO.address.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="globe-card-primary border border-line-accent/40 bg-bg-accent/15 px-4 py-3 text-center text-[0.68rem] tracking-[0.18em]"
            >
              VER A REGIÃO NO MAPS →
            </a>
            <button
              type="button"
              className="py-1.5 text-[0.65rem] tracking-[0.18em] text-ink-muted"
              onClick={handleZoomOut}
            >
              ← VOLTAR AO GLOBO
            </button>
          </div>
        </div>
      </aside>

      {zoomed && !showCard && (
        <div className="globe-scan pointer-events-none absolute inset-x-0 z-[6] h-px bg-gradient-to-r from-transparent via-bg-accent/40 to-transparent" />
      )}
    </section>
  );
}
