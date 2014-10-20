#pragma strict

class ReactiveArmor extends Armor {
	var explosion : GameObject[];

	function Start () {

	}

	function Update () {

	}

	function HandleHit(tag:String, factor:float) {
		return false;
	}
	
	function AttenuateHit(tag:String):float {
		if (tag == "HE" || tag == "HEAT" || tag == "Missile" || tag == "RPG"){
			collider.enabled = false;
			for (var go in explosion) {
				GOCache.Spawn(go, transform.position, transform.rotation, 1.0);
			}
			return 0;
		}	
		return 1;
	}
}