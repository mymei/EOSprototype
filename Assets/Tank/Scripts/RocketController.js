#pragma strict

var acceleration : float = 10;
var lifeTime : float = 0.5;
var dist : float = 10000;
var gravity : float = 9.8;

private var spawnTime : float = 0.0;
private var tr : Transform;
private var velocity : Vector3;
private var accel_vector : Vector3;

function Start () {	
}

function GetAcceleration():Vector3 {
	return tr.forward * acceleration - gravity * Vector3.up;
}

function Update () {
	    
	var newDir = Vector3.RotateTowards(tr.forward, accel_vector.normalized, 5 * Time.deltaTime, 0.0);
	tr.rotation = Quaternion.LookRotation(newDir);

	velocity += GetAcceleration() * Time.deltaTime;
	tr.position += velocity * Time.deltaTime;
	dist -= velocity.magnitude * Time.deltaTime;
	
	var collided : boolean = false;
	var hits : Collider[] = Physics.OverlapSphere (tr.position, 1, -1);
	for (var c : Collider in hits) {
		// Don't collide with triggers
		if (c.isTrigger)
			continue;
		if (1 << c.gameObject.layer == LayerMask.GetMask("vehicle")) {
			var com = c.GetComponent("Armor") as Armor;
			if (com != null && com.GetOwner() != owner) {
			} else {
				continue;
			}		
		}
		collided = true;
	}
	if (Time.time > spawnTime + lifeTime || dist < 0) {
		collided = true;
	}
	
	if (collided) {
		Destroy(gameObject);
	}
}

function OnEnable () {
	tr = transform;
	var tmp = tr.forward;
	var angle = Mathf.Asin(tmp.y / tmp.magnitude);
	var tan = Mathf.Tan(angle);
	var tan_sqr = Mathf.Pow(tan, 2);
	var l = (Mathf.Sqrt(gravity * gravity * tan_sqr - (gravity * gravity - acceleration * acceleration) * (1 + tan_sqr)) - gravity * tan) / (1 + tan_sqr);
	accel_vector = tmp.normalized * Mathf.Sqrt(l * l * (1 + tan_sqr)) + 10 * Vector3.up; 

	spawnTime = Time.time;
}

private var owner : Transform;
function SetOwner(_owner:Transform) {
	owner = _owner;
}