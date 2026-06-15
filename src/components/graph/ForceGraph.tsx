"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
  type Simulation,
} from "d3-force";
import type { GraphNode, GraphEdge } from "@/lib/types/api";

// ─── Types ──────────────────────────────────────────────

interface ForceGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  className?: string;
}

interface SimNode extends SimulationNodeDatum {
  id: string;
  title: string;
  masteryBand: GraphNode["masteryBand"];
  masteryScore: number;
  isLocked: boolean;
  linkCount: number;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  relationshipType: GraphEdge["relationshipType"];
}

// ─── Theme colors read from CSS vars ────────────────────

interface ThemeColors {
  canvas: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  borderDefault: string;
  nodeMastered: string;
  nodeProficient: string;
  nodeDeveloping: string;
  nodeLow: string;
  nodeLocked: string;
  isLight: boolean;
}

function readThemeColors(): ThemeColors {
  const root = document.documentElement;
  const cs = getComputedStyle(root);
  const get = (name: string) => cs.getPropertyValue(name).trim();

  const canvas = get("--color-canvas") || "#08080c";

  // Detect light mode by parsing the canvas luminance
  const isLight = isLightColor(canvas);

  return {
    canvas,
    textPrimary: get("--color-text-primary") || "#ffffff",
    textSecondary: get("--color-text-secondary") || "#b3b8c9",
    textMuted: get("--color-text-muted") || "#6b7285",
    borderDefault: get("--color-border-default") || "#333",
    nodeMastered: get("--color-node-mastered") || "#c6f135",
    nodeProficient: get("--color-node-proficient") || "#22d3ee",
    nodeDeveloping: get("--color-node-developing") || "#f59e0b",
    nodeLow: get("--color-node-low") || "#ef4444",
    nodeLocked: get("--color-node-locked") || "#444444",
    isLight,
  };
}

function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length < 6) return false;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  // Relative luminance
  return (r * 299 + g * 587 + b * 114) / 1000 > 140;
}

function getNodeColor(node: SimNode, colors: ThemeColors): string {
  if (node.isLocked) return colors.nodeLocked;
  switch (node.masteryBand) {
    case "mastered":
      return colors.nodeMastered;
    case "proficient":
      return colors.nodeProficient;
    case "developing":
      return colors.nodeDeveloping;
    case "low":
      return colors.nodeLow;
    default:
      return colors.nodeLow;
  }
}

function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Constants ──────────────────────────────────────────

const NODE_BASE_RADIUS = 5;
const NODE_MAX_RADIUS = 14;
const LABEL_FADE_ZOOM_MIN = 0.6;
const LABEL_FADE_ZOOM_MAX = 1.2;
const HIT_RADIUS_PADDING = 8;
const MIN_ZOOM = 0.15;
const MAX_ZOOM = 4;

// ─── Component ──────────────────────────────────────────

