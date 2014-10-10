#pragma strict

class PlayerVehicleDriver extends PlayerHandler {

	function Start () {
	}

	function Update () {
		transform.BroadcastMessage("GetInput", [Input.GetAxis("Vertical"), Input.GetAxis("Horizontal")], SendMessageOptions.DontRequireReceiver);
	}
}
