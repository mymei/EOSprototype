#pragma strict

var targetTexture:Texture;

private var gunnerEye:Transform;
private var hit:RaycastHit = new RaycastHit();
private var turretController:TurretController;

function Start () {
	turretController = GetComponent(TurretController);
}

function Update () {
	turretController.enabled = IsControllable();
	if (IsControllable()) {
		var goal = gunnerEye.position + (gunnerEye.forward * 500);
		if (Physics.Raycast(gunnerEye.position, gunnerEye.forward, hit, 500, ~gameObject.layer)) {
			goal = hit.point;			
		}
		turretController.AimControl(goal);	
		
		HandleInput();
	}
}

function SetEye(eye:Transform) {
	gunnerEye = eye;
}

function ResetEye() {
	gunnerEye = null;
}

function IsControllable():boolean {
	return gunnerEye != null && turretController != null;
}

function HandleInput() {
	if (IsControllable()) {
		if (Input.GetButton("Fire1")) {
			turretController.Fire();
		} else if (Input.GetButton("Fire2")) {
			if (hit.collider != null) {
				turretController.lockOn(hit.collider.transform);
			}
		}	
	}
}

private var screenRect = new Rect(0, 0, Screen.width, Screen.height);
function OnGUI() {
	if (IsControllable()) {
		var screenPos = gunnerEye.camera.WorldToScreenPoint(turretController.GetTargetPos());
		GUI.Box(Rect(screenPos.x - 32, (Screen.height - screenPos.y) - 32, 64, 64), targetTexture);
		if (!screenRect.Contains(screenPos)) {
			turretController.lockOn(null);
		}
	}
}