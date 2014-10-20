#pragma strict

class RocketController extends SlugBase {

	var acceleration : float = 10;
	var lifeTime : float = 0.5;
	var dist : float = 10000;

	private var destroyed = false;
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
		return tr.forward * acceleration + Physics.gravity;
	}

	function Update () {
	
		if (!collided) {
		
			var formerPos = tr.position;
			
			if (MyNetwork.IsGOControlled(gameObject)) {
			
				if (Time.time > spawnTime + lifeTime || dist < 0) {
					collided = true;
				} else {
					var hits =
					Physics.CapsuleCastAll(formerPos - rocketLength * tr.forward, formerPos + rocketLength * tr.forward, rocketRadius, velocity.normalized, velocity.magnitude * Time.deltaTime);
					HandleHit(hits);
				}
			}
				
			if (collided) {
				MyNetwork.Destroy(gameObject);
			} else {
				var newDir = Vector3.RotateTowards(tr.forward, accel_vector.normalized, 5 * Time.deltaTime, 0.0);
				tr.rotation = Quaternion.LookRotation(newDir);				

				velocity += GetAcceleration() * Time.deltaTime;
				tr.position += velocity * Time.deltaTime;
				dist -= velocity.magnitude * Time.deltaTime;	
			}
		}
	}

	function OnEnable () {
		tr = transform;
		var tmp = tr.forward;
		var angle = Mathf.Asin(tmp.y / tmp.magnitude);
		var tan = Mathf.Tan(angle);
		var tan_sqr = Mathf.Pow(tan, 2);
		var gra = Physics.gravity.magnitude;
		var l = (Mathf.Sqrt(gra * gra * tan_sqr - (gra * gra - acceleration * acceleration) * (1 + tan_sqr)) - gra * tan) / (1 + tan_sqr);
		accel_vector = tmp.normalized * Mathf.Sqrt(l * l * (1 + tan_sqr)) + 10 * Vector3.up; 

		spawnTime = Time.time;
	}

	private var owner : Transform;
	function SetOwner(_owner:Transform) {
		owner = _owner;
	}
}