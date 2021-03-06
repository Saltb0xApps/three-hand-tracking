import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

import { DatGUI } from '../common/DatGUI';
import { TransOrbitControls } from '../common/TransOrbitControls';
import { TransControlMode } from '../../models/Mode';

const GLTF_PATH = '../../assets/hand.gltf';
const radius180 = Math.PI;
const characterInfo = {
  position: [0.0, 0.0, 0.0],
  rotation: [0.0, radius180, 0.0],
  scale: [4.0, 4.0, 4.0],
};

export class DebugHandGLTF {
  private width: number;
  private height: number;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.Camera;
  private scene: THREE.Scene;
  private gui: DatGUI;
  private mode: TransControlMode = 'rotate';
  private characterGroup: THREE.Group;

  constructor() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);
    this.init();
  }

  async init() {
    this.scene = new THREE.Scene();
    const gridHelper = new THREE.GridHelper(200, 50);
    this.scene.add(gridHelper);
    this.initCamera();

    const light = new THREE.DirectionalLight(0xffffff, 10);
    this.scene.add(light);

    this.addObject();
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000);
    this.camera.position.set(0, 10, -50);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  }

  async addObject() {
    const loader = new GLTFLoader();
    const gltf: GLTF = await loader.loadAsync(GLTF_PATH);
    this.characterGroup = gltf.scene;
    const {
      position: [posX, posY, posZ],
      rotation: [rotateX, rotateY, rotateZ],
      scale: [scaleX, scaleY, scaleZ],
    } = characterInfo;
    this.characterGroup.position.set(posX, posY, posZ);
    this.characterGroup.rotation.set(rotateX, rotateY, rotateZ);
    this.characterGroup.scale.set(scaleX, scaleY, scaleZ);
    this.scene.add(this.characterGroup);

    const armature = this.characterGroup.children[0];
    const skeltonHelper = new THREE.SkeletonHelper(armature);
    this.scene.add(skeltonHelper);

    // NG: SkinnedMesh and Bones are No Bind
    // armature.children.forEach((object) => {
    //   if (object instanceof THREE.SkinnedMesh) {
    //     object.material = new THREE.MeshLambertMaterial({
    //       color: 0x00ff00,
    //       side: THREE.DoubleSide,
    //     });
    //   }
    // });

    // NG: SkinnedMesh and Bones are No Bind
    // this.characterGroup.traverse((mesh) => {
    //   if (mesh instanceof THREE.SkinnedMesh) {
    //     mesh.material = new THREE.MeshLambertMaterial({
    //       color: 0x00ff00,
    //       side: THREE.DoubleSide,
    //     });
    //   }
    // });

    this.commonInit();
    this.tick();
  }

  commonInit() {
    const mesh = this.characterGroup?.children[0]?.children[1] as THREE.SkinnedMesh;
    const rootBone = mesh.skeleton.bones[0];

    this.gui = new DatGUI(this.mode, rootBone);
    new TransOrbitControls(
      this.mode,
      this.camera,
      this.renderer,
      this.scene,
      rootBone,
      this.tick()
    );
  }

  tick() {
    this.gui.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.tick());
  }
}
