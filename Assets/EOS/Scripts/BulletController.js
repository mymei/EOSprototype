#pragma strict

var speed : float = 10;
var lifeTime : float = 0.5;
var dist : float = 10000;
var fireEffects : GameObject[];
var explosion : GameObject[];
var simple : boolean = false;

var k : float = 0.1;

private var velocity : Vector3;
private var spawnTime : float = 0.0;
private var tr : Transform;

function Start () {
	for (var go in fireEffects) {
		MyNetwork.Instantiate(go, transform.position, transform.rotation, gameObject);
	}
}

private var collided = false;
function Update () {
	if (!collided) {

		if (MyNetwork.IsGOControlled(gameObject)) {
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
						GOCache.Spawn(go, hit.point, transform.rotation, 1.0);
					}
				}
			}
		}
			
		if (collided) {
			MyNetwork.Destroy(gameObject);
		} else {
			tr.position += velocity * Time.deltaTime;
			if (!simple) {
				var hori = velocity;
				hori.y = 0;
				velocity += (Physics.gravity - hori * k) * Time.deltaTime;
			}
			dist -= speed * Time.deltaTime;		
		}
	}
}

function CalcInitialVelocity(from:Vector3, to:Vector3) {
	var disp = to - from;
	
	if (simple || disp.magnitude / speed < 0.1) 
		return disp.normalized * speed;
	
	var d_v = disp.y;
	disp.y = 0;
	var d_h = disp.magnitude;
	
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
	} while(Mathf.Abs(newSpeed - speed) > 1 && iter < iterLimit);
	
	return disp.normalized * v_h + Vector3.up * v_v;
}

function SetTarget(target:Vector3) {
	if (!MyNetwork.IsConnected() || !networkView) {
		SetVelocity(CalcInitialVelocity(tr.position, target));	
	} else if (networkView.isMine) {
		networkView.RPC("SetVelocity", RPCMode.All, CalcInitialVelocity(tr.position, target));	
	}
}

@RPC
function SetVelocity(vel:Vector3) {
	velocity = vel;
}

function OnEnable () {
	tr = transform;
	spawnTime = Time.time;
	velocity = tr.forward * speed;
}