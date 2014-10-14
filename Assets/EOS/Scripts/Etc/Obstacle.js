#pragma strict

private var started:boolean;

function Start () {
	SubdivisionManager.Register(transform);
	started = true;
}

function Update () {

}

function OnEnable() {
	if (started) {
		SubdivisionManager.Register(transform);
	}
}

function OnDisable() {
	SubdivisionManager.Unregister(transform);
}                                                                   