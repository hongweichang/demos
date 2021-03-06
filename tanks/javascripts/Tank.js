function Tank(template, scene, touchController, inputHandler, camera) {
  this.template = template;
  this.scene = scene;
  this.inputHandler = inputHandler;
  this.touchController = touchController;
  this.camera = camera;
  this.ready = false;
  this.active = false;

  this.tank = undefined;
  this.turret = undefined;
  this.gun = undefined;

  this.tankDestoyed = undefined;

  this.tmpVector3 = new THREE.Vector3();
  this.tmpQuaternion = new THREE.Quaternion();

}

Tank.prototype.init = function(callback) {
  var that = this;

  if (this.ready) return callback();

  this.template.clone({ success_hierarchy: function(instance) {
    that.scene.addChildObject(instance);
    that._initializeWithInstance(instance);
    callback();
  }});
}

Tank.prototype.setAsActive = function() {
  this.tank.visible = true;
  this.turret.visible = true;
  this.gun.visible = true;
  this.tankDestroyed.visible = false;
  this.active = true;

  this.camera.position.set( 0, 0.5, -1.5 );
  this.camera.lookAt(new THREE.Vector3(0,0.5,0));
}

Tank.prototype.setAsDestroyed = function() {
  this.active = false;
  this.tankDestroyed.visible = true;
  this.tank.visible = false;
  this.turret.visible = false;
  this.gun.visible = false;

  this.camera.position.set( 0.5, 0.5, 1.5 );
  this.camera.lookAt(new THREE.Vector3(0,0,0));
}

Tank.prototype.isActive = function() {
  return this.active;
}

Tank.prototype.update = function() {
}

Tank.prototype.fixedUpdate = function() {
  if (this.inputHandler) {
    if (this.active) {
      if (this.inputHandler.keyDown('leftArrow') || (this.touchController && this.touchController.keyDown('leftArrow'))) {
        this.tmpQuaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), 0.05);
        this.turret.quaternion.multiply(this.tmpQuaternion);
      }
      if (this.inputHandler.keyDown('rightArrow') || (this.touchController && this.touchController.keyDown('rightArrow'))) {
        this.tmpQuaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), -0.05);
        this.turret.quaternion.multiply(this.tmpQuaternion);
      }
      if (this.inputHandler.keyDown('upArrow') || (this.touchController && this.touchController.keyDown('upArrow'))) {
        this.tmpVector3.setEulerFromQuaternion(this.gun.quaternion);
        if (this.tmpVector3.y >= 0) {
          this.tmpQuaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -0.05);
          this.gun.quaternion.multiply(this.tmpQuaternion);
        }
      }
      if (this.inputHandler.keyDown('downArrow') || (this.touchController && this.touchController.keyDown('downArrow'))) {
        this.tmpVector3.setEulerFromQuaternion(this.gun.quaternion);
        if (this.tmpVector3.y <= 0.9) {
          this.tmpQuaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), 0.05);
          this.gun.quaternion.multiply(this.tmpQuaternion);
        }
      }
      if (this.inputHandler.keyDown('A') || (this.touchController && this.touchController.keyDown('A'))) {
        this.tmpQuaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), 0.05);
        this.object.quaternion.multiply(this.tmpQuaternion);
      }
      if (this.inputHandler.keyDown('D') || (this.touchController && this.touchController.keyDown('D'))) {
        this.tmpQuaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -0.05);
        this.object.quaternion.multiply(this.tmpQuaternion);
      }
      if (this.inputHandler.keyDown('W') || (this.touchController && this.touchController.keyDown('W'))) {
        this.object.translateZ(0.010);
      }
      if (this.inputHandler.keyDown('S') || (this.touchController && this.touchController.keyDown('S'))) {
        this.object.translateZ(-0.010);
      }
    }
  }
}

Tank.prototype._initializeWithInstance = function(instance) {
  var that = this;

  this.instance = instance;

  // Temporarily remove object, we'll create a new Object3D to attach it to
  this.scene.threeData.remove(instance.threeData);

  this.object = new THREE.Object3D();
  this.object.useQuaternion = true;
  this.object.position = new THREE.Vector3(0,0,0);
  this.object.add(this.instance.threeData);

  if (this.camera) {
    this.object.add(this.camera);
  }

  this.instance.traverse(function(obj) {
    var name = obj.entityModel.get('name');

    if (name.indexOf('TankDestroyed') == 0) {
      that.tankDestroyed = obj.threeData;
    } else if (name.indexOf('Tank') == 0) {
      that.tank = obj.threeData;
    } else if (name.indexOf('Turret') == 0) {
      that.turret = obj.threeData;
    } else if (name.indexOf('Gun') == 0) {
      that.gun = obj.threeData;
    }
  });

  this.scene.threeData.add(this.object);

  this.setAsActive();

  this.ready = true;
}
