import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ResourceManager } from '../resources/ResourceManager';
import { DisposalHelper } from '../resources/DisposalHelper';
import { MeshFactory } from '../resources/MeshFactory';

export interface MazeConfig {
  wallHeight?: number;
  wallThickness?: number;
  cellSize?: number;
}

/**
 * Base Maze Class - Manages Three.js scene and rendering
 * Refactored with proper memory management
 */
export abstract class Maze {
  // Three.js core
  protected canvas: HTMLCanvasElement;
  protected scene: THREE.Scene;
  protected camera: THREE.PerspectiveCamera;
  protected renderer: THREE.WebGLRenderer;
  protected controls: OrbitControls;

  // Maze data
  protected maze: number[][][];
  protected mazeLayers: THREE.Object3D[] = [];

  // Configuration
  protected wallHeight: number;
  protected wallThickness: number;
  protected cellSize: number;

  // Visual properties
  protected wallColor: THREE.Color;
  protected floorColor: THREE.Color;
  protected wallOpacity: number;
  protected floorOpacity: number;
  protected showEdges: boolean;

  // Resource management
  protected resourceManager: ResourceManager;
  protected meshFactory: MeshFactory;

  // Animation control
  private animationId: number | null = null;
  private isDisposed: boolean = false;

  constructor(canvas: HTMLCanvasElement, maze: number[][][], config: MazeConfig = {}) {
    this.canvas = canvas;
    this.maze = maze;

    // Configuration với defaults
    this.wallHeight = config.wallHeight ?? 1;
    this.wallThickness = config.wallThickness ?? 0.1;
    this.cellSize = config.cellSize ?? 1;

    // Visual defaults
    this.wallColor = new THREE.Color(0x808080);
    this.floorColor = new THREE.Color(0xc0c0c0);
    this.wallOpacity = 1.0;
    this.floorOpacity = 1.0;
    this.showEdges = true;

    // Initialize Three.js
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Initialize resource managers
    this.resourceManager = new ResourceManager();
    this.meshFactory = new MeshFactory(
      this.resourceManager,
      this.wallColor,
      this.floorColor,
      this.wallOpacity,
      this.floorOpacity,
      this.showEdges
    );

    this.init();
  }

  /**
   * Initialize renderer and start animation loop
   */
  protected init(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Configure controls
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    this.createMaze();
    this.startAnimation();
  }

  /**
   * Abstract method - must implement in subclass
   */
  protected abstract createMaze(): void;

  /**
   * Position camera to view entire maze
   */
  protected positionCamera(centerX: number, centerZ: number, distance: number): void {
    this.camera.position.set(centerX, 5, distance);
    this.controls.target.set(centerX, 0, centerZ);
    this.controls.update();
  }

  /**
   * Start animation loop
   */
  private startAnimation(): void {
    if (this.isDisposed) return;

    const animate = () => {
      if (this.isDisposed) return;

      this.animationId = requestAnimationFrame(animate);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  /**
   * Stop animation loop
   */
  private stopAnimation(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Resize handler
   */
  public resize(): void {
    if (this.isDisposed) return;

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Delete maze layers (giữ scene)
   */
  public deleteMaze(): void {
    this.mazeLayers.forEach(layer => {
      DisposalHelper.disposeObject(layer);
      this.scene.remove(layer);
    });
    this.mazeLayers = [];
  }

  /**
   * Destroy entire maze instance
   */
  public destroy(): void {
    if (this.isDisposed) return;

    this.isDisposed = true;

    // Stop animation
    this.stopAnimation();

    // Delete maze
    this.deleteMaze();

    // Dispose controls
    this.controls.dispose();

    // Dispose resources
    this.resourceManager.dispose();

    // Dispose scene
    DisposalHelper.disposeScene(this.scene);

    // Dispose renderer
    this.renderer.dispose();
  }

  // ========== PUBLIC API ==========

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  public updateWallColor(color: string): void {
    this.wallColor.set(color);
    this.resourceManager.updateMaterialColor('wall', this.wallColor);
    this.meshFactory.updateSettings({ wallColor: this.wallColor });
  }

  public updateFloorColor(color: string): void {
    this.floorColor.set(color);
    this.resourceManager.updateMaterialColor('floor', this.floorColor);
    this.meshFactory.updateSettings({ floorColor: this.floorColor });
  }

  public updateWallOpacity(opacity: number): void {
    this.wallOpacity = opacity;
    this.resourceManager.updateMaterialOpacity('wall', opacity);
    this.meshFactory.updateSettings({ wallOpacity: opacity });
  }

  public updateFloorOpacity(opacity: number): void {
    this.floorOpacity = opacity;
    this.resourceManager.updateMaterialOpacity('floor', opacity);
    this.meshFactory.updateSettings({ floorOpacity: opacity });
  }

  public toggleEdges(showEdges: boolean): void {
    if (this.showEdges === showEdges) return;

    this.showEdges = showEdges;
    this.meshFactory.updateSettings({ showEdges });
    this.rebuildEdges();
  }

  /**
   * Rebuild edges on all maze layers
   */
  private rebuildEdges(): void {
    this.mazeLayers.forEach(layer => {
      layer.children.forEach(child => {
        if (child instanceof THREE.Group) {
          // Remove old edges
          DisposalHelper.disposeEdgesFromGroup(child);

          // Add new edges if needed
          if (this.showEdges) {
            child.children.forEach(obj => {
              if (obj instanceof THREE.Mesh) {
                const edges = new THREE.EdgesGeometry(obj.geometry);
                const material = this.resourceManager.getEdgeMaterial();
                const line = new THREE.LineSegments(edges, material);

                line.position.copy(obj.position);
                line.rotation.copy(obj.rotation);

                child.add(line);
              }
            });
          }
        }
      });
    });
  }
}
