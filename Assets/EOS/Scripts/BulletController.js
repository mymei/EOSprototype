#pragma strict

var speed : float = 10;
var lifeTime : float = 0.5;
var dist : float = 10000;
var explosion : GameObject;

private var spawnTime : float = 0.0;
private var tr : Transform;

function Start () {

}

private var collided = false;
function Update () {
	if (!collided) {
		var hits =
			Physics.RaycastAll(tr.position, tr.forward, speed * Time.deltaTime);
		
		if (Time.time > spawnTime + lifeTime || dist < 0) {
			collided = true;
		} else {
			for (var hit : RaycastHit in hits) {
				if (1 << hit.collider.gameObject.layer == LayerMask.GetMask("vehicle")) {
					var com = hit.collider.GetComponent("Armor") as Armor;
					if (com != null) {
					} else {
						continue;
					}		
				}
				collided = true;
				if (explosion != null) {
					EffectCache.Spawn(explosion, transform.position, transform.rotation, 1.0);
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
			tr.position += tr.forward * speed * Time.deltaTime;
			dist -= speed * Time.deltaTime;		
		}
	}
}

function OnEnable () {
	tr = transform;
	spawnTime = Time.time;
//	tr.position += tr.forward * speed * 0.05;
	collided = false;
}