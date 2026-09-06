import { useEffect, useRef } from "react";
import * as T from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { decodeModelResponse } from "../model-download";
import { SYSTEMS, type Atlas, type Part, type SystemId } from "../anatomy";
import { PointerTap } from "../pointer-tap";
import { PLACEMENTS } from "./placements";
import { MERIDIANS } from "./data";
import {createGuide} from './guide';
import type { Acupoint } from "./types";

export type Layer = "surface" | "transparent" | "muscle" | "skeleton" | "neuro";
export interface SceneOptions {
  layer: Layer;
  activeId: string;
  pointIds: string[];
  labels: boolean;
  routes: boolean;
  guide: boolean;
  hiddenNames: boolean;
  quiz: boolean;
  view: "front" | "back" | "side";
  rotate: boolean;
  focus: number;
  reset: number;
  selectedPart: string;
  isolate: boolean;
}
interface Props {
  atlas: Atlas;
  points: Acupoint[];
  options: SceneOptions;
  onPoint: (id: string) => void;
  onPart: (part: Part) => void;
  onProgress: (n: number) => void;
  onError: (s: string) => void;
}
type Marker = {
  id: string;
  side: number;
  position: T.Vector3;
  normal: T.Vector3;
  button: HTMLButtonElement;
  point: Acupoint;
};
const layers: Record<Layer, SystemId[]> = {
  surface: ["integumentary"],
  transparent: ["integumentary", "skeletal", "muscular"],
  muscle: ["muscular", "skeletal"],
  skeleton: ["skeletal"],
  neuro: ["skeletal", "nervous", "arterial", "venous"],
};
export default function AtlasScene(props: Props) {
  const host = useRef<HTMLDivElement>(null),
    latest = useRef(props);
  latest.current = props;
  useEffect(() => {
    const el = host.current!;
    let stopped = false,
      frame = 0,
      dirty = true,
      ready = false,
      lastOptions: SceneOptions | undefined;
    const controller = new AbortController();
    let renderer: T.WebGLRenderer;
    try {
      renderer = new T.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      latest.current.onError("当前浏览器无法启动三维视图，请使用支持 WebGL 的浏览器。");
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor("#edf0e9", 0);
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.setAttribute(
      "aria-label",
      "三维人体教学模型：拖动旋转，滚轮缩放，点击穴位学习",
    );
    el.appendChild(renderer.domElement);
    const scene = new T.Scene(),
      camera = new T.PerspectiveCamera(34, 1, 0.01, 30),
      controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.minDistance = 0.12;
    controls.maxDistance = 6;
    controls.autoRotateSpeed = 0.7;
    controls.addEventListener("change", () => {
      dirty = true;
    });
    const pmrem = new T.PMREMGenerator(renderer),
      room = new RoomEnvironment(),
      environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    room.dispose();
    pmrem.dispose();
    scene.add(new T.HemisphereLight(0xffffff, 0x9fada0, 1.7));
    const light = new T.DirectionalLight(0xfff9ee, 2);
    light.position.set(-2, 3, 3);
    scene.add(light);
    const rim = new T.DirectionalLight(0xd9e9df, 1.4);
    rim.position.set(2, 2, -3);
    scene.add(rim);
    const ground = new T.Mesh(
      new T.CircleGeometry(0.56, 80),
      new T.MeshStandardMaterial({
        color: 0xd6ded1,
        roughness: 1,
        transparent: true,
        opacity: 0.4,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.014;
    scene.add(ground);
    const ring = new T.Mesh(
      new T.RingGeometry(0.41, 0.413, 80),
      new T.MeshBasicMaterial({
        color: 0x94a78f,
        transparent: true,
        opacity: 0.3,
        side: T.DoubleSide,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.012;
    scene.add(ring);
    const materials = new Map<SystemId, T.MeshStandardMaterial>(),
      batches = new Map<SystemId, T.Mesh[]>(),
      geometries: T.BufferGeometry[] = [],
      pickers = new Map<string, T.Mesh>();
    for (const system of SYSTEMS) {
      materials.set(
        system.id,
        new T.MeshStandardMaterial({
          color: system.id === "integumentary" ? 0xcbd3b8 : system.color,
          roughness: 0.67,
          metalness: 0.025,
          side: T.DoubleSide,
        }),
      );
      batches.set(system.id, []);
    }
    const highlightMaterial = new T.MeshStandardMaterial({
      color: 0xd4a257,
      emissive: 0x725220,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.8,
      depthTest: false,
    });
    let highlight: T.Mesh | undefined;
    let surface: T.Mesh | undefined;
    const overlay = document.createElement("div");
    overlay.className = "point-overlay";
    el.appendChild(overlay);
    const proportionGuide=createGuide(el);
    const markers: Marker[] = [];
    for (const point of props.points) {
      const placement = PLACEMENTS[point.id];
      if (!placement) continue;
      for (const side of point.bilateral ? [1, -1] : [1]) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "acu-marker";
        button.dataset.point = point.id;
        button.dataset.side = side === 1 ? "left" : "right";
        button.style.setProperty(
          "--point-color",
          MERIDIANS.find((m) => m.id === point.meridian)?.color ?? "#438579",
        );
        const dot = document.createElement("i");
        const label = document.createElement("span");
        label.className = "point-label";
        button.appendChild(dot);
        button.appendChild(label);
        button.addEventListener("click", (e) => {
          e.stopPropagation();
          latest.current.onPoint(point.id);
        });
        overlay.appendChild(button);
        markers.push({
          id: point.id,
          side,
          position: new T.Vector3(
            placement.position[0] * side,
            placement.position[1],
            placement.position[2],
          ),
          normal: new T.Vector3(
            placement.normal[0] * side,
            placement.normal[1],
            placement.normal[2],
          ).normalize(),
          button,
          point,
        });
      }
    }
    const lineGroup = new T.Group();
    scene.add(lineGroup);
    const lineResources: { geometry: T.BufferGeometry; material: T.Material }[] = [];
    const ray = new T.Raycaster();
    const placeMarkers = () => {
      if (!surface) return;
      for (const marker of markers) {
        ray.set(
          marker.position.clone().addScaledVector(marker.normal, 0.25),
          marker.normal.clone().negate(),
        );
        const hits = ray
          .intersectObject(surface, false)
          .filter((hit) => hit.point.distanceTo(marker.position) < 0.15)
          .sort(
            (a, b) =>
              a.point.distanceToSquared(marker.position) -
              b.point.distanceToSquared(marker.position),
          );
        if (hits[0]) marker.position.copy(hits[0].point).addScaledVector(marker.normal, 0.003);
      }
      for (const meridian of MERIDIANS)
        for (const side of [1, -1]) {
          const path = markers
            .filter((m) => m.point.meridian === meridian.id && m.side === side)
            .sort((a, b) => Number(a.id.replace(/\D/g, "")) - Number(b.id.replace(/\D/g, "")));
          if (path.length < 2) continue;
          const geometry = new T.BufferGeometry().setFromPoints(path.map((m) => m.position));
          const material = new T.LineDashedMaterial({
            color: meridian.color,
            transparent: true,
            opacity: 0.65,
            dashSize: 0.012,
            gapSize: 0.01,
            depthTest: true,
          });
          const line = new T.Line(geometry, material);
          line.computeLineDistances();
          line.userData.ids = path.map((m) => m.id);
          lineGroup.add(line);
          lineResources.push({ geometry, material });
        }
    };
    const fit = () => {
      const o = latest.current.options;
      camera.clearViewOffset();
      const distance = Math.max(2.9, 1.2 / camera.aspect),
        direction =
          o.view === "back"
            ? new T.Vector3(0, 0, -1)
            : o.view === "side"
              ? new T.Vector3(1, 0, 0)
              : new T.Vector3(0.08, 0.015, 1).normalize();
      controls.target.set(0, 0.87, 0);
      camera.position.copy(controls.target).addScaledVector(direction, distance);
      controls.update();
      dirty = true;
    };
    const focusPoint = () => {
      const marker = markers.find((m) => m.id === latest.current.options.activeId && m.side === 1);
      if (!marker) return;
      controls.target.copy(marker.position);
      camera.position.copy(marker.position).addScaledVector(marker.normal, 0.68);
      if (marker.normal.y === 0) camera.position.y += 0.05;
      controls.update();
      dirty = true;
    };
    const focusPart = () => {
      const box = pickers.get(latest.current.options.selectedPart)?.geometry.boundingBox;
      if (!box) return;
      const center = box.getCenter(new T.Vector3());
      const size = box.getSize(new T.Vector3());
      const distance = Math.max(0.18, Math.max(size.y, size.x / camera.aspect, size.z) * 2.8);
      controls.target.copy(center);
      camera.position.copy(center).add(new T.Vector3(0.2, 0.1, 1).normalize().multiplyScalar(distance));
      controls.update();
      dirty = true;
    };
    const resize = () => {
      camera.aspect = el.clientWidth / Math.max(1, el.clientHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
      if (latest.current.options.isolate) focusPart();
      else fit();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();
    (async () => {
      try {
        let loaded = 0,
          cursor = 0;
        const load = async (ci: number) => {
          const chunk = props.atlas.chunks[ci],
            gzip = !!chunk.gzip && typeof DecompressionStream !== "undefined";
          const response = await fetch(gzip ? chunk.gzip! : chunk.url, {
            signal: controller.signal,
          });
          const buffer = await decodeModelResponse(response, chunk.bytes, gzip);
          if (stopped) return;
          const groups = new Map<SystemId, T.BufferGeometry[]>();
          for (const part of props.atlas.parts) {
            if (part.chunk !== ci) continue;
            const g = new T.BufferGeometry();
            g.setAttribute(
              "position",
              new T.BufferAttribute(
                new Float32Array(buffer, part.positions, part.vertexCount * 3),
                3,
              ),
            );
            g.setAttribute(
              "normal",
              new T.BufferAttribute(
                new Int16Array(buffer, part.normals, part.vertexCount * 3),
                3,
                true,
              ),
            );
            g.setIndex(
              new T.BufferAttribute(new Uint32Array(buffer, part.indices, part.indexCount), 1),
            );
            g.computeBoundingSphere();
            g.computeBoundingBox();
            geometries.push(g);
            const mesh = new T.Mesh(g, materials.get(part.system));
            mesh.userData.part = part;
            pickers.set(part.id, mesh);
            if (part.name === "Skin") surface = mesh;
            const list = groups.get(part.system) ?? [];
            list.push(g);
            groups.set(part.system, list);
          }
          for (const [system, list] of groups) {
            const geometry = mergeGeometries(list);
            if (!geometry) continue;
            geometries.push(geometry);
            const mesh = new T.Mesh(geometry, materials.get(system));
            mesh.visible = layers[latest.current.options.layer].includes(system);
            batches.get(system)!.push(mesh);
            scene.add(mesh);
          }
          loaded++;
          latest.current.onProgress(Math.round((loaded / props.atlas.chunks.length) * 100));
          dirty = true;
        };
        await Promise.all(
          Array.from({ length: 3 }, async () => {
            while (cursor < props.atlas.chunks.length) await load(cursor++);
          }),
        );
        if (!stopped) {
          placeMarkers();
          ready = true;
          lastOptions = undefined;
          dirty = true;
        }
      } catch (e) {
        if (!stopped)
          latest.current.onError(e instanceof Error ? e.message : "人体模型加载失败，请重试。");
      }
    })();
    const tap = new PointerTap();
    const down = (e: PointerEvent) =>
      tap.down(e.pointerId, e.clientX, e.clientY, e.pointerType === "touch" ? 12 : 5);
    const move = (e: PointerEvent) => tap.move(e.pointerId, e.clientX, e.clientY);
    const cancel = (e: PointerEvent) => tap.cancel(e.pointerId);
    const up = (e: PointerEvent) => {
      if (!tap.up(e.pointerId, e.clientX, e.clientY) || !ready) return;
      const rect = renderer.domElement.getBoundingClientRect(),
        o = latest.current.options;
      if (o.quiz) return;
      ray.setFromCamera(
        new T.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          1 - ((e.clientY - rect.top) / rect.height) * 2,
        ),
        camera,
      );
      const meshes = [...pickers.values()].filter((mesh) =>
        o.isolate
          ? mesh.userData.part.id === o.selectedPart
          : layers[o.layer].includes(mesh.userData.part.system) &&
            mesh.userData.part.system !== "integumentary",
      );
      const hit = ray.intersectObjects(meshes, false)[0];
      if (hit) latest.current.onPart(hit.object.userData.part as Part);
    };
    renderer.domElement.addEventListener("pointerdown", down);
    renderer.domElement.addEventListener("pointermove", move);
    renderer.domElement.addEventListener("pointerup", up);
    renderer.domElement.addEventListener("pointercancel", cancel);
    const projected = new T.Vector3(),
      toCamera = new T.Vector3();
    let lastProjection = 0;
    const render = () => {
      if (stopped) return;
      frame = requestAnimationFrame(render);
      const o = latest.current.options;
      if (o !== lastOptions) {
        if (!lastOptions || o.layer !== lastOptions.layer || o.isolate !== lastOptions.isolate) {
          for (const [system, meshes] of batches)
            for (const mesh of meshes)
              mesh.visible = !o.isolate && layers[o.layer].includes(system);
          const skin = materials.get("integumentary")!;
          skin.transparent = o.layer === "transparent";
          skin.opacity = o.layer === "transparent" ? 0.12 : 1;
          skin.depthWrite = o.layer !== "transparent";
          skin.needsUpdate = true;
        }
        if (!lastOptions || o.selectedPart !== lastOptions.selectedPart) {
          if (highlight) scene.remove(highlight);
          highlight = undefined;
          const target = pickers.get(o.selectedPart);
          if (target) {
            highlight = new T.Mesh(target.geometry, highlightMaterial);
            scene.add(highlight);
          }
        }
        if (highlight) highlight.visible = !!o.selectedPart;
        if (!lastOptions || o.reset !== lastOptions.reset || o.view !== lastOptions.view) fit();
        if (lastOptions && o.focus !== lastOptions.focus) focusPoint();
        if (o.isolate && (!lastOptions || !lastOptions.isolate || o.selectedPart!==lastOptions.selectedPart)) {
          focusPart();
        } else if(lastOptions?.isolate&&!o.isolate)fit();
        for (const marker of markers) {
          const active = marker.id === o.activeId;
          marker.button.classList.toggle("selected", active && !o.quiz);
          marker.button.classList.toggle(
            "show-label",
            o.labels && !o.hiddenNames && (active || o.pointIds.length <= 8),
          );
          marker.button.classList.toggle("guide-point", active && o.guide);
          const caption = o.hiddenNames ? "待辨认穴位" : `${marker.point.name} ${marker.id}`;
          marker.button.setAttribute(
            "aria-label",
            o.hiddenNames
              ? "选择模型穴位"
              : `${marker.point.name} ${marker.id}${marker.point.bilateral ? (marker.side === 1 ? " 左侧" : " 右侧") : ""}`,
          );
          marker.button.querySelector("span")!.textContent = caption;
        }
        for (const line of lineGroup.children)
          line.visible =
            o.routes &&
            !o.quiz &&
            (line.userData.ids as string[]).every((id) => o.pointIds.includes(id));
        ground.visible = ring.visible = !o.isolate;
        lastOptions = o;
        dirty = true;
      }
      controls.autoRotate = o.rotate && !o.isolate;
      controls.update();
      if (controls.autoRotate) dirty = true;
      if (dirty) {
        renderer.render(scene, camera);
        proportionGuide.update(props.points.find(p=>p.id===o.activeId),camera,o.guide&&!o.quiz&&!o.isolate,el.clientWidth,el.clientHeight);
        const now = performance.now();
        if (now - lastProjection > 30) {
          for (const marker of markers) {
            projected.copy(marker.position).project(camera);
            toCamera.copy(camera.position).sub(marker.position).normalize();
            let visible =
              ready &&
              !o.isolate &&
              o.pointIds.includes(marker.id) &&
              projected.z > -1 &&
              projected.z < 1 &&
              Math.abs(projected.x) < 1 &&
              Math.abs(projected.y) < 1 &&
              marker.normal.dot(toCamera) > -0.06;
            if (visible && surface) {
              const distance = camera.position.distanceTo(marker.position);
              ray.set(camera.position, marker.position.clone().sub(camera.position).normalize());
              const hit = ray.intersectObject(surface, false)[0];
              if (hit && hit.distance < distance - 0.016) visible = false;
            }
            marker.button.hidden = !visible;
            if (visible) {
              marker.button.style.left = `${((projected.x + 1) * el.clientWidth) / 2}px`;
              marker.button.style.top = `${((1 - projected.y) * el.clientHeight) / 2}px`;
            }
          }
          lastProjection = now;
          dirty = false;
        }
      }
    };
    render();
    const lost = (e: Event) => {
      e.preventDefault();
      latest.current.onError("三维会话已暂停，请重新加载模型。");
    };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    return () => {
      stopped = true;
      controller.abort();
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      highlightMaterial.dispose();
      lineResources.forEach((r) => {
        r.geometry.dispose();
        r.material.dispose();
      });
      ground.geometry.dispose();
      (ground.material as T.Material).dispose();
      ring.geometry.dispose();
      (ring.material as T.Material).dispose();
      environment.dispose();
      renderer.dispose();
      overlay.remove();
      proportionGuide.dispose();
      renderer.domElement.remove();
    };
  }, [props.atlas, props.points]);
  return <div className="atlas-canvas" ref={host} />;
}
