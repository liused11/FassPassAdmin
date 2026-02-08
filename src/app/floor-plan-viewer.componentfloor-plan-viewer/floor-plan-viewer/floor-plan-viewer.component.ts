import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MenuItem } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { CommonModule } from '@angular/common';

interface FloorObject {
  id: string;
  type: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
}

@Component({
  selector: 'app-floor-plan-viewer',
  standalone: true,
  imports: [CommonModule, TreeModule, BreadcrumbModule],
  template: `
<div class="flex h-screen w-full">
  <!-- Sidebar -->
  <div class="w-64 bg-gray-50 border-r border-gray-300 overflow-auto p-3">
    <p-tree 
      [value]="buildingTree" 
      selectionMode="single" 
      [(selection)]="selectedNode"
      (onNodeSelect)="onNodeSelect($event)">
    </p-tree>
  </div>

  <!-- Main -->
  <div class="flex-1 flex flex-col relative main-area">
    <!-- Breadcrumb -->
    <div class="p-3 bg-white border-b breadcrumb-overlay flex items-center gap-2 flex-wrap">
      <ng-container *ngFor="let item of breadcrumbItems; let i = index">
        <div class="relative inline-block">
          <span
            class="text-blue-600 hover:underline cursor-pointer font-medium"
            (click)="onBreadcrumbClick(item, i)">
            {{ item.label }}
          </span>

          <!-- Main dropdown for this breadcrumb level -->
          <div *ngIf="dropdownIndex === i && dropdownOptions.length > 0"
               class="breadcrumb-dropdown">
            <span
              *ngFor="let option of dropdownOptions"
              (mouseenter)="showSubmenu(option)"
              (mouseleave)="hideSubmenu()"
              (click)="selectDropdownOption(option)"
              class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-100 hover:text-blue-800 transition-colors duration-150 cursor-pointer breadcrumb-dropdown-option">
              {{ option.label }}

              <!-- Submenu for children -->
              <div *ngIf="submenuOptions && submenuParent === option"
                   class="breadcrumb-submenu">
                <span
                  *ngFor="let child of submenuOptions"
                  (click)="selectSubmenuOption(child); $event.stopPropagation()"
                  class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-100 hover:text-blue-800 transition-colors duration-150 cursor-pointer">
                  {{ child.label }}
                </span>
              </div>
            </span>
          </div>

          <span *ngIf="i < breadcrumbItems.length - 1" class="text-gray-500">›</span>
        </div>
      </ng-container>
    </div>

    <!-- 3D Renderer -->
    <div #rendererContainer class="flex-1 w-full h-full relative"></div>

    <!-- Hover Label -->
    <div *ngIf="hoveredLabel"
         class="absolute bg-black text-white text-sm px-2 py-1 rounded pointer-events-none"
         [style.left.px]="mouse.x + 12"
         [style.top.px]="mouse.y + 12">
      {{ hoveredLabel }}
    </div>
  </div>
</div>
`,
  styles: [`
  :host { display: block; width: 100%; height: 100vh; }
  .main-area { position: relative; }
  .breadcrumb-overlay {
    position: absolute;
    top: 0; left: 0; right: 0;
    z-index: 10;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .breadcrumb-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    min-width: 150px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    z-index: 50;
  }

  .breadcrumb-dropdown-option {
    position: relative;
  }

  .breadcrumb-submenu {
    position: absolute;
    top: 0;
    left: 100%;
    min-width: 150px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    z-index: 51;
  }
`]
})
export class FloorPlanViewerComponent implements AfterViewInit {
  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef;

  breadcrumbItems: MenuItem[] = [{ label: 'KMITL' }];
  dropdownOptions: any[] = [];
  dropdownIndex: number | null = null;
  submenuOptions: any[] | null = null;
  submenuParent: any = null;
  selectedNode: any;

  hoveredLabel: string | null = null;
  mouse = { x: 0, y: 0 };

