#pragma strict

class AITankDriver extends AIDriver {

	var p1 = 1.0;
	var d1 = 1.0;
	var p2 = 1.0;
	var d2 = 1.0;

	private var history1:float;
	private var history2:float;

	function Drive(goal:Vector3) {
		
		var direction = goal - transform.position;
		var ref1 = Vector3.Dot(transform.forward, direction);
		var ref2 = Vector3.Dot(transform.up, Vector3.Cross((ref1 > 0?1:-1)*transform.forward, direction)); 
		
		var control1 = Mathf.Max(-1, Mathf.Min(1, p1 * ref1 + d1 * (ref1 - history1)));
		var control2 = Mathf.Max(-1, Mathf.Min(1, p2 * ref2 + d2 * (ref2 - history2)));
		
		transform.BroadcastMessage("GetInput", [control1, control2], SendMessageOptions.DontRequireReceiver);
		history1 = ref1;
		history2 = ref2;			
	}
}