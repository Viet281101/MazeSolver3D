import * as THREE from 'three';

/**
 * ResourceManager - Centralized management of materials and geometries
 * Reuse resources to avoid continuous creation
 */
export class ResourceManager {
  private materials: Map<string, THREE.Material> = new Map();
  private geometries: Map<string, THREE.BufferGeometry> = new Map();

  /**
   * Get or create material with unique key
   */
  getMaterial(
    key: string,
    type: 'wall' | 'floor',
    color: THREE.Color,
    opacity: number
  ): THREE.MeshBasicMaterial {
    const materialKey = `${key}-${type}-${color.getHexString()}-${opacity}`;

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
   * Create edge material (not cached because used little)
   */
  getEdgeMaterial(): THREE.LineBasicMaterial {
    return new THREE.LineBasicMaterial({ color: 0x000000 });
  }

  /**
   * Update color for all materials of a type
   */
  updateMaterialColor(type: 'wall' | 'floor', color: THREE.Color): void {
    this.materials.forEach((material, key) => {
      if (key.includes(`-${type}-`)) {
        (material as THREE.MeshBasicMaterial).color.copy(color);
      }
    });
  }

  /**
   * Update opacity for all materials of a type
   */
  updateMaterialOpacity(type: 'wall' | 'floor', opacity: number): void {
    this.materials.forEach((material, key) => {
      if (key.includes(`-${type}-`)) {
        const mat = material as THREE.MeshBasicMaterial;
        mat.opacity = opacity;
        mat.transparent = opacity < 1;
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
  }

  /**
   * Clear cache to recreate new materials
   */
  clearMaterialCache(): void {
    this.materials.forEach(material => material.dispose());
    this.materials.clear();
  }
}