  buildingTree: any[] = [
    {
      label: 'KMITL',
      expanded: true,
      children: [
        {
          label: 'Ladkrabang Campus',
          expanded: true,
          children: [
            {
              label: 'Engineering',
              expanded: true,
              children: [
                {
                  label: 'Building A',
                  expanded: true,
                  children: [
                    { label: 'Floor 1', data: { type: 'floor', building: 'A', floor: 1 } },
                    { label: 'Floor 2', data: { type: 'floor', building: 'A', floor: 2 } }
                  ],
                  data: { type: 'building', code: 'eng_a' }
                },
                {
                  label: 'E12 Building',
                  expanded: true,
                  children: [
                    { label: 'Floor 1', data: { type: 'floor', building: 'E12', floor: 1 } },
                    { label: 'Floor 2', data: { type: 'floor', building: 'E12', floor: 2 } }
                  ],
                  data: { type: 'building', code: 'eng_e12' }
                }
              ]
            }
          ]
        }
      ]
    },
    {
      label: 'KMUTT',
      expanded: true,
      children: [
        {
          label: 'Bangmod Campus',
          expanded: true,
          children: [
            {
              label: 'Science',
              expanded: true,
              children: [
                {
                  label: 'Building X',
                  expanded: true,
                  children: [
                    { label: 'Floor 1', data: { type: 'floor', building: 'X', floor: 1 } },
                    { label: 'Floor 2', data: { type: 'floor', building: 'X', floor: 2 } }
                  ],
                  data: { type: 'building', code: 'kmutt_x' }
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private interactiveMeshes: { mesh: THREE.Mesh, label: string }[] = [];

  ngAfterViewInit(): void {
    this.initScene();
    this.loadFloorData(this.getFloorData());
    window.addEventListener('resize', () => this.onResize());
  }

  /** SCENE INIT */
  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);

    const width = this.rendererContainer.nativeElement.clientWidth;
    const height = this.rendererContainer.nativeElement.clientHeight;

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(15, 25, 25);
    this.camera.lookAt(15, 0, 7.5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(15, 0, 7.5);
    this.controls.update();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(10, 20, 10);
    this.scene.add(ambientLight, dirLight);

    this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));

    const animate = () => {
      requestAnimationFrame(animate);
      this.controls.update();
      this.renderScene();
    };
    animate();
  }

  renderScene() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveMeshes.map(o => o.mesh));

    if (intersects.length > 0) {
      const found = this.interactiveMeshes.find(o => o.mesh === intersects[0].object);
      this.hoveredLabel = found ? found.label : null;
    } else {
      this.hoveredLabel = null;
    }

    this.renderer.render(this.scene, this.camera);
  }

  onMouseMove(event: MouseEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.mouse.x = event.clientX - rect.left;
    this.mouse.y = event.clientY - rect.top;
  }

  /** TREE + BREADCRUMB LOGIC */
  onNodeSelect(event: any) {
    const node = event.node;
    this.updateBreadcrumb(node);
    if (node.data?.type === 'floor') this.loadFloorData(this.getFloorData());
    else this.clearScene();
  }

  onBreadcrumbClick(item: any, index: number) {
    // Show siblings for this breadcrumb level
    this.dropdownOptions = this.getSiblings(index);
    this.dropdownIndex = index;
    this.submenuOptions = null;
    this.submenuParent = null;
  }

  showSubmenu(option: any) {
    // Show children for hovered sibling
    this.submenuOptions = this.getChildren(option);
    this.submenuParent = option;
  }

  hideSubmenu() {
    this.submenuOptions = null;
    this.submenuParent = null;
  }

  selectDropdownOption(option: any) {
    // If clicking a sibling, navigate to it
    this.selectedNode = option;
    this.updateBreadcrumb(option);
    if (option.data?.type === 'floor') this.loadFloorData(this.getFloorData());
    else this.clearScene();
    this.dropdownOptions = [];
    this.dropdownIndex = null;
    this.submenuOptions = null;
    this.submenuParent = null;
  }

  selectSubmenuOption(child: any) {
    // If clicking a child, navigate to it
    this.selectedNode = child;
    this.updateBreadcrumb(child);
    if (child.data?.type === 'floor') this.loadFloorData(this.getFloorData());
    else this.clearScene();
    this.dropdownOptions = [];
    this.dropdownIndex = null;
    this.submenuOptions = null;
    this.submenuParent = null;
  }

  findNodeByPath(index: number) {
    let current = this.buildingTree[0];
    for (let i = 1; i <= index; i++) {
      const nextLabel = this.breadcrumbItems[i].label;
      current = current.children?.find((c: any) => c.label === nextLabel);
    }
    return current;
  }

  updateBreadcrumb(node: any) {
    const path: any[] = [];
    let current = node;
    while (current) {
      path.unshift(current);
      current = current.parent;
    }
    this.breadcrumbItems = path.map(n => ({ label: n.label }));
  }

  navigateToBreadcrumbNode(index: number) {
    const targetNode = this.findNodeByPath(index);
    this.selectedNode = targetNode;
    this.updateBreadcrumb(targetNode);
    if (targetNode.data?.type === 'floor') this.loadFloorData(this.getFloorData());
    else this.clearScene();
  }

  /** 3D DRAWING */
  clearScene() {
    for (let i = this.scene.children.length - 1; i >= 0; i--) {
      const obj = this.scene.children[i];
      if (!(obj instanceof THREE.Light)) this.scene.remove(obj);
    }
    this.interactiveMeshes = [];
  }

  loadFloorData(data: any) {
    this.clearScene();
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const wallHeight = 2.5;
    const wallThickness = 0.1;

    data.walls.forEach((wall: any, i: number) => {
      const dx = wall.end.x - wall.start.x;
      const dy = wall.end.y - wall.start.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const geom = new THREE.BoxGeometry(length, wallHeight, wallThickness);
      const mesh = new THREE.Mesh(geom, wallMaterial);
      mesh.position.set(wall.start.x + dx / 2, wallHeight / 2, wall.start.y + dy / 2);
      mesh.rotation.y = -Math.atan2(dy, dx);
      this.scene.add(mesh);
    });

    const areaMat = new THREE.MeshStandardMaterial({ color: 0xF5F5F5, side: THREE.DoubleSide });
    data.areas.forEach((a: any) => {
      const w = a.boundary.max.x - a.boundary.min.x;
      const d = a.boundary.max.y - a.boundary.min.y;
      const geom = new THREE.PlaneGeometry(w, d);
      const mat = areaMat.clone();
      mat.color = new THREE.Color(a.color);
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(a.boundary.min.x + w / 2, 0, a.boundary.min.y + d / 2);
      mesh.rotation.x = -Math.PI / 2;
      this.scene.add(mesh);
      this.interactiveMeshes.push({ mesh, label: a.id });
    });

    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const doorWidth = 0.9;
    const doorHeight = 2.1;
    const doorThickness = 0.2;

    const doors: FloorObject[] = (data.objects ?? []).filter(
      (obj: any): obj is FloorObject => obj.type === 'door'
    );

    doors.forEach((door) => {
      const dx = door.end.x - door.start.x;
      const dy = door.end.y - door.start.y;
      const geom = new THREE.BoxGeometry(doorWidth, doorHeight, doorThickness);
      const mesh = new THREE.Mesh(geom, doorMaterial);
      mesh.position.set(door.start.x + dx / 2, doorHeight / 2, door.start.y + dy / 2);
      mesh.rotation.y = -Math.atan2(dy, dx);
      this.scene.add(mesh);
      this.interactiveMeshes.push({ mesh, label: door.id });
    });
  }

  onResize() {
    if (!this.renderer || !this.camera) return;
    const width = this.rendererContainer.nativeElement.clientWidth;
    const height = this.rendererContainer.nativeElement.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
  
  getFloorData() {
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
        { "id": "door_1", "type": "door", "start": { "x": 39.0, "y": 5.0 }, "end": { "x": 41.0, "y": 5.0 } },
        { "id": "door_2", "type": "door", "start": { "x": 51.0, "y": 5.0 }, "end": { "x": 53.0, "y": 5.0 } },
        { "id": "door_3", "type": "door", "start": { "x": 43.0, "y": 4.0 }, "end": { "x": 44.0, "y": 4.0 } },
        { "id": "door_4", "type": "door", "start": { "x": 47.0, "y": 4.0 }, "end": { "x": 48.0, "y": 4.0 } },
        { "id": "door_5", "type": "door", "start": { "x": 51.0, "y": 4.0 }, "end": { "x": 52.0, "y": 4.0 } },
        { "id": "door_6", "type": "door", "start": { "x": 36.0, "y": 11.0 }, "end": { "x": 37.0, "y": 11.0 } },
        { "id": "door_7", "type": "door", "start": { "x": 55.0, "y": 11.0 }, "end": { "x": 56.0, "y": 11.0 } },
        { "id": "door_8", "type": "door", "start": { "x": 7.0, "y": 17.0 }, "end": { "x": 8.0, "y": 17.0 } },
        { "id": "door_9", "type": "door", "start": { "x": 16.0, "y": 17.0 }, "end": { "x": 17.0, "y": 17.0 } },
        { "id": "door_10", "type": "door", "start": { "x": 25.0, "y": 17.0 }, "end": { "x": 26.0, "y": 17.0 } },
        { "id": "door_11", "type": "door", "start": { "x": 34.0, "y": 17.0 }, "end": { "x": 35.0, "y": 17.0 } },
        { "id": "door_12", "type": "door", "start": { "x": 62.0, "y": 17.0 }, "end": { "x": 63.0, "y": 17.0 } },
        { "id": "door_13", "type": "door", "start": { "x": 71.0, "y": 17.0 }, "end": { "x": 72.0, "y": 17.0 } },
        { "id": "door_14", "type": "door", "start": { "x": 80.0, "y": 17.0 }, "end": { "x": 81.0, "y": 17.0 } },
        { "id": "door_15", "type": "door", "start": { "x": 89.0, "y": 17.0 }, "end": { "x": 90.0, "y": 17.0 } }
      ],
      "walls": [
        { "start": { "x": 1.0, "y": 10.0 }, "end": { "x": 1.0, "y": 24.0 } },
        { "start": { "x": 1.0, "y": 24.0 }, "end": { "x": 36.0, "y": 24.0 } },
        { "start": { "x": 36.0, "y": 24.0 }, "end": { "x": 36.0, "y": 10.0 } },
        { "start": { "x": 36.0, "y": 10.0 }, "end": { "x": 1.0, "y": 10.0 } },
        { "start": { "x": 9.0, "y": 17.0 }, "end": { "x": 9.0, "y": 24.0 } },
        { "start": { "x": 18.0, "y": 17.0 }, "end": { "x": 18.0, "y": 24.0 } },
        { "start": { "x": 27.0, "y": 17.0 }, "end": { "x": 27.0, "y": 24.0 } },
        { "start": { "x": 1.0, "y": 17.0 }, "end": { "x": 36.0, "y": 17.0 } },
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
        { "start": { "x": 56.0, "y": 17.0 }, "end": { "x": 91.0, "y": 17.0 } }
      ]
    };
  }

  getSiblings(index: number): any[] {
    // If root, return all root nodes
    if (index === 0) return this.buildingTree;
    // Traverse down the breadcrumb path to get parent node
    let parent = null;
    let currentLevel = this.buildingTree;
    for (let i = 0; i < index; i++) {
      const label = this.breadcrumbItems[i].label;
      parent = currentLevel.find((node: any) => node.label === label);
      currentLevel = parent?.children || [];
    }
    return currentLevel;
  }

  getChildren(option: any): any[] {
    return option.children || [];
  }
}