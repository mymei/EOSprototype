#pragma strict

class AIBehavior extends MonoBehaviour {
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
		if (trigger == ListeningTrigger) {
			Debug.Log("Triggered");
		}
	}
}
