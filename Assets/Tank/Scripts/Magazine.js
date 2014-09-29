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
	Instantiate(bullet, pos, rot);
	ammoLeft --;
}