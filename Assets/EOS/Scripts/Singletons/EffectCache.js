#pragma strict

static var effectCache:EffectCache;

var cache:Hashtable = new Hashtable();
var activeEffectInfos = new Array();

class ActiveEffectInfo {
	var endTime:float;
	var effect:GameObject;
}

function Awake () {
	effectCache = this;
}

function Start () {

}

function Update () {

	for (var i = 0; i < activeEffectInfos.length; i++) {
		var info = activeEffectInfos[i] as ActiveEffectInfo;
		if (info.endTime != 0 && info.endTime < Time.time) {
			SetEffectActive(info.effect, false);
			activeEffectInfos.RemoveAt(i);
			break;		
		}	
	}	
}

function SetEffectActive(effect:GameObject, flag:boolean) {
	if (Network.isServer) {
		if (effect.networkView) {
			effect.networkView.RPC("SetEffectActive", RPCMode.All, flag);
		}
	} else {
		if (effect.GetComponent(EffectHandler)) {
			effect.SendMessage("SetEffectActive", flag, SendMessageOptions.DontRequireReceiver);		
		} else {
			if (effect.particleSystem != null) {
				if (!flag) {			
					effect.particleSystem.Stop();	
					effect.particleSystem.Clear();
					effect.particleSystem.randomSeed = 1;
					effect.particleSystem.time = 0;
				} else {
					effect.particleSystem.Play();
				}
			}		
		}
	}

}

static function Spawn(prefab:GameObject, pos:Vector3, rot:Quaternion, lifeTime:float):GameObject {
	if (Network.isClient)
		return;
		
	var tmp:GameObject;
	if (effectCache.cache.ContainsKey(prefab)) {		
		for (var instance in effectCache.cache[prefab] as Array) {
			tmp = instance as GameObject;
			if (!tmp.particleSystem.isPlaying) {
				tmp.transform.position = pos;
				tmp.transform.rotation = rot;
				effectCache.SetEffectActive(tmp, true);
				break;
			}
			tmp = null;
		}
	} else {
		effectCache.cache[prefab] = new Array();
	}	
	if (tmp == null) {
		if (Network.isServer) {
			tmp = Network.Instantiate(prefab, pos, rot, 0);
		} else {
			tmp = Instantiate(prefab, pos, rot);
		
		}
		var array = effectCache.cache[prefab] as Array;
		array.Push(tmp);
	}
	var info = new ActiveEffectInfo();
	info.endTime = lifeTime <= 0?0:Time.time + lifeTime;
	info.effect = tmp;
	effectCache.activeEffectInfos.Push(info);
	
	return tmp;
}

static function Destroy(instance:GameObject) {
	if (Network.isClient)
		return;
	for (var i = 0; i < effectCache.activeEffectInfos.length; i++) {
		var info = effectCache.activeEffectInfos[i] as ActiveEffectInfo;
		if (info.effect == instance) {
			effectCache.SetEffectActive(info.effect, false);
			effectCache.activeEffectInfos.RemoveAt(i);
			break;		
		}	
	}	
}