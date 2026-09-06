import { useEffect, useRef } from "react";
import * as T from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { decodeModelResponse } from "../model-download";
import { SYSTEMS, type Atlas, type Part, type SystemId } from "../anatomy";
import { PointerTap } from "../pointer-tap";
import { createExplosionLayout } from "../explosion-layout";
import { PLACEMENTS } from "./placements";
import { MERIDIANS } from "./data";
import { createGuide } from "./guide";
import { anatomyZh } from "./anatomy-zh";
import { explosionOffset, overlaysAllowed, sceneDecorVisibility, shouldUpdateExplosionTransforms, translatedBounds, type Vec3Tuple } from "./anatomy-explosion";
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
  explode?: number;
  visibleSystems?: SystemId[];
  anatomyLabels?: boolean;
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
    let amount = 0,
      layoutKey = "",
      packingWidth = 1,
      packingHeight = 1;
    let layoutCells = new Map<string, import("../explosion-layout").LayoutCell>();
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
    renderer.setClearColor("#f1efeb", 0);
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
    scene.add(new T.HemisphereLight(0xffffff, 0xa6a19a, 1.7));
    const light = new T.DirectionalLight(0xfff9ee, 2);
    light.position.set(-2, 3, 3);
    scene.add(light);
    const rim = new T.DirectionalLight(0xe7e7e7, 1.4);
    rim.position.set(2, 2, -3);
    scene.add(rim);
    const ground = new T.Mesh(
      new T.CircleGeometry(0.56, 80),
      new T.MeshStandardMaterial({
        color: 0xdad5ce,
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
        color: 0xa3978a,
        transparent: true,
        opacity: 0.3,
        side: T.DoubleSide,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.012;
    scene.add(ring);
    const textureWidth = T.MathUtils.ceilPowerOfTwo(props.atlas.parts.length),
      partData = new Float32Array(textureWidth * 4),
      partTexture = new T.DataTexture(partData, textureWidth, 1, T.RGBAFormat, T.FloatType),
      materials = new Map<SystemId, T.MeshStandardMaterial>(),
      batches = new Map<SystemId, T.Mesh[]>(),
      geometries: T.BufferGeometry[] = [],
      pickers = new Map<string, T.Mesh>();
    partTexture.needsUpdate = true;
    for (const system of SYSTEMS) {
      const material = new T.MeshStandardMaterial({
          color: system.id === "integumentary" ? 0xc9c8c5 : system.color,
          roughness: 0.67,
          metalness: 0.025,
          side: T.DoubleSide,
        });
      material.onBeforeCompile = (shader) => {
        shader.uniforms.partState = { value: partTexture };
        shader.uniforms.stateWidth = { value: textureWidth };
        shader.vertexShader =
          "attribute float partIndex; uniform sampler2D partState; uniform float stateWidth; varying float partVisible;\n" +
          shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvec4 state = texture2D(partState, vec2((partIndex + 0.5) / stateWidth, 0.5)); transformed += state.xyz; partVisible = state.w;",
        );
        shader.fragmentShader = "varying float partVisible;\n" + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <clipping_planes_fragment>",
          "#include <clipping_planes_fragment>\nif (partVisible < 0.5) discard;",
        );
      };
      materials.set(system.id, material);
      batches.set(system.id, []);
    }
    const highlightMaterial = new T.MeshStandardMaterial({
      color: 0xe38a42,
      emissive: 0x754124,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.8,
      depthTest: false,
    });
    let highlight: T.Mesh | undefined;
    let surfaceProjection: T.Mesh | undefined;
    const centers = props.atlas.parts.map((p) =>
        new T.Vector3().fromArray(p.bounds[0]).add(new T.Vector3().fromArray(p.bounds[1])).multiplyScalar(0.5),
      ),
      offsets: Vec3Tuple[] = props.atlas.parts.map(() => [0, 0, 0]);
    const overlay = document.createElement("div");
    overlay.className = "point-overlay";
    el.appendChild(overlay);
    const anatomyHover = document.createElement("div");
    anatomyHover.className = "part-hover";
    anatomyHover.setAttribute("role", "tooltip");
    anatomyHover.hidden = true;
    el.appendChild(anatomyHover);
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
          MERIDIANS.find((m) => m.id === point.meridian)?.color ?? "#c06b32",
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
      if (!surfaceProjection) return;
      for (const marker of markers) {
        ray.set(
          marker.position.clone().addScaledVector(marker.normal, 0.25),
          marker.normal.clone().negate(),
        );
        const hits = ray
          .intersectObject(surfaceProjection, false)
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
      const exploded = amount > 0.05 && !o.isolate;
      const availableAspect = Math.max(0.35, (el.clientWidth - (el.clientWidth < 768 ? 40 : 340)) / Math.max(160, el.clientHeight - (el.clientWidth < 768 ? 350 : 270)));
      const gridDistance = Math.max(packingHeight, packingWidth / availableAspect) / (2 * Math.tan(T.MathUtils.degToRad(camera.fov / 2))) * 1.1;
      const distance = exploded ? Math.max(0.2, gridDistance) : Math.max(2.9, 1.2 / camera.aspect),
        direction =
          exploded
            ? new T.Vector3(0, 0, 1)
            : o.view === "back"
            ? new T.Vector3(0, 0, -1)
            : o.view === "side"
              ? new T.Vector3(1, 0, 0)
              : new T.Vector3(0.08, 0.015, 1).normalize();
      controls.target.set(exploded && el.clientWidth > 767 ? -packingWidth * 0.12 : 0, 0.87, 0);
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
      const target = pickers.get(latest.current.options.selectedPart);
      const part = target?.userData.part as Part | undefined;
      if (!target || !part) return;
      const translated = translatedBounds(part.bounds, offsets[props.atlas.parts.indexOf(part)] ?? [0, 0, 0]);
      const box = new T.Box3(new T.Vector3().fromArray(translated[0]), new T.Vector3().fromArray(translated[1]));
      const center = box.getCenter(new T.Vector3()), size = box.getSize(new T.Vector3());
      const distance = Math.max(0.18, Math.max(size.y, size.x / camera.aspect, size.z) * 2.8);
      controls.target.copy(center);
      camera.position.copy(center).add(new T.Vector3(0.2, 0.1, 1).normalize().multiplyScalar(distance));
      controls.update();
      dirty = true;
    };
    const resize = () => {
      layoutKey = "";
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
          for (let partIndex = 0; partIndex < props.atlas.parts.length; partIndex++) {
            const part = props.atlas.parts[partIndex];
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
            g.boundingBox = new T.Box3(new T.Vector3().fromArray(part.bounds[0]), new T.Vector3().fromArray(part.bounds[1]));
            g.setAttribute("partIndex", new T.BufferAttribute(new Float32Array(part.vertexCount).fill(partIndex), 1));
            geometries.push(g);
            const mesh = new T.Mesh(g, materials.get(part.system));
            mesh.matrixAutoUpdate = false;
            mesh.userData.part = part;
            pickers.set(part.id, mesh);
            if (part.name === "Skin") surfaceProjection = new T.Mesh(g, materials.get(part.system));
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
    type Target = { part: Part; x: number; y: number; left: number; right: number; top: number; bottom: number };
    let targets: Target[] = [];
    const findTarget = (x: number, y: number, radius: number) => {
      let best: Target | undefined, score = Infinity;
      for (const target of targets) {
        const dx = Math.max(target.left - x, 0, x - target.right), dy = Math.max(target.top - y, 0, y - target.bottom);
        const distance = Math.hypot(dx, dy);
        if (distance > radius) continue;
        const candidate = distance + Math.hypot(target.x - x, target.y - y) * 0.025;
        if (candidate < score) { best = target; score = candidate; }
      }
      return best;
    };
    const down = (e: PointerEvent) => {
      anatomyHover.hidden = true;
      tap.down(e.pointerId, e.clientX, e.clientY, e.pointerType === "touch" ? 12 : 5);
    };
    const move = (e: PointerEvent) => {
      tap.move(e.pointerId, e.clientX, e.clientY);
      if (e.buttons || amount < 0.45 || e.pointerType === "touch" || latest.current.options.anatomyLabels === false) {
        anatomyHover.hidden = true;
        return;
      }
      const rect = el.getBoundingClientRect(), x = e.clientX - rect.left, y = e.clientY - rect.top, target = findTarget(x, y, 12);
      anatomyHover.hidden = !target;
      renderer.domElement.style.cursor = target ? "pointer" : "grab";
      if (target) {
        anatomyHover.textContent = `${anatomyZh(target.part.name)} · ${target.part.name}`;
        anatomyHover.style.left = `${Math.max(8, Math.min(x + 14, el.clientWidth - 260))}px`;
        anatomyHover.style.top = `${Math.max(8, Math.min(y + 18, el.clientHeight - 55))}px`;
      }
    };
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
      const systems = new Set(o.visibleSystems ?? layers[o.layer]);
      const hasSolid = props.atlas.parts.some((part, index) => part.system !== "integumentary" && partData[index * 4 + 3] > 0.5);
      const meshes = [...pickers.values()].filter((mesh) => {
        const part = mesh.userData.part as Part, index = props.atlas.parts.indexOf(part);
        return partData[index * 4 + 3] > 0.5 && !(hasSolid && part.system === "integumentary") &&
          (o.isolate ? part.id === o.selectedPart : systems.has(part.system) || part.id === o.selectedPart);
      });
      const hit = ray.intersectObjects(meshes, false)[0];
      const fallback = amount > 0.45 ? findTarget(e.clientX - rect.left, e.clientY - rect.top, e.pointerType === "touch" ? 24 : 16) : undefined;
      const part = (hit?.object.userData.part as Part | undefined) ?? fallback?.part;
      if (part) {
        anatomyHover.hidden = true;
        latest.current.onPart(part);
      }
    };
    renderer.domElement.addEventListener("pointerdown", down);
    renderer.domElement.addEventListener("pointermove", move);
    renderer.domElement.addEventListener("pointerup", up);
    renderer.domElement.addEventListener("pointercancel", cancel);
    const projected = new T.Vector3(),
      toCamera = new T.Vector3();
    const clock = new T.Clock(), reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let lastProjection = 0;
    const render = () => {
      if (stopped) return;
      frame = requestAnimationFrame(render);
      const o = latest.current.options;
      const targetAmount = Math.max(0, Math.min(1, o.explode ?? 0));
      const previousAmount = amount;
      amount = reducedMotion.matches ? targetAmount : T.MathUtils.damp(amount, targetAmount, 8, Math.min(clock.getDelta(), 0.05));
      if (Math.abs(amount - targetAmount) < 0.0001) amount = targetAmount;
      const systems = new Set(o.visibleSystems ?? layers[o.layer]);
      const visibleParts = props.atlas.parts.filter((part) =>
        o.isolate ? part.id === o.selectedPart : systems.has(part.system) || part.id === o.selectedPart,
      );
      const nextLayoutKey = visibleParts.map((part) => part.id).join(",") + ":" + camera.aspect.toFixed(3);
      const layoutChanged = nextLayoutKey !== layoutKey;
      if (layoutChanged) {
        const layout = createExplosionLayout(visibleParts, camera.aspect);
        packingWidth = layout.width;
        packingHeight = layout.height;
        layoutCells = layout.cells;
        props.atlas.parts.forEach((part, index) => {
          const cell = layout.cells.get(part.id);
          offsets[index] = cell ? explosionOffset(part, cell, amount) : [0, 0, 0];
        });
        layoutKey = nextLayoutKey;
        if (amount > 0.05 && !o.isolate) fit();
      }
      if (shouldUpdateExplosionTransforms(previousAmount, amount, o !== lastOptions, layoutChanged)) {
        props.atlas.parts.forEach((part, index) => {
          const cell = layoutCells.get(part.id);
          const offset = cell ? explosionOffset(part, cell, amount) : [0, 0, 0] as Vec3Tuple;
          offsets[index] = offset;
          const visible = o.isolate ? part.id === o.selectedPart : systems.has(part.system) || part.id === o.selectedPart;
          partData.set([offset[0], offset[1], offset[2], visible ? 1 : 0], index * 4);
          const picker = pickers.get(part.id);
          if (picker) { picker.position.fromArray(offset); picker.updateMatrix(); picker.updateMatrixWorld(true); }
        });
        partTexture.needsUpdate = true;
        if (highlight) {
          const index = props.atlas.parts.findIndex((part) => part.id === o.selectedPart);
          highlight.position.fromArray(offsets[index] ?? [0, 0, 0]);
        }
        if (amount !== previousAmount && !o.isolate) fit();
        else if (amount !== previousAmount && o.isolate) focusPart();
        dirty = true;
      }
      if (o !== lastOptions) {
        if (
          !lastOptions ||
          o.layer !== lastOptions.layer ||
          o.isolate !== lastOptions.isolate ||
          o.visibleSystems !== lastOptions.visibleSystems ||
          o.selectedPart !== lastOptions.selectedPart
        ) {
          for (const [system, meshes] of batches)
            for (const mesh of meshes)
              mesh.visible =
                !o.isolate &&
                ((o.visibleSystems ?? layers[o.layer]).includes(system) ||
                  props.atlas.parts.some((part) => part.id === o.selectedPart && part.system === system));
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
            highlight.position.copy(target.position);
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
        lastOptions = o;
        dirty = true;
      }
      controls.enableRotate = amount < 0.8;
      controls.mouseButtons.LEFT = amount < 0.8 ? T.MOUSE.ROTATE : T.MOUSE.PAN;
      controls.touches.ONE = amount < 0.8 ? T.TOUCH.ROTATE : T.TOUCH.PAN;
      controls.autoRotate = o.rotate && !o.isolate && amount < 0.4;
      const decor = sceneDecorVisibility(amount, o.isolate);
      lineGroup.visible = decor.overlays;
      for (const line of lineGroup.children)
        line.visible =
          decor.overlays &&
          o.routes &&
          !o.quiz &&
          (line.userData.ids as string[]).every((id) => o.pointIds.includes(id));
      overlay.hidden = !decor.overlays;
      ground.visible = ring.visible = decor.stage;
      controls.update();
      if (controls.autoRotate) dirty = true;
      if (dirty) {
        renderer.render(scene, camera);
        proportionGuide.update(props.points.find(p=>p.id===o.activeId),camera,o.guide&&!o.quiz&&!o.isolate&&overlaysAllowed(amount),el.clientWidth,el.clientHeight);
        const now = performance.now();
        if (now - lastProjection > 30) {
          for (const marker of markers) {
            projected.copy(marker.position).project(camera);
            toCamera.copy(camera.position).sub(marker.position).normalize();
            let visible =
              ready &&
              !o.isolate &&
              overlaysAllowed(amount) &&
              o.pointIds.includes(marker.id) &&
              projected.z > -1 &&
              projected.z < 1 &&
              Math.abs(projected.x) < 1 &&
              Math.abs(projected.y) < 1 &&
              marker.normal.dot(toCamera) > -0.06;
            if (visible && surfaceProjection) {
              const distance = camera.position.distanceTo(marker.position);
              ray.set(camera.position, marker.position.clone().sub(camera.position).normalize());
              const hit = ray.intersectObject(surfaceProjection, false)[0];
              if (hit && hit.distance < distance - 0.016) visible = false;
            }
            marker.button.hidden = !visible;
            if (visible) {
              marker.button.style.left = `${((projected.x + 1) * el.clientWidth) / 2}px`;
              marker.button.style.top = `${((1 - projected.y) * el.clientHeight) / 2}px`;
            }
          }
          targets = [];
          if (amount > 0.45) {
            const hasSolid = props.atlas.parts.some((part, index) => part.system !== "integumentary" && partData[index * 4 + 3] > 0.5);
            props.atlas.parts.forEach((part, index) => {
              if (partData[index * 4 + 3] < 0.5 || (hasSolid && part.system === "integumentary")) return;
              const offset = offsets[index];
              let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
              for (let corner = 0; corner < 8; corner++) {
                projected.set(part.bounds[corner & 1 ? 1 : 0][0] + offset[0], part.bounds[corner & 2 ? 1 : 0][1] + offset[1], part.bounds[corner & 4 ? 1 : 0][2] + offset[2]).project(camera);
                const x = (projected.x + 1) * el.clientWidth / 2, y = (1 - projected.y) * el.clientHeight / 2;
                left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
              }
              projected.copy(centers[index]).add(new T.Vector3().fromArray(offset)).project(camera);
              if (projected.z < -1 || projected.z > 1) return;
              targets.push({ part, x: (projected.x + 1) * el.clientWidth / 2, y: (1 - projected.y) * el.clientHeight / 2, left, right, top, bottom });
            });
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
      partTexture.dispose();
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
      anatomyHover.remove();
      proportionGuide.dispose();
      renderer.domElement.remove();
    };
  }, [props.atlas, props.points]);
  return <div className="atlas-canvas" ref={host} />;
}
