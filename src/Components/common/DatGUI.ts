import * as THREE from 'three';
import { GUI } from 'dat.gui';

import { TransControlMode } from '../../models/Mode';

export class DatGUI {
  private gui: GUI;

  constructor(private mode: TransControlMode, private object: THREE.Object3D) {
    this.initGUI();
  }

  private target(object: THREE.Object3D) {
    switch (this.mode) {
      case 'translate':
        return object.position;
      case 'rotate':
        return object.rotation;
      case 'scale':
        return object.scale;
      default:
        return object.position;
    }
  }

  private initGUI() {
    this.gui = new GUI();
    // console.log(this.object);
    if (this.object instanceof THREE.Mesh) {
      this.addFolder(this.mode, this.object, true);
    } else if (this.object instanceof THREE.Bone) {
      // when hand model
      // console.log(this.object);
      this.addFoldersHandPose(this.object);
    }
  }

  private addFolder(folderName: string, object: THREE.Object3D, isOpen: boolean = false) {
    const guiFolder = this.gui.addFolder(folderName);
    guiFolder.add(this.target(object), 'x', 0, Math.PI * 2, 0.01);
    guiFolder.add(this.target(object), 'y', 0, Math.PI * 2, 0.01);
    guiFolder.add(this.target(object), 'z', 0, Math.PI * 2, 0.01);
    if (isOpen) {
      guiFolder.open();
    }
  }

  private addFoldersHandPose(group: THREE.Bone) {
    console.log('addFoldersHandPose');
    group.traverse((object) => {
      // console.log(object.name);
      this.addFolder(object.name, object);
    });
  }

  update() {
    this.gui.updateDisplay();
  }
}
