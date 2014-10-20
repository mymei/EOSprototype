#pragma strict

class PlayerTurretGunner extends PlayerSeeker {
	var targetTexture:Texture;

	private var turretController:TurretController;
	
	function Start () {
		turretController = GetComponent(TurretController);
	}	
	
	function Update() {
		super.Update();
		if (IsControllable()) {
			turretController.AimControl(goal);		
			HandleInput();		
		}
	}
	
	function IsControllable():boolean {
		return super.IsControllable() && turretController != null && MyNetwork.IsGOControlled(gameObject);
	}

	function HandleInput() {
		if (turretController.IsSafetySwitchOff()) {
			if (Input.GetButtonDown("Fire1")) {
				turretController.Fire();
			} else if (Input.GetButtonDown("Fire2")) {
				if (hitCollider != null && 1 << hitCollider.gameObject.layer == LayerMask.GetMask("vehicle") && hitCollider.transform.root.GetComponentInChildren(PlayerTurretGunner) != this) {
					var tmp = turretController.lockOn(hitCollider.transform);
					seekerEye.SendMessage("SetAim", tmp == null?seekerEye:tmp, SendMessageOptions.DontRequireReceiver);
				} else {
					turretController.lockOn(null);
					seekerEye.SendMessage("SetAim", seekerEye, SendMessageOptions.DontRequireReceiver);
				}
			}	
			
			turretController.InputOffset(Input.GetAxis("Mouse X"), -Input.GetAxis("Mouse Y"));
		}
	}

	private var screenRect = new Rect(0, 0, Screen.width, Screen.height);
	function OnGUI() {
		if (IsControllable() && turretController.IsSafetySwitchOff() && targetTexture) {
			var screenPos = seekerEye.camera.WorldToScreenPoint(turretController.GetTargetPos());
			if (screenPos.z > 0) {
				GUI.DrawTexture(Rect(screenPos.x - 32, (Screen.height - screenPos.y) - 32, 64, 64), targetTexture);
			}
			turretController.DrawHUD();
	//		if (!screenRect.Contains(screenPos)) {
	//			turretController.lockOn(null);
	//		}
		}
	}

}