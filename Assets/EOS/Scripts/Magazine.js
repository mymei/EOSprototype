#pragma strict

var ammo:int;
var bullet : GameObject;

var magazineTag:String;

private var ammoLeft : int;

private var chain:int = 0;
private var chainInterval:float = 0.0;
private var fireMuzzles:Transform[];
private var firePos:Vector3;
private var fireRot:Quaternion;
private var lastFireTime:float = 0.0;
private var fireTarget:Vector3;

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
		var instance = MyNetwork.Instantiate(bullet, pos, rot, gameObject);
		if (instance) {
			instance.SendMessage("SetTarget", fireTarget, SendMessageOptions.DontRequireReceiver);
			if (owner)
				instance.SendMessage("SetOwner", owner, SendMessageOptions.DontRequireReceiver);
		}

		ammoLeft --;
		lastFireTime = Time.time;	
	}
}

function Fire(pos:Vector3, rot:Quaternion, target:Vector3, _chain:int, _chainInterval:float, muzzles:Transform[]) {
	chain = Mathf.Max(0, _chain);
	chainInterval = Mathf.Max(0.0, _chainInterval);
	fireMuzzles = muzzles;
	firePos = pos;
	fireRot = rot;
	fireTarget = target;

	ChainFire(true);
}

function CalcGunDirection(from:Vector3, to:Vector3) {
}

function OnSerializeNetworkView(stream:BitStream, info:NetworkMessageInfo) {
	stream.Serialize(ammoLeft);
}

private var owner : Transform;
function SetOwner(_owner:Transform) {
	owner = _owner;
}