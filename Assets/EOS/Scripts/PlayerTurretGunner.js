﻿#pragma strict

var targetTexture:Texture;

private var gunnerEye:Transform;
private var hit:RaycastHit = new RaycastHit();
private var turretController:TurretController;

function Start () {
	turretController = GetComponent(TurretController);
}

function Update () {
	if (IsControllable()) {
		var goal = gunnerEye.position + (gunnerEye.forward * 500);
		if (Physics.Raycast(gunnerEye.position, gunnerEye.forward, hit, 500)) {
			if (hit.collider.transform.root.GetComponentInChildren(PlayerTurretGunner) != this) {
				goal = hit.point;			
			}
		}
		
		if (networkView && networkView.isMine) {
			networkView.RPC("AimControl", RPCMode.All, goal);
		} else {
			turretController.AimControl(goal);	
		}
		
		HandleInput();
	}
}

function SetEye(eye:Transform) {
	gunnerEye = eye;
}

function IsControllable():boolean {
	return gunnerEye != null && turretController != null && (Network.peerType == NetworkPeerType.Disconnected || !networkView || networkView.isMine);
}

function HandleInput() {
	if (IsControllable() && turretController.IsSafetySwitchOff()) {
		if (Input.GetButtonDown("Fire1")) {
			turretController.Fire();
		} else if (Input.GetButtonDown("Fire2")) {
			if (hit.collider != null && 1 << hit.collider.gameObject.layer == LayerMask.GetMask("vehicle") && hit.collider.transform.root.GetComponentInChildren(PlayerTurretGunner) != this) {
				var tmp = turretController.lockOn(hit.collider.transform);
				gunnerEye.SendMessage("SetAim", tmp == null?gunnerEye:tmp, SendMessageOptions.DontRequireReceiver);
			} else {
				turretController.lockOn(null);
				gunnerEye.SendMessage("SetAim", gunnerEye, SendMessageOptions.DontRequireReceiver);
			}
		}	
		
		turretController.InputOffset(Input.GetAxis("Mouse X"), -Input.GetAxis("Mouse Y"));
	}
}

private var screenRect = new Rect(0, 0, Screen.width, Screen.height);
function OnGUI() {
	if (IsControllable() && turretController.IsSafetySwitchOff() && targetTexture) {
		var screenPos = gunnerEye.camera.WorldToScreenPoint(turretController.GetTargetPos());
		if (screenPos.z > 0) {
			GUI.DrawTexture(Rect(screenPos.x - 32, (Screen.height - screenPos.y) - 32, 64, 64), targetTexture);
		}
		turretController.DrawHUD();
//		if (!screenRect.Contains(screenPos)) {
//			turretController.lockOn(null);
//		}
	}
}