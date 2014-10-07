#pragma strict

//var turretList:Transform[];

private var turretList;
private var magazineList:Component[];
private var gunnerEye:Transform;

function Start () {
	magazineList = transform.GetComponentsInChildren(Magazine);
	turretList = transform.GetComponentsInChildren(TurretController);

	for (var i = 0; i < magazineList.length; i ++) {
		var magazine = magazineList[i] as Magazine;		
		for (var cmp in turretList) {
			var turretController = cmp as TurretController;
			if (turretController.GetMagazine() == null && magazine.bullet.CompareTag(turretController.weaponTag)) {
				turretController.Reload(magazine);
				break;
			}
		}
	}
	if (magazineList != null && magazineList.Length > 0) {
		ChangeMagazine(magazineList[0] as Magazine);	
	}
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
	for (var cmp in turretList) {
		var turretController = cmp as TurretController;
		turretController.SetSafetySwitch(true);
		turretController.lockOn(null);
		gunnerEye.SendMessage("SetAim", gunnerEye, SendMessageOptions.DontRequireReceiver);
	}
}

function SetEye(eye:Transform) {
	gunnerEye = eye;
	for (var cmp in turretList) {
		var turretController = cmp as TurretController;
		turretController.transform.SendMessage("SetEye", gunnerEye, SendMessageOptions.DontRequireReceiver);
	}
	if (magazineList != null && magazineList.Length > 0) {
		ChangeMagazine(magazineList[0] as Magazine);	
	}
}

function ChangeMagazine(magazine:Magazine) {
	if (magazine != null && gunnerEye != null) {
		for (var cmp in turretList) {
			var turretController = cmp as TurretController;
			if (magazine.bullet.CompareTag(turretController.weaponTag)) {
				ResetAllSafetySwitch();
				turretController.SetSafetySwitch(false);
				gunnerEye.SendMessage("SetTarget", turretController.transform, SendMessageOptions.DontRequireReceiver); 
				break;				
			}
		}	
	}
}