#pragma strict

class T90Armor extends Armor {
	function Start () {

	}

	function Update () {

	}

	function HandleHit(tag:String, factor:float) {
		if (tag == "Bullet") {
			SendMessageUpwards("ApplyDamage", 1, SendMessageOptions.DontRequireReceiver);	
		} else if (tag == "APBullet"){
			SendMessageUpwards("ApplyDamage", 10, SendMessageOptions.DontRequireReceiver);	
		} else if (tag == "RPG"){
			SendMessageUpwards("ApplyDamage", 400, SendMessageOptions.DontRequireReceiver);	
		} else if (tag == "HEAT"){
			SendMessageUpwards("ApplyDamage", 700, SendMessageOptions.DontRequireReceiver);	
		} else if (tag == "Missile"){
			SendMessageUpwards("ApplyDamage", 1500, SendMessageOptions.DontRequireReceiver);	
		}
		return true;
	}
}