#pragma strict

class ChopperArmor extends Armor {
	function Start () {

	}

	function Update () {

	}

	function HandleHit(tag:String, factor:float) {
		if (tag == "Bullet") {
			SendMessageUpwards("ApplyDamage", 40, SendMessageOptions.DontRequireReceiver);	
		} else if (tag == "APBullet"){
			SendMessageUpwards("ApplyDamage", 100, SendMessageOptions.DontRequireReceiver);	
		} else if (tag == "HE"){
			SendMessageUpwards("ApplyDamage", 450, SendMessageOptions.DontRequireReceiver);	
		} else if (tag == "HEAT"){
			SendMessageUpwards("ApplyDamage", 350, SendMessageOptions.DontRequireReceiver);	
		} else if (tag == "AP"){
			SendMessageUpwards("ApplyDamage", 100, SendMessageOptions.DontRequireReceiver);	
		}
		return true;
	}
}