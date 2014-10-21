#pragma strict

class PlayerVehicleDriver extends PlayerHandler {

	function Start () {
	}

	function Update () {
		if (MyNetwork.IsGOControlled(gameObject)) {
			transform.BroadcastMessage("GetInput", [Input.GetAxis("Vertical"), Input.GetAxis("Horizontal")], SendMessageOptions.DontRequireReceiver);
		}
	}
}
