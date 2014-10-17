#pragma strict

static var goCache:GOCache;

var cache:Hashtable = new Hashtable();
var activeEffectInfos = new Array();

class ActiveEffectInfo {
	var endTime:float;
	var prefab:GameObject;
	var go:GameObject;
}

function Awake () {
	goCache = this;
}

function Start () {

}

function Update () {
	goCache = this;
	for (var i = 0; i < activeEffectInfos.length; i++) {
		var info = activeEffectInfos[i] as ActiveEffectInfo;
		if (info.endTime != 0 && info.endTime < Time.time) {
			if (!goCache.IsCachePossible(info.go)) {
				MyNetwork.Destroy(info.go);
			} else {
				SetGOActive(info.go, false);
				CacheGO(info.prefab, info.go);
			}
			activeEffectInfos.Remove(info);
			break;		
		}	
	}	
}

function IsCachePossible(go:GameObject) {
	return go.GetComponent(EffectHandler);	
}

function CacheGO(prefab:GameObject, go:GameObject) {
	
	if (goCache.IsCachePossible(prefab)) {

		var array:Array;
		if (goCache.cache.ContainsKey(prefab)) {	
			array = goCache.cache[prefab] as Array;
		} else {
			array = new Array();
			goCache.cache[prefab] = array;
		}
		
		array.Push(go);
	
	}
}

function SetGOActive(effect:GameObject, flag:boolean) {
	var handler = effect.GetComponent(EffectHandler) as EffectHandler;
	if (handler) {
		if (effect.networkView && effect.networkView.isMine) {
			effect.networkView.RPC("SetEffectActive", RPCMode.All, flag);
		} else {
			handler.SetEffectActive(flag);		
		}	
	}
}

static function Spawn(prefab:GameObject, pos:Vector3, rot:Quaternion, lifeTime:float):GameObject {
	var tmp:GameObject;
	if (goCache.cache.ContainsKey(prefab)) {	
		var array = goCache.cache[prefab] as Array;
		if (array.length > 0) {
			tmp = array.pop() as GameObject;
			tmp.transform.position = pos;
			tmp.transform.rotation = rot;
			goCache.SetGOActive(tmp, true);
		}
	}	
	if (tmp == null) {
		tmp = MyNetwork.Instantiate(prefab, pos, rot, null);
	}
	
	if (lifeTime > 0 || goCache.IsCachePossible(tmp)) {
		var info = new ActiveEffectInfo();
		info.endTime = lifeTime <= 0?0:Time.time + lifeTime;
		info.prefab = prefab;
		info.go = tmp;
		goCache.activeEffectInfos.Push(info);
	}

	return tmp;
}

static function Destroy(instance:GameObject) {
	if (instance) {
		for (var i = 0; i < goCache.activeEffectInfos.length; i++) {
			var info = goCache.activeEffectInfos[i] as ActiveEffectInfo;
			if (info.go == instance) {
				if (goCache.IsCachePossible(info.go)) {
					goCache.SetGOActive(info.go, false);
					goCache.CacheGO(info.prefab, info.go);
				}				
				goCache.activeEffectInfos.Remove(info);
				break;		
			}	
		}
		if (!goCache.IsCachePossible(instance)) {
			MyNetwork.Destroy(instance);
		}	
	}
}