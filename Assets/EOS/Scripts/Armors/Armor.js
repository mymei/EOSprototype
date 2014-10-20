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
	
	function HandleHit(tag:String, factor:float) {
		SendMessageUpwards("ApplyDamage", 1 * factor, SendMessageOptions.DontRequireReceiver);	
		return true;
	}
	
	function AttenuateHit(tag:String) {
		return 1.0;
	}
}
