#pragma strict

class AIRoutingBehavior extends AITriggerBehavior {
	var Goals:Transform[];
	function HandleTriggerEvent(trigger:Transform) {
		if (MyNetwork.IsGOControlled(gameObject)) {
			if (trigger == ListeningTrigger) {
				for (var goal in Goals) {
					transform.SendMessage("AddGoal", goal, SendMessageOptions.DontRequireReceiver);
				}
			}
		}
	}
}