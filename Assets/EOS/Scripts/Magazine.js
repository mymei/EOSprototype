#pragma strict

var ammo:int;
var bullet : GameObject;

private var ammoLeft : int;

function Start () {
	ammoLeft = ammo;
}

function Update () {

}

function GetAmmoLeft() {
	return ammoLeft;
}

function Fire(pos:Vector3, rot:Quaternion) {
	var instance = Instantiate(bullet, pos, rot);
	instance.SendMessage("SetOwner", owner, SendMessageOptions.DontRequireReceiver);
	ammoLeft --;
}

private var owner : Transform;
function SetOwner(_owner:Transform) {
	owner = _owner;
}