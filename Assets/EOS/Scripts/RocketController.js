#pragma strict

var acceleration : float = 10;
var lifeTime : float = 0.5;
var dist : float = 10000;
var gravity : float = 9.8;
var explosion : GameObject;

private var spawnTime : float = 0.0;
private var tr : Transform;
var velocity : Vector3;
private var accel_vector : Vector3;

private var rocketRadius:float;
private var rocketLength:float;
function Start () {	
	var renderer = GetComponentInChildren(Renderer);
	if (renderer != null) {
		rocketRadius = renderer.bounds.size.y / 2;
		rocketLength = renderer.bounds.size.z / 2;		
	}
}

function GetAcceleration():Vector3 {
	return tr.forward * acceleration - gravity * Vector3.up;
}

function Update () {
	    
	var newDir = Vector3.RotateTowards(tr.forward, accel_vector.normalized, 5 * Time.deltaTime, 0.0);
	tr.rotation = Quaternion.LookRotation(newDir);
	
	var formerPos = tr.position;

	velocity += GetAcceleration() * Time.deltaTime;
	tr.position += velocity * Time.deltaTime;
	dist -= velocity.magnitude * Time.deltaTime;
	
	var collided : boolean = false;
	
	var hits =
		Physics.CapsuleCastAll(formerPos - rocketLength * tr.forward, formerPos + rocketLength * tr.forward, rocketRadius, velocity.normalized, velocity.magnitude * Time.deltaTime);
	
	for (var hit : RaycastHit in hits) {
		if (1 << hit.collider.gameObject.layer == LayerMask.GetMask("vehicle")) {
			var com = hit.collider.GetComponent("Armor") as Armor;
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
		if (explosion != null) {
			EffectCache.Spawn(explosion, transform.position, transform.rotation, 1.0);
		}
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