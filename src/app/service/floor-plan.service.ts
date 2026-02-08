import { Injectable } from '@angular/core';
import * as THREE from 'three';

export interface Boundary {
  min: { x: number; y: number };
  max: { x: number; y: number };
}

export interface Area {
  id: string;
  color: string;
  boundary: Boundary;
}

export interface Object3D {
  id: string;
  type: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
}

export interface Wall {
  start: { x: number; y: number };
  end: { x: number; y: number };
}

export interface FloorData {
  areas: Area[];
  objects: Object3D[];
  walls: Wall[];
}

@Injectable({
  providedIn: 'root'
})
export class FloorPlanService {

  constructor() { }

  /** Return all floor data */
  getFloorData(): FloorData {
    return {
  "areas": [
    {
      "id": "Room 1",
      "color": "#9370DB",
      "boundary": {
        "min": { "x": 1.0, "y": 17.0 },
        "max": { "x": 9.0, "y": 24.0 }
      }
    },
    {
      "id": "Room 2",
      "color": "#9370DB",
      "boundary": {
        "min": { "x": 10.0, "y": 17.0 },
        "max": { "x": 18.0, "y": 24.0 }
      }
    },
    {
      "id": "Room 3",
      "color": "#9370DB",
      "boundary": {
        "min": { "x": 19.0, "y": 17.0 },
        "max": { "x": 27.0, "y": 24.0 }
      }
    },
    {
      "id": "Room 4",
      "color": "#9370DB",
      "boundary": {
        "min": { "x": 28.0, "y": 17.0 },
        "max": { "x": 36.0, "y": 24.0 }
      }
    },
    {
      "id": "Hallway 1",
      "color": "#B0C4DE",
      "boundary": {
        "min": { "x": 1.0, "y": 10.0 },
        "max": { "x": 36.0, "y": 16.0 }
      }
    },
    {
      "id": "Central Hall",
      "color": "#F5F5F5",
      "boundary": {
        "min": { "x": 37.0, "y": 5.0 },
        "max": { "x": 55.0, "y": 20.0 }
      }
    },
    {
      "id": "Restroom 1",
      "color": "#A9A9A9",
      "boundary": {
        "min": { "x": 42.0, "y": 1.0 },
        "max": { "x": 45.0, "y": 4.0 }
      }
    },
    {
      "id": "Restroom 2",
      "color": "#A9A9A9",
      "boundary": {
        "min": { "x": 46.0, "y": 1.0 },
        "max": { "x": 49.0, "y": 4.0 }
      }
    },
    {
      "id": "Restroom 3",
      "color": "#A9A9A9",
      "boundary": {
        "min": { "x": 50.0, "y": 1.0 },
        "max": { "x": 53.0, "y": 4.0 }
      }
    },
    {
      "id": "Staircase",
      "color": "#D3D3D3",
      "boundary": {
        "min": { "x": 43.0, "y": 21.0 },
        "max": { "x": 50.0, "y": 24.0 }
      }
    },
    {
      "id": "Hallway 2",
      "color": "#AFEEEE",
      "boundary": {
        "min": { "x": 56.0, "y": 10.0 },
        "max": { "x": 91.0, "y": 16.0 }
      }
    },
    {
      "id": "Room 5",
      "color": "#87CEEB",
      "boundary": {
        "min": { "x": 56.0, "y": 17.0 },
        "max": { "x": 64.0, "y": 24.0 }
      }
    },
    {
      "id": "Room 6",
      "color": "#87CEEB",
      "boundary": {
        "min": { "x": 65.0, "y": 17.0 },
        "max": { "x": 73.0, "y": 24.0 }
      }
    },
    {
      "id": "Room 7",
      "color": "#87CEEB",
      "boundary": {
        "min": { "x": 74.0, "y": 17.0 },
        "max": { "x": 82.0, "y": 24.0 }
      }
    },
    {
      "id": "Room 8",
      "color": "#87CEEB",
      "boundary": {
        "min": { "x": 83.0, "y": 17.0 },
        "max": { "x": 91.0, "y": 24.0 }
      }
    }
  ],
  "objects": [
    {
      "id": "door_1",
      "type": "door",
      "start": { "x": 39.0, "y": 5.0 },
      "end": { "x": 41.0, "y": 5.0 }
    },
    {
      "id": "door_2",
      "type": "door",
      "start": { "x": 51.0, "y": 5.0 },
      "end": { "x": 53.0, "y": 5.0 }
    },
    {
      "id": "door_3",
      "type": "door",
      "start": { "x": 43.0, "y": 4.0 },
      "end": { "x": 44.0, "y": 4.0 }
    },
    {
      "id": "door_4",
      "type": "door",
      "start": { "x": 47.0, "y": 4.0 },
      "end": { "x": 48.0, "y": 4.0 }
    },
    {
      "id": "door_5",
      "type": "door",
      "start": { "x": 51.0, "y": 4.0 },
      "end": { "x": 52.0, "y": 4.0 }
    },
    {
      "id": "door_6",
      "type": "door",
      "start": { "x": 36.0, "y": 11.0 },
      "end": { "x": 37.0, "y": 11.0 }
    },
    {
      "id": "door_7",
      "type": "door",
      "start": { "x": 55.0, "y": 11.0 },
      "end": { "x": 56.0, "y": 11.0 }
    },
    {
      "id": "door_8",
      "type": "door",
      "start": { "x": 7.0, "y": 17.0 },
      "end": { "x": 8.0, "y": 17.0 }
    },
    {
      "id": "door_9",
      "type": "door",
      "start": { "x": 16.0, "y": 17.0 },
      "end": { "x": 17.0, "y": 17.0 }
    },
    {
      "id": "door_10",
      "type": "door",
      "start": { "x": 25.0, "y": 17.0 },
      "end": { "x": 26.0, "y": 17.0 }
    },
    {
      "id": "door_11",
      "type": "door",
      "start": { "x": 34.0, "y": 17.0 },
      "end": { "x": 35.0, "y": 17.0 }
    },
    {
      "id": "door_12",
      "type": "door",
      "start": { "x": 62.0, "y": 17.0 },
      "end": { "x": 63.0, "y": 17.0 }
    },
    {
      "id": "door_13",
      "type": "door",
      "start": { "x": 71.0, "y": 17.0 },
      "end": { "x": 72.0, "y": 17.0 }
    },
    {
      "id": "door_14",
      "type": "door",
      "start": { "x": 80.0, "y": 17.0 },
      "end": { "x": 81.0, "y": 17.0 }
    },
    {
      "id": "door_15",
      "type": "door",
      "start": { "x": 89.0, "y": 17.0 },
      "end": { "x": 90.0, "y": 17.0 }
    }
  ],
  "walls": [
    { "start": { "x": 0.0, "y": 0.0 }, "end": { "x": 92.0, "y": 0.0 } },
    { "start": { "x": 92.0, "y": 0.0 }, "end": { "x": 92.0, "y": 25.0 } },
    { "start": { "x": 92.0, "y": 25.0 }, "end": { "x": 0.0, "y": 25.0 } },
    { "start": { "x": 0.0, "y": 25.0 }, "end": { "x": 0.0, "y": 0.0 } },

    { "start": { "x": 1.0, "y": 10.0 }, "end": { "x": 1.0, "y": 24.0 } },
    { "start": { "x": 1.0, "y": 24.0 }, "end": { "x": 36.0, "y": 24.0 } },
    { "start": { "x": 36.0, "y": 24.0 }, "end": { "x": 36.0, "y": 10.0 } },
    { "start": { "x": 36.0, "y": 10.0 }, "end": { "x": 1.0, "y": 10.0 } },

    { "start": { "x": 9.0, "y": 17.0 }, "end": { "x": 9.0, "y": 24.0 } },
    { "start": { "x": 18.0, "y": 17.0 }, "end": { "x": 18.0, "y": 24.0 } },
  	{ "start": { "x": 27.0, "y": 17.0 }, "end": { "x": 27.0, "y": 24.0 } },

    { "start": { "x": 37.0, "y": 5.0 }, "end": { "x": 55.0, "y": 5.0 } },
    { "start": { "x": 55.0, "y": 5.0 }, "end": { "x": 55.0, "y": 20.0 } },
  	{ "start": { "x": 55.0, "y": 20.0 }, "end": { "x": 37.0, "y": 20.0 } },
  	{ "start": { "x": 37.0, "y": 20.0 }, "end": { "x": 37.0, "y": 5.0 } },

  	{ "start": { "x": 42.0, "y": 1.0 }, "end": { "x": 45.0, "y": 1.0 } },
  	{ "start": { "x": 45.0, "y": 1.0 }, "end": { "x": 45.0, "y": 4.0 } },
  	{ "start": { "x": 45.0, "y": 4.0 }, "end": { "x": 42.0, "y": 4.0 } },
  	{ "start": { "x": 42.0, "y": 4.0 }, "end": { "x": 42.0, "y": 1.0 } },

  	{ "start": { "x": 46.0, "y": 1.0 }, "end": { "x": 49.0, "y": 1.0 } },
  	{ "start": { "x": 49.0, "y": 1.0 }, "end": { "x": 49.0, "y": 4.0 } },
  	{ "start": { "x": 49.0, "y": 4.0 }, "end": { "x": 46.0, "y": 4.0 } },
  	{ "start": { "x": 46.0, "y": 4.0 }, "end": { "x": 46.0, "y": 1.0 } },

  	{ "start": { "x": 50.0, "y": 1.0 }, "end": { "x": 53.0, "y": 1.0 } },
  	{ "start": { "x": 53.0, "y": 1.0 }, "end": { "x": 53.0, "y": 4.0 } },
  	{ "start": { "x": 53.0, "y": 4.0 }, "end": { "x": 50.0, "y": 4.0 } },
  	{ "start": { "x": 50.0, "y": 4.0 }, "end": { "x": 50.0, "y": 1.0 } },

  	{ "start": { "x": 43.0, "y": 21.0 }, "end": { "x": 50.0, "y": 21.0 } },
  	{ "start": { "x": 50.0, "y": 21.0 }, "end": { "x": 50.0, "y": 24.0 } },
  	{ "start": { "x": 50.0, "y": 24.0 }, "end": { "x": 43.0, "y": 24.0 } },
  	{ "start": { "x": 43.0, "y": 24.0 }, "end": { "x": 43.0, "y": 21.0 } },

  	{ "start": { "x": 56.0, "y": 10.0 }, "end": { "x": 91.0, "y": 10.0 } },
  	{ "start": { "x": 91.0, "y": 10.0 }, "end": { "x": 91.0, "y": 24.0 } },
  	{ "start": { "x": 91.0, "y": 24.0 }, "end": { "x": 56.0, "y": 24.0 } },
  	{ "start": { "x": 56.0, "y": 24.0 }, "end": { "x": 56.0, "y": 10.0 } },

  	{ "start": { "x": 64.0, "y": 17.0 }, "end": { "x": 64.0, "y": 24.0 } },
  	{ "start": { "x": 73.0, "y": 17.0 }, "end": { "x": 73.0, "y": 24.0 } },
  	{ "start": { "x": 82.0, "y": 17.0 }, "end": { "x": 82.0, "y": 24.0 } },
  	
  ]
};
  }

  /** Create wall meshes */
  createWallMeshes(walls: Wall[], wallHeight = 2.5, wallThickness = 0.1, color = 0x444444): THREE.Mesh[] {
    const material = new THREE.MeshStandardMaterial({ color });
    return walls.map(w => {
      const dx = w.end.x - w.start.x;
      const dy = w.end.y - w.start.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const geom = new THREE.BoxGeometry(length, wallHeight, wallThickness);
      const mesh = new THREE.Mesh(geom, material);
      mesh.position.set(w.start.x + dx / 2, wallHeight / 2, w.start.y + dy / 2);
      mesh.rotation.y = -Math.atan2(dy, dx);
      return mesh;
    });
  }

  /** Create area meshes */
  createAreaMeshes(areas: Area[]): THREE.Mesh[] {
    return areas.map(a => {
      const w = a.boundary.max.x - a.boundary.min.x;
      const d = a.boundary.max.y - a.boundary.min.y;
      const geom = new THREE.PlaneGeometry(w, d);
      const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(a.color), side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(a.boundary.min.x + w / 2, 0, a.boundary.min.y + d / 2);
      mesh.rotation.x = -Math.PI / 2;
      return mesh;
    });
  }
}
