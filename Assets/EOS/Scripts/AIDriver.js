#pragma strict

class AIDriver extends MonoBehaviour {

	var goals = new Array();
	var obstacles = new Array();
	
	var radiusForArrival = 5;

	protected var currentGoal = 0;
	protected var currentPathNode = 0;

	protected var mesh:NavMesh;
	protected var path: NavMeshPath;

	function Start () {
				
	}

	function ClearGoals() {
		goals.clear();
	}

	function AddGoal(goal:Transform) {
		goals.Push(goal);
	}

	function IsArrived(pos:Vector3) : boolean {
		var direction = pos - transform.position;
		direction.y = 0;
		return direction.magnitude < radiusForArrival;
	}
	
	function AddObstacle(obstacle:Transform) {
		obstacles.Push(obstacle);
	}
	
	function IsIdle() {
		return currentGoal == goals.length;	
	}
	
	private var localGoalPos:Vector3;
	private var currentDirection:Vector3;
	private var pathInvalidated = false;
	function Update () {
		if (!IsIdle()) {
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
			
			localGoalPos = GetLocalGoal();	
			currentDirection = localGoalPos - transform.position;
			currentDirection.y = 0;
				
			var tmpSeg = (rigidbody == null?transform.forward:rigidbody.velocity.normalized) * 20;
			var list = SubdivisionManager.Retrieve(transform.position);
			for (var tr:Transform in list) {
				var dist = GetDistanceFromObstacle(tr, transform.position, transform.position + tmpSeg, 1);
				if (dist != -1.0) {
					transform.BroadcastMessage("GetInput", [0.0, 0.0], SendMessageOptions.DontRequireReceiver);
					return;			
				}						
			}
			
			Drive(localGoalPos);
			
			if (IsArrived(localGoalPos)) {
				currentPathNode ++;
				if (currentPathNode == path.corners.Length) {
					currentGoal++;
					path.ClearCorners();
					
					if (currentGoal == goals.length) {
						currentGoal = 0;
						goals.Clear();
						transform.BroadcastMessage("GetInput", [0.0, 0.0], SendMessageOptions.DontRequireReceiver);
					}
				}
			} else {
				if (Vector3.Dot(transform.forward, currentDirection) > 0) {
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
	
	function Drive(goal:Vector3) {
	
	}
	
	function GetDistanceFromDisp(pos:Vector3, from:Vector3, to:Vector3) {
		var disp = pos - from;
		var dir = (to - from).normalized;
		return Vector3.Dot(disp, dir);
	}
	
	function GetDistanceFromPos(pos:Vector3, from:Vector3, to:Vector3) {
		var disp = pos - from;
		var dir = (to - from).normalized;
		var projectedDist = Vector3.Dot(disp, dir);
		var closestPos = from + dir * projectedDist;
		return (pos - closestPos).magnitude;	
	}
	
	function GetClosestPointOnObstacle(bounds:Bounds, from:Vector3, to:Vector3) {
		var disp = bounds.center - from;
		var dir = (to - from).normalized;
		var projectedDist = Vector3.Dot(disp, dir);
		var closestPos = from + dir * projectedDist;
		var normalVect = (bounds.center - closestPos).normalized;
		return bounds.center - (Mathf.Abs(Vector3.Dot(normalVect, bounds.extents)) * normalVect + Mathf.Abs(Vector3.Dot(dir, bounds.extents)) * dir);
	}
	
	function GetClosestDistFromObstacle(center:Vector3, radius:float, from:Vector3, to:Vector3) {
		var disp = center - from;
		var dir = (to - from).normalized;
		var projectedDist = Vector3.Dot(disp, dir);
		var closestPos = from + dir * projectedDist;
		
		var normalDist = (center- closestPos).magnitude;
		if (normalDist < radius) {
			return projectedDist - Mathf.Asin(normalDist/radius);					
		} else {
			return -1;		
		}
	}
	
	function GetDistanceFromObstacle(tr:Transform, from:Vector3, to:Vector3, radius:float) {
		from.y = 0;
		to.y = 0;
	
		var colliders = tr.GetComponentsInChildren(Collider);
		var minimum = (to - from).magnitude;
		var defaultMin = minimum;
		for (var i = 0; i < colliders.length; i ++) {
			if (colliders[i] as WheelCollider)
				continue;
			var tmpBounds = (colliders[i] as Collider).bounds;
			tmpBounds.center.y = 0;
			var dist = GetClosestDistFromObstacle(tmpBounds.center, radius + tmpBounds.extents.magnitude, from, to);
			if (dist > 0 && minimum > dist) {
				minimum = dist;			
			}
		}
		return minimum == defaultMin?-1:minimum;		
//		var pos = GetClosestPointOnObstacle(tr
//		var direction = (from - to).normalized;
//		for (var obj in tr.GetComponentsInChildren(Collider)) {
//			var collider = obj as Collider;
//		
//		}	
	}	
	
	function GetLocalGoal():Vector3 {
		return path.corners[currentPathNode];
	}
}