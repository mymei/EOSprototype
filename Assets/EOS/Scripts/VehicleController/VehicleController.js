#pragma strict

class VehicleController extends MonoBehaviour {

	var HP:int = 1;
	var explosion:GameObject[];

	function Start () {

	}

	function Update () {

	}
	
	function ApplyDamage(damage:int) {
		if (!MyNetwork.IsConnected() || !networkView) {
			_ApplyDamage(damage);
		} else {
			networkView.RPC("_ApplyDamage", RPCMode.All, damage);
		}
	}
	
	@RPC	
	function _ApplyDamage(damage:int) {
		if (!MyNetwork.IsConnected() || !networkView || networkView.isMine) {		
			if (enabled) {
				HP -= damage;
				if (HP <= 0) {
					for (var go in explosion) {
						GOCache.Spawn(go, transform.position, transform.rotation, 1.0);
					}
					DestroySelf();	
				}		
			}
		}
	}
		
	function DestroySelf() {
		if (!MyNetwork.IsConnected() || !networkView) {
			_DestroySelf();	
		} else if (networkView.isMine) {
			networkView.RPC("_DestroySelf", RPCMode.AllBuffered);	
		}
	}

	@RPC
	function _DestroySelf() {
		enabled = false;
		for (var cmp in GetComponentsInChildren(TurretController)) {
			var tc = cmp as TurretController;
			tc.enabled = false;
		}
		for (var cmp in GetComponentsInChildren(Renderer)) {
			var renderer = cmp as Renderer;
			renderer.material.color.r = 0.2;
			renderer.material.color.g = 0.2;
			renderer.material.color.b = 0.2;
			renderer.material.color.a = 0.5;
		}	
	}

}