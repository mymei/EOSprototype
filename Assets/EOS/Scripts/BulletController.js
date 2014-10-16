#pragma strict

var speed : float = 10;
var lifeTime : float = 0.5;
var dist : float = 10000;
var fireEffects : GameObject[];
var explosion : GameObject[];

private var velocity : Vector3;
private var spawnTime : float = 0.0;
private var tr : Transform;
private var k : float = 0.1;

function Start () {
	for (var go in fireEffects) {
//		Network.isServer?Network.Instantiate(go, transform.position, transform.rotation, 0):Instantiate(go, transform.position, transform.rotation);
		Instantiate(go, transform.position, transform.rotation);
	}
}

private var collided = false;
function Update () {
	if (!collided) {
		var hits =
			Physics.RaycastAll(tr.position, velocity.normalized, velocity.magnitude * Time.deltaTime, ~LayerMask.GetMask("penetrable"));
		
		if (Time.time > spawnTime + lifeTime || dist < 0) {
			collided = true;
		} else {
			for (var hit : RaycastHit in hits) {
				var com = hit.collider.GetComponent("Armor") as Armor;
				if (com != null) {
					com.HandleHit();
				}	
				collided = true;
				for (var go in explosion) {
					EffectCache.Spawn(go, hit.point, transform.rotation, 1.0);
				}
			}
		}
		
		if (collided) {
			if (Network.isServer) {
				if (networkView)
					Network.RemoveRPCs(networkView.viewID);
				Network.Destroy(gameObject);
			} else {
				Destroy(gameObject);
			}
		} else {
			tr.position += velocity * Time.deltaTime;
			var hori = velocity;
			hori.y = 0;
			velocity += (Physics.gravity - hori * k) * Time.deltaTime;
			dist -= speed * Time.deltaTime;		
		}
	}
}

function CalcInitialVelocity(from:Vector3, to:Vector3) {
	var disp = to - from;
	
	if (disp.magnitude / speed < 0.1) 
		return disp.normalized * speed;
	
	var d_v = disp.y;
	disp.y = 0;
	var d_h = disp.magnitude;
	
	Debug.Log("distance" + d_v + ' ' + d_h);
	
	var v_h = speed;
	var v_v = 0;
	
	var t = 0.0;
	var newSpeed = 0.0;
	
	var iterLimit = 10;
	var iter = 0;
	do {	
		v_h = speed * Mathf.Cos(Mathf.Atan(v_v / v_h));
		t = Mathf.Log(1 - d_h * k / v_h) / -k;
		v_v = d_v / t + 0.5 * Physics.gravity.magnitude * t;
		newSpeed = Mathf.Sqrt(v_h * v_h + v_v * v_v);	
		iter ++;
		
		Debug.Log('iter' + iter + ' ' + v_h + ' ' + v_v + ' ' + newSpeed + ' ' + t);
	} while(Mathf.Abs(newSpeed - speed) > 1 && iter < iterLimit);
	
	return disp.normalized * v_h + Vector3.up * v_v;
}

function SetTarget(target:Vector3) {
	Debug.Log(target);
	velocity = CalcInitialVelocity(tr.position, target);
}

function OnEnable () {
	tr = transform;
	spawnTime = Time.time;
	velocity = tr.forward * speed;
//	tr.position += tr.forward * speed * 0.05;
	collided = false;
}