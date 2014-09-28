#pragma strict

var turretList:Transform[];
var weaponList:GameObject[];

private var gunnerEye:Transform;

function Start () {
}

function Update () {
	for (var i = 0; i < weaponList.length; i ++) {
		if (Input.GetKey(KeyCode.Alpha1 + i)) {
			ChangeWeapon(weaponList[i]);
			break;		
		}
	}
}

function ResetGunner() {
	for (var turret:Transform in turretList) {
		if (turret != null) {
			turret.SendMessage("ResetEye", SendMessageOptions.DontRequireReceiver); 
		}
	}
}

function SetEye(eye:Transform) {
	gunnerEye = eye;
	if (weaponList[0] != null) {
		ChangeWeapon(weaponList[0]);
	}
}

function ChangeWeapon(weapon:GameObject) {
	if (weapon != null && gunnerEye != null) {
		for (var turret:Transform in turretList) {
			if (turret != null) {
				var turretController = turret.GetComponent(TurretController);
				if (weapon.CompareTag(turretController.weaponTag)) {
					ResetGunner();
					turretController.Reload(weapon);
					turret.SendMessage("SetEye", gunnerEye, SendMessageOptions.DontRequireReceiver);
					gunnerEye.SendMessage("SetTarget", turret, SendMessageOptions.DontRequireReceiver); 				
				}
			}
		}	
	}
}