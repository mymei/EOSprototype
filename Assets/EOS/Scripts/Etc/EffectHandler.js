#pragma strict

private var ignited = false;

@RPC
function SetEffectActive(flag:boolean) {
	if (particleSystem != null) {
		if (!flag) {			
			particleSystem.Stop();	
			particleSystem.Clear();
			particleSystem.randomSeed = 1;
			particleSystem.time = 0;
		} else {
			if (MyNetwork.IsGOControlled(gameObject) || networkView.observed != this) {
				particleSystem.Play();
			} else {
				ignited = true;
			}
		}
	}
}

function Update() {

}

function OnSerializeNetworkView(stream:BitStream, info:NetworkMessageInfo) {
	var pos = transform.position;
	var rot = transform.rotation;
	stream.Serialize(pos);
	stream.Serialize(rot);
	if (stream.isReading) {
		transform.position = pos;
		transform.rotation = rot;
	}
	if (ignited) {
		ignited = false;
		particleSystem.Play();	
	}
}