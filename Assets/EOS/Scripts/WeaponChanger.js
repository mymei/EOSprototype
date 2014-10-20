#pragma strict

//var turretList:Transform[];

private var turretList;
private var magazineList:Component[];

function Start () {
	magazineList = transform.GetComponentsInChildren(Magazine);
	turretList = transform.GetComponentsInChildren(TurretController);

	for (var i = 0; i < magazineList.length; i ++) {
		var magazine = magazineList[i] as Magazine;		
		for (var cmp in turretList) {
			var turretController = cmp as TurretController;
			if (turretController.GetMagazine() == null && magazine.magazineTag == turretController.magazineTag) {
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
	}
}

function ChangeMagazine(magazine:Magazine) {
	if (magazine != null) {
		for (var cmp in turretList) {
			var turretController = cmp as TurretController;
			if (magazine.magazineTag == turretController.magazineTag) {
				ResetAllSafetySwitch();
				turretController.SetSafetySwitch(false);
				turretController.Reload(magazine);
				break;				
			}
		}	
	}
}