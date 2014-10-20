#pragma strict

class APCArmor extends Armor {
	function Start () {

	}

	function Update () {

	}

	function HandleHit(tag:String, factor:float) {
		if (tag == "Bullet") {
			SendMessageUpwards("ApplyDamage", 1, SendMessageOptions.DontRequireReceiver);	
		} else if (tag == "APBullet"){
			SendMessageUpwards("ApplyDamage", 40, SendMessageOptions.DontRequireReceiver);	
		} else if (tag == "HE"){
			SendMessageUpwards("ApplyDamage", 150, SendMessageOptions.DontRequireReceiver);	
		} else if (tag == "HEAT"){
			SendMessageUpwards("ApplyDamage", 450, SendMessageOptions.DontRequireReceiver);	
		} else if (tag == "AP"){
			SendMessageUpwards("ApplyDamage", 300, SendMessageOptions.DontRequireReceiver);	
		}
		return true;
	}
}