export function ForceGraph({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  className,
}: ForceGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<Simulation<SimNode, SimLink> | null>(null);
  const simNodesRef = useRef<SimNode[]>([]);
  const simLinksRef = useRef<SimLink[]>([]);
  const rafRef = useRef<number>(0);
  const themeRef = useRef<ThemeColors | null>(null);

  // Camera state
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1 });
  // Interaction state
  const dragRef = useRef<{
    node: SimNode | null;
    isPanning: boolean;
    startX: number;
    startY: number;
    startCamX: number;
    startCamY: number;
    hasMoved: boolean;
  }>({
    node: null,
    isPanning: false,
    startX: 0,
    startY: 0,
    startCamX: 0,
    startCamY: 0,
    hasMoved: false,
  });
  const selectedRef = useRef<string | null>(selectedNodeId);
  const hoveredRef = useRef<SimNode | null>(null);
  const needsFitRef = useRef(true);

  // Keep selectedRef in sync
  useEffect(() => {
    selectedRef.current = selectedNodeId;
  }, [selectedNodeId]);

  // ─── Read theme colors and watch for changes ────────
  useEffect(() => {
    themeRef.current = readThemeColors();

    const observer = new MutationObserver(() => {
      themeRef.current = readThemeColors();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "style"],
    });

    return () => observer.disconnect();
  }, []);

  // ─── Get node radius based on link count ────────────
  const getRadius = useCallback((node: SimNode) => {
    const scale = Math.min(node.linkCount / 6, 1);
    return NODE_BASE_RADIUS + scale * (NODE_MAX_RADIUS - NODE_BASE_RADIUS);
  }, []);

  // ─── Screen <-> World transforms ────────────────────
  const screenToWorld = useCallback(
    (sx: number, sy: number, canvas: HTMLCanvasElement) => {
      const cam = cameraRef.current;
      const cx = canvas.width / (2 * devicePixelRatio);
      const cy = canvas.height / (2 * devicePixelRatio);
      return {
        x: (sx - cx) / cam.zoom - cam.x,
        y: (sy - cy) / cam.zoom - cam.y,
      };
    },
    [],
  );

  // ─── Hit test ───────────────────────────────────────
  const hitTest = useCallback(
    (wx: number, wy: number): SimNode | null => {
      const nodes = simNodesRef.current;
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        const r = getRadius(n) + HIT_RADIUS_PADDING;
        const dx = (n.x ?? 0) - wx;
        const dy = (n.y ?? 0) - wy;
        if (dx * dx + dy * dy < r * r) return n;
      }
      return null;
    },
    [getRadius],
  );

  // ─── Draw frame ─────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = themeRef.current ?? readThemeColors();
    const light = colors.isLight;

    const dpr = devicePixelRatio;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const cam = cameraRef.current;
    const selected = selectedRef.current;
    const hovered = hoveredRef.current;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Fill background from theme
    ctx.fillStyle = colors.canvas;
    ctx.fillRect(0, 0, w, h);

    // Apply camera
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(cam.x, cam.y);

    const simNodes = simNodesRef.current;
    const simLinks = simLinksRef.current;

    // ── Draw edges ──────────────────────────────────
    for (const link of simLinks) {
      const source = link.source as SimNode;
      const target = link.target as SimNode;
      const sx = source.x ?? 0;
      const sy = source.y ?? 0;
      const tx = target.x ?? 0;
      const ty = target.y ?? 0;

      const isHighlighted =
        selected && (source.id === selected || target.id === selected);
      const isPre = link.relationshipType === "prerequisite";

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(tx, ty);

      if (light) {
        ctx.strokeStyle = isHighlighted
          ? "rgba(0,0,0,0.3)"
          : isPre
            ? "rgba(0,0,0,0.12)"
            : "rgba(0,0,0,0.05)";
      } else {
        ctx.strokeStyle = isHighlighted
          ? "rgba(255,255,255,0.35)"
          : isPre
            ? "rgba(255,255,255,0.12)"
            : "rgba(255,255,255,0.04)";
      }
      ctx.lineWidth =
        isHighlighted ? 1.5 / cam.zoom : (isPre ? 0.8 : 0.4) / cam.zoom;
      ctx.stroke();
    }

    // ── Draw nodes ──────────────────────────────────
    for (const node of simNodes) {
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const r = getRadius(node);
      const color = getNodeColor(node, colors);
      const isSelected = node.id === selected;
      const isHovered = node === hovered;

      // Glow layer (bloom imitation)
      if (!node.isLocked) {
        const glowR = r * (isSelected ? 5 : isHovered ? 4 : 3);
        const glowAlpha = light
          ? isSelected ? 0.25 : isHovered ? 0.18 : 0.1
          : isSelected ? 0.45 : isHovered ? 0.35 : 0.2;
        const grad = ctx.createRadialGradient(x, y, r * 0.5, x, y, glowR);
        grad.addColorStop(0, hexToRgba(color, glowAlpha));
        grad.addColorStop(1, hexToRgba(color, 0));
        ctx.beginPath();
        ctx.arc(x, y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Core circle
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Selection ring
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(x, y, r + 3, 0, Math.PI * 2);
        ctx.strokeStyle = light ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.7)";
        ctx.lineWidth = 1.5 / cam.zoom;
        ctx.stroke();
      }
    }

    // ── Draw labels ─────────────────────────────────
    const labelAlpha = Math.min(
      1,
      Math.max(
        0,
        (cam.zoom - LABEL_FADE_ZOOM_MIN) /
          (LABEL_FADE_ZOOM_MAX - LABEL_FADE_ZOOM_MIN),
      ),
    );

    if (labelAlpha > 0.01) {
      const fontSize = Math.max(10, 11 / cam.zoom);
      ctx.font = `500 ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.textBaseline = "middle";

      for (const node of simNodes) {
        const x = node.x ?? 0;
        const y = node.y ?? 0;
        const r = getRadius(node);
        const isSelected = node.id === selected;
        const isHovered = node === hovered;

        const alpha =
          isSelected || isHovered
            ? 1
            : labelAlpha * (node.isLocked ? 0.35 : 0.75);
        if (alpha < 0.01) continue;

        const nodeColor = getNodeColor(node, colors);

        if (isSelected) {
          ctx.fillStyle = light
            ? `rgba(0,0,0,${alpha})`
            : `rgba(255,255,255,${alpha})`;
        } else if (isHovered) {
          ctx.fillStyle = hexToRgba(nodeColor, alpha);
        } else {
          ctx.fillStyle = light
            ? `rgba(30,30,30,${alpha * 0.7})`
            : `rgba(255,255,255,${alpha * 0.85})`;
        }
        ctx.fillText(node.title, x + r + 6, y);
      }
    }

    ctx.restore();
  }, [getRadius]);

  // ─── Animation loop ─────────────────────────────────
  const tick = useCallback(() => {
    draw();
    rafRef.current = requestAnimationFrame(tick);
  }, [draw]);

  // ─── Fit camera to content ──────────────────────────
  const fitToContent = useCallback(() => {
    const canvas = canvasRef.current;
    const nodes = simNodesRef.current;
    if (!canvas || nodes.length === 0) return;

    const dpr = devicePixelRatio;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (const n of nodes) {
      const x = n.x ?? 0;
      const y = n.y ?? 0;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }

    const graphW = maxX - minX + 100;
    const graphH = maxY - minY + 100;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const zoom = Math.min(w / graphW, h / graphH, 1.5);
    cameraRef.current = {
      x: -centerX,
      y: -centerY,
      zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * 0.85)),
    };
  }, []);

  // ─── Build simulation ───────────────────────────────
  useEffect(() => {
    if (nodes.length === 0) {
      simNodesRef.current = [];
      simLinksRef.current = [];
      return;
    }

    const linkCounts = new Map<string, number>();
    for (const e of edges) {
      linkCounts.set(e.sourceNodeId, (linkCounts.get(e.sourceNodeId) ?? 0) + 1);
      linkCounts.set(e.targetNodeId, (linkCounts.get(e.targetNodeId) ?? 0) + 1);
    }

    const simNodes: SimNode[] = nodes.map((n) => ({
      id: n.id,
      title: n.title,
      masteryBand: n.masteryBand,
      masteryScore: n.masteryScore,
      isLocked: n.isLocked,
      linkCount: linkCounts.get(n.id) ?? 0,
    }));

    const nodeMap = new Map(simNodes.map((n) => [n.id, n]));

    const simLinks: SimLink[] = edges
      .filter((e) => nodeMap.has(e.sourceNodeId) && nodeMap.has(e.targetNodeId))
      .map((e) => ({
        source: e.sourceNodeId,
        target: e.targetNodeId,
        relationshipType: e.relationshipType,
      }));

    simNodesRef.current = simNodes;
    simLinksRef.current = simLinks;

    const nodeCount = simNodes.length;
    const chargeStrength =
      nodeCount > 80 ? -800 : nodeCount > 30 ? -500 : -350;
    const linkDistance = nodeCount > 80 ? 100 : nodeCount > 30 ? 80 : 60;

    const sim = forceSimulation<SimNode>(simNodes)
      .force(
        "link",
        forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance(linkDistance)
          .strength(0.5),
      )
      .force(
        "charge",
        forceManyBody<SimNode>().strength(chargeStrength).distanceMax(500),
      )
      .force("center", forceCenter(0, 0).strength(0.05))
      .force(
        "collide",
        forceCollide<SimNode>((d) => getRadius(d) + 8).strength(0.7),
      )
      .force("x", forceX<SimNode>(0).strength(0.02))
      .force("y", forceY<SimNode>(0).strength(0.02))
      .alphaDecay(0.01)
      .velocityDecay(0.3);

    sim.on("tick", () => {
      if (needsFitRef.current && sim.alpha() < 0.3) {
        fitToContent();
        needsFitRef.current = false;
      }
    });

    simRef.current = sim;
    needsFitRef.current = true;

    return () => {
      sim.stop();
      simRef.current = null;
    };
  }, [nodes, edges, getRadius, fitToContent]);

  // ─── Canvas resize ──────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = devicePixelRatio;
      const parent = canvas.parentElement;
      if (!parent) return;
      const { width, height } = parent.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement!);

    return () => observer.disconnect();
  }, []);

  // ─── Animation loop lifecycle ───────────────────────
  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  // ─── Mouse/touch handlers ───────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getMousePos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const pos = getMousePos(e);
      const world = screenToWorld(pos.x, pos.y, canvas);
      const hit = hitTest(world.x, world.y);

      dragRef.current = {
        node: hit,
        isPanning: !hit,
        startX: pos.x,
        startY: pos.y,
        startCamX: cameraRef.current.x,
        startCamY: cameraRef.current.y,
        hasMoved: false,
      };

      if (hit && simRef.current) {
        hit.fx = hit.x;
        hit.fy = hit.y;
        simRef.current.alphaTarget(0.1).restart();
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const pos = getMousePos(e);
      const drag = dragRef.current;

      if (drag.node) {
        const dx = pos.x - drag.startX;
        const dy = pos.y - drag.startY;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) drag.hasMoved = true;

        const world = screenToWorld(pos.x, pos.y, canvas);
        drag.node.fx = world.x;
        drag.node.fy = world.y;
        canvas.style.cursor = "grabbing";
      } else if (drag.isPanning) {
        const dx = pos.x - drag.startX;
        const dy = pos.y - drag.startY;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) drag.hasMoved = true;

        const cam = cameraRef.current;
        cam.x = drag.startCamX + dx / cam.zoom;
        cam.y = drag.startCamY + dy / cam.zoom;
        canvas.style.cursor = "grabbing";
      } else {
        const world = screenToWorld(pos.x, pos.y, canvas);
        const hit = hitTest(world.x, world.y);
        hoveredRef.current = hit;
        canvas.style.cursor = hit ? "pointer" : "default";
      }
    };

    const onMouseUp = () => {
      const drag = dragRef.current;

      if (drag.node) {
        drag.node.fx = null;
        drag.node.fy = null;

        if (!drag.hasMoved) {
          onSelectNode(drag.node.id);
        }

        if (simRef.current) {
          simRef.current.alphaTarget(0);
        }
      } else if (drag.isPanning && !drag.hasMoved) {
        onSelectNode(null);
      }

      dragRef.current = {
        node: null,
        isPanning: false,
        startX: 0,
        startY: 0,
        startCamX: 0,
        startCamY: 0,
        hasMoved: false,
      };
      canvas.style.cursor = "default";
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const cam = cameraRef.current;
      const pos = getMousePos(e);
      const worldBefore = screenToWorld(pos.x, pos.y, canvas);

      const factor = e.deltaY > 0 ? 0.92 : 1.08;
      cam.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, cam.zoom * factor));

      const worldAfter = screenToWorld(pos.x, pos.y, canvas);
      cam.x += worldAfter.x - worldBefore.x;
      cam.y += worldAfter.y - worldBefore.y;
    };

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [screenToWorld, hitTest, onSelectNode]);

  return (
    <div
      className={className}
      style={{ width: "100%", height: "100%", overflow: "hidden" }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
