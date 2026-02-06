import * as THREE from 'three';

/**
 * ResourceManager - Centralized management of materials and geometries
 * Reuse resources to avoid continuous creation
 */
export class ResourceManager {
  private materials: Map<string, THREE.Material> = new Map();
  private geometries: Map<string, THREE.BufferGeometry> = new Map();
  private edgeGeometries: Map<string, THREE.EdgesGeometry> = new Map();
  private edgeMaterial: THREE.LineBasicMaterial | null = null;

  /**
   * Get or create material with unique key
   */
  getMaterial(
    key: string,
    type: 'wall' | 'floor',
    color: THREE.Color,
    opacity: number
  ): THREE.MeshBasicMaterial {
    const materialKey = `${key}-${type}`;

    if (!this.materials.has(materialKey)) {
      const material = new THREE.MeshBasicMaterial({
        color: color.clone(),
        transparent: opacity < 1,
        opacity,
        side: type === 'floor' ? THREE.DoubleSide : THREE.FrontSide,
      });
      this.materials.set(materialKey, material);
    }

    const material = this.materials.get(materialKey) as THREE.MeshBasicMaterial;

    // Update properties if already exists
    material.color.copy(color);
    material.opacity = opacity;
    material.transparent = opacity < 1;

    return material;
  }

  /**
   * Get or create geometry with unique key
   */
  getBoxGeometry(width: number, height: number, depth: number): THREE.BoxGeometry {
    const key = `box-${width}-${height}-${depth}`;

    if (!this.geometries.has(key)) {
      this.geometries.set(key, new THREE.BoxGeometry(width, height, depth));
    }

    return this.geometries.get(key) as THREE.BoxGeometry;
  }

  /**
   * Get or create plane geometry
   */
  getPlaneGeometry(width: number, height: number): THREE.PlaneGeometry {
    const key = `plane-${width}-${height}`;

    if (!this.geometries.has(key)) {
      this.geometries.set(key, new THREE.PlaneGeometry(width, height));
    }

    return this.geometries.get(key) as THREE.PlaneGeometry;
  }

  /**
   * Get or create edge material (shared)
   */
  getEdgeMaterial(): THREE.LineBasicMaterial {
    if (!this.edgeMaterial) {
      this.edgeMaterial = new THREE.LineBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.9,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });
    }
    return this.edgeMaterial;
  }

  /**
   * Get or create edges geometry for a base geometry
   */
  getEdgesGeometry(baseGeometry: THREE.BufferGeometry): THREE.EdgesGeometry {
    const key = `edges-${baseGeometry.uuid}`;

    if (!this.edgeGeometries.has(key)) {
      this.edgeGeometries.set(key, new THREE.EdgesGeometry(baseGeometry));
    }

    return this.edgeGeometries.get(key) as THREE.EdgesGeometry;
  }

  /**
   * Update color for all materials of a type
   */
  updateMaterialColor(type: 'wall' | 'floor', color: THREE.Color): void {
    this.materials.forEach((material, key) => {
      if (key.endsWith(`-${type}`) || key.includes(`-${type}-`)) {
        (material as THREE.MeshBasicMaterial).color.copy(color);
      }
    });
  }

  /**
   * Update opacity for all materials of a type
   */
  updateMaterialOpacity(type: 'wall' | 'floor', opacity: number): void {
    this.materials.forEach((material, key) => {
      if (key.endsWith(`-${type}`) || key.includes(`-${type}-`)) {
        const mat = material as THREE.MeshBasicMaterial;
        const wasTransparent = mat.transparent;
        mat.opacity = opacity;
        mat.transparent = opacity < 1;
        if (mat.transparent !== wasTransparent) {
          mat.needsUpdate = true;
        }
      }
    });
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    // Dispose materials
    this.materials.forEach(material => {
      material.dispose();
    });
    this.materials.clear();

    // Dispose geometries
    this.geometries.forEach(geometry => {
      geometry.dispose();
    });
    this.geometries.clear();

    // Dispose edges geometries
    this.edgeGeometries.forEach(edges => {
      edges.dispose();
    });
    this.edgeGeometries.clear();

    // Dispose edge material
    if (this.edgeMaterial) {
      this.edgeMaterial.dispose();
      this.edgeMaterial = null;
    }
  }

  /**
   * Clear cache to recreate new materials
   */
  clearMaterialCache(): void {
    this.materials.forEach(material => material.dispose());
    this.materials.clear();
  }
}
