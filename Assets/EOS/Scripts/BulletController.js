#pragma strict

var speed : float = 10;
var lifeTime : float = 0.5;
var dist : float = 10000;

private var spawnTime : float = 0.0;
private var tr : Transform;

function Start () {

}

function Update () {
	tr.position += tr.forward * speed * Time.deltaTime;
	dist -= speed * Time.deltaTime;
	if (Time.time > spawnTime + lifeTime || dist < 0) {
		Destroy(gameObject);
	}
}

function OnEnable () {
	tr = transform;
	spawnTime = Time.time;
	tr.position += tr.forward * speed * 0.05;
}