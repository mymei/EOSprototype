#pragma strict

var turretList:Transform[];

private var magazineList:Component[];
private var gunnerEye:Transform;

function Start () {
	magazineList = transform.GetComponentsInChildren(Magazine);	
}

function Update () {
	for (var i = 0; i < magazineList.length; i ++) {
		if (Input.GetKey(KeyCode.Alpha1 + i)) {
			ChangeMagazine(magazineList[i] as Magazine);
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
	if (magazineList[0] != null) {
		ChangeMagazine(magazineList[0] as Magazine);
	}
}

function ChangeMagazine(magazine:Magazine) {
	if (magazine != null && gunnerEye != null) {
		for (var turret:Transform in turretList) {
			if (turret != null) {
				var turretController = turret.GetComponent(TurretController);
				if (magazine.bullet.CompareTag(turretController.weaponTag)) {
					ResetGunner();
					turretController.Reload(magazine);
					turret.SendMessage("SetEye", gunnerEye, SendMessageOptions.DontRequireReceiver);
					gunnerEye.SendMessage("SetTarget", turret, SendMessageOptions.DontRequireReceiver); 				
				}
			}
		}	
	}
}