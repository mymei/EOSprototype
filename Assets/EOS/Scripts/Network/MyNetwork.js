#pragma strict

function Start () {

}

function Update () {

}

static function IsConnected() {
	return Network.peerType != NetworkPeerType.Disconnected;
}

static function IsGOControlled(go:GameObject) {
	return !IsConnected() || !go.networkView || go.networkView.isMine;
}

static function Instantiate(go:GameObject, pos:Vector3, rot:Quaternion, owner:GameObject):GameObject {
	if (!IsConnected() || !go.networkView) {
		return Instantiate(go, pos, rot);	
	} else if (!owner || !owner.networkView || owner.networkView.isMine) {
		return Network.Instantiate(go, pos, rot, 0);	
	}
	return null;
}

static function Destroy(go:GameObject) {
	if (!IsConnected() || !go.networkView) {
		MonoBehaviour.Destroy(go);
	} else {
		if (go.networkView.isMine) {
			Network.RemoveRPCs(go.networkView.viewID);
			Network.Destroy(go);			
		}
	}
}