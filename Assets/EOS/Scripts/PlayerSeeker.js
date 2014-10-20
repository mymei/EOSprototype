#pragma strict

class PlayerSeeker extends MonoBehaviour {

	protected var seekerEye:Transform;
	var viewRange:float = 1000;
	
	function SetEye(eye:Transform) {
		seekerEye = eye;
	}
	
	function ResetEye() {
		seekerEye = null;
	}
	
	protected var goal:Vector3;
	protected var hitCollider:Collider;
	private var hit:RaycastHit = new RaycastHit();
	function Update () {
		if (IsControllable()) {
			goal = seekerEye.position + (seekerEye.forward * viewRange);
			hitCollider = null;
			if (Physics.Raycast(seekerEye.position, seekerEye.forward, hit, viewRange, ~(LayerMask.GetMask("Invisible")))) {
				if (hit.collider.transform.root.GetComponentInChildren(PlayerHandler) != this) {
					goal = hit.point;
					hitCollider = hit.collider;
				} 
			}
		}
	}
	
	function IsControllable() {
		return seekerEye != null;
	}
	
	function Goal() {
		return goal;
	}

}