#pragma strict

class PlayerHelicopterDriver extends PlayerHandler {

	function Start () {

	}

	function Update () {
		if (MyNetwork.IsGOControlled(gameObject)) {
			transform.BroadcastMessage("GetInput", [Input.GetAxis("heli throttle"), Input.GetAxis("Vertical"), Input.GetAxis("Horizontal")], SendMessageOptions.DontRequireReceiver);
		}
	}
}