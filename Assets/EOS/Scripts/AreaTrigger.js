#pragma strict

var OnetimeTrigger : boolean = true;
private var Listeners = new Array();
private var isTriggered : boolean = false;

function Start () {

}

function Update () {

}

function RegisterListener(listener:Transform) {
	Listeners.Push(listener);
}

function OnTriggerEnter(other:Collider) {
	if (!isTriggered) {
		isTriggered = OnetimeTrigger?true:false;
		for (var listener in Listeners) {
			(listener as Transform).SendMessage("HandleTriggerEvent", transform, SendMessageOptions.DontRequireReceiver);	
		}	
	}
}