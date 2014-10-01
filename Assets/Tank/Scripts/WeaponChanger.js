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

function ResetAllSafetySwitch() {
	for (var turret:Transform in turretList) {
		if (turret != null) {
			turret.GetComponent(TurretController).SetSafetySwitch(true);
		}
	}
}

function SetEye(eye:Transform) {
	gunnerEye = eye;
	for (var turret:Transform in turretList) {
		if (turret != null) {
			turret.SendMessage("SetEye", gunnerEye, SendMessageOptions.DontRequireReceiver);
		}
	}
	for (var i = 0; i < magazineList.length; i ++) {
		var magazine = magazineList[i] as Magazine;		
		for (var turret:Transform in turretList) {
			if (turret != null) {
				var turretController = turret.GetComponent(TurretController);
				if (turretController.GetMagazine() == null && magazine.bullet.CompareTag(turretController.weaponTag)) {
					turretController.Reload(magazine);
					if (i == 0) {									
						gunnerEye.SendMessage("SetTarget", turret, SendMessageOptions.DontRequireReceiver); 
						turretController.SetSafetySwitch(false);
					}
					break;
				}
			}
		}
	}
}

function ChangeMagazine(magazine:Magazine) {
	if (magazine != null && gunnerEye != null) {
		for (var turret:Transform in turretList) {
			if (turret != null) {
				var turretController = turret.GetComponent(TurretController);
				if (magazine.bullet.CompareTag(turretController.weaponTag)) {
					ResetAllSafetySwitch();
					turretController.SetSafetySwitch(false);
					gunnerEye.SendMessage("SetTarget", turret, SendMessageOptions.DontRequireReceiver); 
					break;				
				}
			}
		}	
	}
}