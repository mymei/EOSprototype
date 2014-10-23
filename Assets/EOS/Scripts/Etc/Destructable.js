#pragma strict

var destructionImpact:float = 10000.0f;
var lifetime:float = 5.0f;
var debris:GameObject;
var ignoreWeaponTags:String[];

function Start () {

}

function Update () {

}

function SmashBy(weaponTag:String) {
	for (var _tag in ignoreWeaponTags) {
		if (_tag == weaponTag) {
			return;		
		}
	}
	Smash();
}

function Smash() {
	if (debris != null) {
		GOCache.Spawn(debris, transform.position, transform.rotation, lifetime);
	}

	if (!MyNetwork.IsConnected() || !networkView) {
		DestroySelf();
	} else {
		networkView.RPC("DestroySelf", RPCMode.AllBuffered);	
	}
}

@RPC
function DestroySelf()
{
	var comps = GetComponentsInChildren(Collider);
	for (var comp in comps) {
		var col = comp as Collider;
		col.enabled = false;
	}
	
	comps = GetComponentsInChildren(Renderer);
	for (var comp in comps) {
		var ren = comp as Renderer;
		ren.enabled = false;
	}
	
}

function OnCollisionEnter(collision:Collision) {
	if (collision.rigidbody != null && collision.rigidbody.mass * collision.relativeVelocity.magnitude > destructionImpact) {
		Smash();	
	}
}

function OnTriggerEnter(other:Collider) {
	if (!other as CharacterController) {
		Smash();
	}	
}