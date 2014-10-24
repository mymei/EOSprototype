#pragma strict

var coverDensity:float = 1;
var range:float = 100;

function Start () {

}

function Update () {

}

function OnDrawGizmos() {
	Gizmos.color = Color.yellow;
	Gizmos.DrawWireCube(transform.position, transform.localScale);
}