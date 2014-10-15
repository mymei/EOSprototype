#pragma strict

var ammo:int;
var bullet : GameObject;

private var ammoLeft : int;

private var chain:int = 0;
private var chainInterval:float = 0.0;
private var fireMuzzles:Transform[];
private var firePos:Vector3;
private var fireRot:Quaternion;
private var lastFireTime:float = 0.0;

function Start () {
	ammoLeft = ammo;
}

function Update () {
	ChainFire(false);
}

function GetAmmoLeft() {
	return ammoLeft;
}

function ChainFire(forced:boolean) {
	if (chain > 0) {
		if (forced || Time.time - lastFireTime > chainInterval) {
			InnerFire(fireMuzzles.Length > 0?fireMuzzles[chain % fireMuzzles.Length].position:firePos, fireRot);
			chain--;		
		}	
	}
}

function InnerFire(pos:Vector3, rot:Quaternion) {
	if (GetAmmoLeft() > 0) {
		var instance = Network.isServer?Network.Instantiate(bullet, pos, rot, 0):Instantiate(bullet, pos, rot);

		if (owner) {
			instance.SendMessage("SetOwner", owner, SendMessageOptions.DontRequireReceiver);
		}
		ammoLeft --;
		lastFireTime = Time.time;	
	}
}

function Fire(pos:Vector3, rot:Quaternion, _chain:int, _chainInterval:float, muzzles:Transform[]) {
	chain = Mathf.Max(0, _chain);
	chainInterval = Mathf.Max(0.0, _chainInterval);
	fireMuzzles = muzzles;
	firePos = pos;
	fireRot = rot;

	ChainFire(true);
}

private var owner : Transform;
function SetOwner(_owner:Transform) {
	owner = _owner;
}