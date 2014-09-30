#pragma strict

function Start () {

}

function Update () {

}

private var owner : Transform;
function SetOwner(_owner:Transform) {
	owner = _owner;
}

function GetOwner() {
	return owner;
}