#pragma strict

class PlayerHelicopterDriver extends PlayerHandler {

	function Start () {

	}

	function Update () {
		transform.BroadcastMessage("GetInput", [Input.GetAxis("heli throttle"), Input.GetAxis("Vertical"), Input.GetAxis("Horizontal")], SendMessageOptions.DontRequireReceiver);
	}
}