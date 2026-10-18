import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { ModelGeometry } from "./types";

export const SUPPORTED_MODEL_EXTENSIONS = ["stl", "obj", "3mf"] as const;

const getExtension = (fileName: string) =>
  fileName.split(".").pop()?.toLowerCase() ?? "";

// OBJ and 3MF load as a scene graph - flatten every mesh into one
// position-only geometry with its transforms baked in
const flattenObject = (root: THREE.Object3D) => {
  root.updateMatrixWorld(true);
  const parts: THREE.BufferGeometry[] = [];

  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry?.attributes?.position) return;

    const source = mesh.geometry.index
      ? mesh.geometry.toNonIndexed()
      : mesh.geometry.clone();
    const part = new THREE.BufferGeometry();
    part.setAttribute("position", source.attributes.position.clone());
    part.applyMatrix4(mesh.matrixWorld);
    parts.push(part);
  });

  if (!parts.length) throw new Error("No printable mesh found in this file");
  return parts.length === 1 ? parts[0] : mergeGeometries(parts)!;
};

const parseModel = (buffer: ArrayBuffer, extension: string) => {
  switch (extension) {
    case "stl":
      return new STLLoader().parse(buffer);
    case "obj":
      return flattenObject(
        new OBJLoader().parse(new TextDecoder().decode(buffer)),
      );
    case "3mf":
      return flattenObject(new ThreeMFLoader().parse(buffer));
    default:
      throw new Error("Unsupported file type. Please upload STL, OBJ or 3MF.");
  }
};

// Volume via the divergence theorem (sum of signed tetrahedra against the
// origin) - exact for closed meshes, a close estimate for small holes
const measureGeometry = (geometry: THREE.BufferGeometry): ModelGeometry => {
  const position = geometry.attributes.position;
  const index = geometry.index;
  const triangleCount = (index ? index.count : position.count) / 3;

  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();

  let volume = 0;
  let surfaceArea = 0;

  for (let i = 0; i < triangleCount; i++) {
    const ia = index ? index.getX(i * 3) : i * 3;
    const ib = index ? index.getX(i * 3 + 1) : i * 3 + 1;
    const ic = index ? index.getX(i * 3 + 2) : i * 3 + 2;
    a.fromBufferAttribute(position, ia);
    b.fromBufferAttribute(position, ib);
    c.fromBufferAttribute(position, ic);

    volume += a.dot(ab.copy(b).cross(c)) / 6;
    surfaceArea += ab.subVectors(b, a).cross(ac.subVectors(c, a)).length() / 2;
  }

  geometry.computeBoundingBox();
  const size = new THREE.Vector3();
  geometry.boundingBox!.getSize(size);

  return {
    volume: Math.abs(volume),
    surfaceArea,
    size: { x: size.x, y: size.y, z: size.z },
  };
};

export interface LoadedModel {
  geometry: THREE.BufferGeometry;
  metrics: ModelGeometry;
}

export const loadModelFile = async (file: File): Promise<LoadedModel> => {
  const extension = getExtension(file.name);
  if (!SUPPORTED_MODEL_EXTENSIONS.includes(extension as any)) {
    throw new Error("Unsupported file type. Please upload STL, OBJ or 3MF.");
  }

  let geometry: THREE.BufferGeometry;
  try {
    geometry = parseModel(await file.arrayBuffer(), extension);
  } catch (error: any) {
    throw new Error(
      error?.message?.startsWith("No printable") ||
        error?.message?.startsWith("Unsupported")
        ? error.message
        : "Could not read this file. It may be corrupted.",
    );
  }

  const metrics = measureGeometry(geometry);
  if (!(metrics.volume > 0) || !(metrics.surfaceArea > 0)) {
    throw new Error("This model has no volume. Make sure it is a solid mesh.");
  }

  // Sit the model on the build plate, centred, for the viewer
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  geometry.translate(
    -(box.min.x + box.max.x) / 2,
    -(box.min.y + box.max.y) / 2,
    -box.min.z,
  );
  geometry.computeVertexNormals();

  return { geometry, metrics };
};
