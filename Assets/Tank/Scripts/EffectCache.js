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
		if (info.endTime < Time.time) {
			if (info.effect.particleSystem != null) {
				info.effect.particleSystem.Stop();			
				info.effect.particleSystem.Clear();
				info.effect.particleSystem.randomSeed = 1;
			}
			info.effect.SetActive(false);
			activeEffectInfos.RemoveAt(i);
			break;		
		}	
	}	
}

static function Spawn(prefab:GameObject, pos:Vector3, rot:Quaternion, lifeTime:float) {
	var tmp:GameObject;
	if (effectCache.cache.ContainsKey(prefab)) {		
		for (var instance in effectCache.cache[prefab] as Array) {
			tmp = instance as GameObject;
			if (!tmp.activeSelf) {
				tmp.SetActive(true);
				tmp.transform.position = pos;
				tmp.transform.rotation = rot;
				break;
			}
			tmp = null;
		}
	} else {
		effectCache.cache[prefab] = new Array();
	}	
	if (tmp == null) {
		tmp = Instantiate(prefab, pos, rot);
		var array = effectCache.cache[prefab] as Array;
		array.Push(tmp);
	}
	var info = new ActiveEffectInfo();
	info.endTime = Time.time + lifeTime;
	info.effect = tmp;
	effectCache.activeEffectInfos.Push(info);
}