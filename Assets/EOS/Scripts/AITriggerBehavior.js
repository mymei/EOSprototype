#pragma strict

class AITriggerBehavior extends MonoBehaviour {
	var ListeningTrigger : Transform;
	
	function Awake () {
		if (ListeningTrigger != null) {
			ListeningTrigger.SendMessage("RegisterListener", transform, SendMessageOptions.DontRequireReceiver);	
		}
	}

	function Start () {
		
	}

	function Update () {

	}

	function HandleTriggerEvent(trigger:Transform) {
		if (MyNetwork.IsGOControlled(gameObject)) {
			if (trigger == ListeningTrigger) {
				Debug.Log("Triggered");
			}
		}
	}
}