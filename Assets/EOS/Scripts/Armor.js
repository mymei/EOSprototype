#pragma strict

class Armor extends MonoBehaviour {

	function Start () {

	}

	function Update () {

	}

	private var owner : Transform;
	function SetOwner(_owner:Transform) {
		owner = _owner;
	}

	function GetOwner() {
		return owner;
	}
	
	function HandleHit() {
		SendMessageUpwards("ApplyDamage", 1, SendMessageOptions.DontRequireReceiver);	
	}
}
