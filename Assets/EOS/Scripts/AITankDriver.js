#pragma strict

class AITankDriver extends AIVehicleDriver {

	var p1 = 1.0;
	var d1 = 1.0;
	var p2 = 1.0;
	var d2 = 1.0;

	private var history1:float;
	private var history2:float;

	private var pathInvalidated = false;

	function Update () {
		if (currentGoal < goals.length) {
			if (path == null) {
				path = new NavMeshPath();
			}
			
			if (path.corners.Length == 0) {
				mesh.CalculatePath(transform.position, (goals[currentGoal] as Transform).position, -1, path);
				if (path.status == NavMeshPathStatus.PathInvalid || path.corners.Length < 2) {
					currentGoal = goals.length;
					return;
				} else {
					currentPathNode = 1;
				}
			}	
		
			var direction = path.corners[currentPathNode] - transform.position;
			var ref1 = Vector3.Dot(transform.forward, direction);
			var ref2 = Vector3.Dot(transform.up, Vector3.Cross((ref1 > 0?1:-1)*transform.forward, direction)); 
			
			var control1 = Mathf.Max(-1, Mathf.Min(1, p1 * ref1 + d1 * (ref1 - history1)));
			var control2 = Mathf.Max(-1, Mathf.Min(1, p2 * ref2 + d2 * (ref2 - history2)));
			
			transform.BroadcastMessage("GetInput", [control1, control2], SendMessageOptions.DontRequireReceiver);
			history1 = ref1;
			history2 = ref2;
			
			if (IsArrived(direction)) {
				currentPathNode ++;
				if (currentPathNode == path.corners.Length) {
					currentGoal++;
					path.ClearCorners();
					
					if (currentGoal == goals.length) {
	//					currentGoal = 0;
						transform.BroadcastMessage("GetInput", [0, 0], SendMessageOptions.DontRequireReceiver);
					}
				}
			} else {						
				if (ref1 > 0) {
					if (pathInvalidated) {
						pathInvalidated = false;
						path.ClearCorners();
					}
				} else {
					pathInvalidated = true;
				}
			}
		}
	}
}