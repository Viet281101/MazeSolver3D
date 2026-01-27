import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class Maze {
  protected canvas: HTMLCanvasElement;
  protected scene: THREE.Scene;
  protected camera: THREE.PerspectiveCamera;
  protected renderer: THREE.WebGLRenderer;
  protected controls: OrbitControls;
  protected maze: number[][][];
  protected wallHeight: number;
  protected wallThickness: number;
  protected cellSize: number;
  protected mazeLayers: THREE.Object3D[];
  protected wallColor: THREE.Color;
  protected floorColor: THREE.Color;
  protected wallOpacity: number;
  protected floorOpacity: number;
  protected showEdges: boolean;

  constructor(
    canvas: HTMLCanvasElement,
    maze: number[][][],
    wallHeight: number = 1,
    wallThickness: number = 0.1,
    cellSize: number = 1
  ) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.maze = maze;
    this.wallHeight = wallHeight;
    this.wallThickness = wallThickness;
    this.cellSize = cellSize;
    this.mazeLayers = [];
    this.wallColor = new THREE.Color(0x808080);
    this.floorColor = new THREE.Color(0xc0c0c0);
    this.wallOpacity = 1.0;
    this.floorOpacity = 1.0;
    this.showEdges = true;

    this.init();
    this.animate();
  }

  protected createWall(
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    depth: number
  ) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshBasicMaterial({
      color: this.wallColor,
      transparent: true,
      opacity: this.wallOpacity,
    });
    const wall = new THREE.Mesh(geometry, material);
    wall.position.set(x, y, z);

    const group = new THREE.Group();
    group.add(wall);
    if (this.showEdges) {
      group.add(this.createEdges(geometry, x, y, z));
    }
    return group;
  }

  protected createFloor(width: number, height: number, x: number, y: number, z: number) {
    const floorGeometry = new THREE.PlaneGeometry(width, height);
    const floorMaterial = new THREE.MeshBasicMaterial({
      color: this.floorColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: this.floorOpacity,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(x, y, z);

    const group = new THREE.Group();
    group.add(floor);
    if (this.showEdges) {
      group.add(this.createEdges(floorGeometry, x, y, z, -Math.PI / 2));
    }
    return group;
  }

  protected createSmallFloor(x: number, y: number, z: number, size: number) {
    const floorGeometry = new THREE.PlaneGeometry(size, size);
    const floorMaterial = new THREE.MeshBasicMaterial({
      color: this.floorColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(x, y, z);

    const group = new THREE.Group();
    group.add(floor);
    if (this.showEdges) {
      group.add(this.createEdges(floorGeometry, x, y, z, -Math.PI / 2));
    }
    return group;
  }

  protected createEdges(
    geometry: THREE.BufferGeometry,
    x: number,
    y: number,
    z: number,
    rotationX: number = 0
  ) {
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
    line.position.set(x, y, z);
    line.rotation.x = rotationX;
    return line;
  }

  protected init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    this.createMaze();
  }

  protected createMaze() {}

  private animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  public resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public deleteMaze() {
    this.mazeLayers.forEach(layer => {
      this.scene.remove(layer);
    });
    this.mazeLayers = [];
  }

  public getRenderer() {
    return this.renderer;
  }
  public updateWallColor(color: string) {
    this.wallColor.set(color);
    this.updateColors();
  }
  public updateFloorColor(color: string) {
    this.floorColor.set(color);
    this.updateColors();
  }
  public updateWallOpacity(opacity: number) {
    this.wallOpacity = opacity;
    this.updateColors();
  }
  public updateFloorOpacity(opacity: number) {
    this.floorOpacity = opacity;
    this.updateColors();
  }
  public toggleEdges(showEdges: boolean) {
    this.showEdges = showEdges;
    this.updateColors();
  }
  protected updateColors() {
    this.mazeLayers.forEach(layer => {
      layer.children.forEach((child: THREE.Object3D) => {
        if (child instanceof THREE.Group) {
          child.children.forEach(mesh => {
            if (mesh instanceof THREE.Mesh) {
              if (mesh.geometry instanceof THREE.PlaneGeometry) {
                (mesh.material as THREE.MeshBasicMaterial).color = this.floorColor;
                (mesh.material as THREE.MeshBasicMaterial).opacity = this.floorOpacity;
              } else if (mesh.geometry instanceof THREE.BoxGeometry) {
                (mesh.material as THREE.MeshBasicMaterial).color = this.wallColor;
                (mesh.material as THREE.MeshBasicMaterial).opacity = this.wallOpacity;
              }
            }
          });
          child.children = child.children.filter(mesh => !(mesh instanceof THREE.LineSegments));
          if (this.showEdges) {
            child.children.forEach(mesh => {
              if (mesh instanceof THREE.Mesh) {
                const edges = new THREE.EdgesGeometry(mesh.geometry);
                const line = new THREE.LineSegments(
                  edges,
                  new THREE.LineBasicMaterial({ color: 0x000000 })
                );
                line.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
                line.rotation.copy(mesh.rotation);
                child.add(line);
              }
            });
          }
        }
      });
    });
  }
}
