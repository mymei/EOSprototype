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

function IsControllable():boolean {
	return gunnerEye != null && turretController != null;
}

function HandleInput() {
	if (IsControllable() && turretController.IsSafetySwitchOff()) {
		if (Input.GetButtonDown("Fire1")) {
			turretController.Fire();
		} else if (Input.GetButtonDown("Fire2")) {
			if (hit.collider != null && 1 << hit.collider.gameObject.layer == LayerMask.GetMask("vehicle")) {
				turretController.lockOn(hit.collider.transform);
				gunnerEye.SendMessage("SetAim", hit.collider.transform, SendMessageOptions.DontRequireReceiver);
			} else {
				gunnerEye.SendMessage("SetAim", gunnerEye, SendMessageOptions.DontRequireReceiver);
				turretController.lockOn(null);
			}
		}	
		
		turretController.InputOffset(Input.GetAxis("Mouse X"), -Input.GetAxis("Mouse Y"));
	}
}

private var screenRect = new Rect(0, 0, Screen.width, Screen.height);
function OnGUI() {
	if (IsControllable() && turretController.IsSafetySwitchOff()) {
		var screenPos = gunnerEye.camera.WorldToScreenPoint(turretController.GetTargetPos());
		if (screenPos.z > 0) {
			GUI.DrawTexture(Rect(screenPos.x - 32, (Screen.height - screenPos.y) - 32, 64, 64), targetTexture);
		}
//		if (!screenRect.Contains(screenPos)) {
//			turretController.lockOn(null);
//		}
	}
}