#pragma strict

class Leopard2Armor extends Armor {
	function Start () {

	}

	function Update () {

	}

	function HandleHit(tag:String, factor:float) {
		if (tag == "Bullet") {
			SendMessageUpwards("ApplyDamage", 1, SendMessageOptions.DontRequireReceiver);	
		} else if (tag == "APBullet"){
			SendMessageUpwards("ApplyDamage", 1, SendMessageOptions.DontRequireReceiver);	
		} else if (tag == "HE"){
			SendMessageUpwards("ApplyDamage", 200, SendMessageOptions.DontRequireReceiver);	
		} else if (tag == "HEAT"){
			SendMessageUpwards("ApplyDamage", 700, SendMessageOptions.DontRequireReceiver);	
		} else if (tag == "AP"){
			SendMessageUpwards("ApplyDamage", 1500, SendMessageOptions.DontRequireReceiver);	
		}
		return true;
	}
}