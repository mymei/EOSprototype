#pragma strict

class VehicleController extends MonoBehaviour {

	var HP:int = 1;
	var explosion:GameObject[];

	function Start () {

	}

	function Update () {

	}
	
	function ApplyDamage(damage:int) {
		if (enabled) {
			HP -= damage;
			if (HP <= 0) {
				for (var go in explosion) {
					GOCache.Spawn(go, transform.position, transform.rotation, 1.0);
				}
				PaintBlack();	
				enabled = false;	
			}		
		}
	}
	
	function PaintBlack() {
		if (!MyNetwork.IsConnected() || !networkView) {
			_PaintBlack();	
		} else if (networkView.isMine) {
			networkView.RPC("_PaintBlack", RPCMode.AllBuffered);	
		}
	}

	@RPC
	function _PaintBlack() {
		for (var cmp in GetComponentsInChildren(Renderer)) {
			var renderer = cmp as Renderer;
			renderer.material.color = Color.black;
		}	
	}

}