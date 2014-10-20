#pragma strict

class PlayerTurretGunner extends PlayerSeeker {
	var targetTexture:Texture;

	private var turretControllers:Array;
	
	function Start () {
		turretControllers = GetComponents(TurretController);
	}	
	
	function Update() {
		super.Update();
		if (IsControllable()) {
			for (var cmp in turretControllers) {
				(cmp as TurretController).AimControl(goal);
				HandleInput(cmp as TurretController);		
			}
		}
	}
	
	function IsControllable():boolean {
		return super.IsControllable() && turretControllers.length > 0 && MyNetwork.IsGOControlled(gameObject);
	}

	private var firing = false;
	function HandleInput(turretController:TurretController) {
		if (turretController.IsSafetySwitchOff()) {
			if (firing) {
				turretController.Fire();
			}

			if (Input.GetButtonDown("Fire1")) {
				firing = true;
			} else if (Input.GetButtonUp("Fire1")) {
				firing = false;			
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
		for (var cmp in turretControllers) {
			var turretController = cmp as TurretController;

			if (IsControllable() && turretController.IsSafetySwitchOff() && targetTexture) {
				var screenPos = seekerEye.camera.WorldToScreenPoint(turretController.GetTargetPos());
				if (screenPos.z > 0) {
					GUI.DrawTexture(Rect(screenPos.x - 32, (Screen.height - screenPos.y) - 32, 64, 64), targetTexture);
				}
				turretController.DrawHUD();
		//		if (!screenRect.Contains(screenPos)) {
		//			turretController.lockOn(null);
		//		}
				break;
			}
		}
	}

}