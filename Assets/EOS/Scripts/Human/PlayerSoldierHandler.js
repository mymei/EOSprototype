#pragma strict

class PlayerSoldierHandler extends PlayerHandler {

	private var soldierController:SoldierController;

	function Start () {
		soldierController = transform.GetComponentInChildren(SoldierController);
	}

	function Update () {
		if (Input.GetButtonDown("Fire1")) {
			soldierController.SetFire(true);
		} else if (Input.GetButtonUp("Fire1")) {
			soldierController.SetFire(false);
		}
		
		soldierController.GetInput([Input.GetAxis("Vertical"), Input.GetAxis("Horizontal")]);
	}
}