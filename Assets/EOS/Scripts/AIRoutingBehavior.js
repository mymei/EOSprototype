#pragma strict

var Goals:Transform[];

class AIRoutingBehavior extends AIBehavior {
	function HandleTriggerEvent(trigger:Transform) {
		if (trigger == ListeningTrigger) {
			for (var goal in Goals) {
				transform.SendMessage("AddGoal", goal, SendMessageOptions.DontRequireReceiver);
			}
		}
	}
}