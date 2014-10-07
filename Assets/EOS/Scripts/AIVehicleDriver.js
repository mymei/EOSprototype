#pragma strict

class AIVehicleDriver extends MonoBehaviour {

	var goals = new Array();
	
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

	function IsArrived(direction:Vector3) : boolean {
		return direction.magnitude < radiusForArrival;
	}
}