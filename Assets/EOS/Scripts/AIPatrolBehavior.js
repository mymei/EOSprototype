#pragma strict

class AIPatrolBehavior extends AIBehavior {
	var Goals:Transform[];
	function Update() {
		if (MyNetwork.IsGOControlled(gameObject)) {

			var cmp = GetComponent(AIDriver) as AIDriver;
			if (cmp && cmp.IsIdle()) {
				for (var goal in Goals) {
					cmp.AddGoal(goal);
				}	
			}
		}
	}
}