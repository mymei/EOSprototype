#pragma strict

var goals:Transform[];

private var mesh:NavMesh;
private var currentGoal:int;
private var currentPathNode:int;
private var path: NavMeshPath;

function Start () {
	currentGoal = 0;
}

var p1 = 1.0;
var d1 = 1.0;
var p2 = 1.0;
var d2 = 1.0;

var radiusForArrival = 5;

private var history1:float;
private var history2:float;

function Awake() {
}

private var pathInvalidated = false;
function Update () {
	if (currentGoal < goals.Length) {
		if (path == null) {
			path = new NavMeshPath();
		}
	
		if (path.corners.Length == 0) {
			mesh.CalculatePath(transform.position, goals[currentGoal].position, -1, path);
			if (path.status == NavMeshPathStatus.PathInvalid || path.corners.Length < 2) {
				currentGoal = goals.Length;
				return;
			} else {
				currentPathNode = 1;
			}
		}	
	
		var direction = path.corners[currentPathNode] - transform.position;
		direction.y = 0;
		var ref1 = Vector3.Dot(transform.forward, direction);
		var ref2 = Vector3.Dot(transform.up, Vector3.Cross(transform.forward, direction)); 
		
		var control1 = Mathf.Max(0, Mathf.Min(1, p1 * ref1 + d1 * (ref1 - history1)));
		var control2 = Mathf.Max(-1, Mathf.Min(1, p2 * ref2 + d2 * (ref2 - history2)));
		
		if (Mathf.Abs(control2) > 0.1 && control1 < 1) {
			control1 = 1;
		}
		
		transform.BroadcastMessage("GetInput", [control1, control2], SendMessageOptions.DontRequireReceiver);
		history1 = ref1;
		history2 = ref2;
		
		if (IsArrived(direction)) {
			currentPathNode ++;
			if (currentPathNode == path.corners.Length) {
				currentGoal++;
				path.ClearCorners();
				
				if (currentGoal == goals.Length) {
					currentGoal = 0;
//					transform.BroadcastMessage("GetInput", [0.0, 0.0], SendMessageOptions.DontRequireReceiver);
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

function IsArrived(direction:Vector3) : boolean {
	return direction.magnitude < radiusForArrival;
}