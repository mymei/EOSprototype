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
		
			if (!MyNetwork.IsConnected() || !networkView) {
				DisableArmor();
			} else {
				networkView.RPC("DisableArmor", RPCMode.AllBuffered);			
			}
			for (var go in explosion) {
				GOCache.Spawn(go, transform.position, transform.rotation, 1.0);
			}
			return 0;
		}	
		return 1;
	}
	
	@RPC	
	function DisableArmor() {
		collider.enabled = false;
	}
}