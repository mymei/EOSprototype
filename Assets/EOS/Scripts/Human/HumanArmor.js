#pragma strict

class HumanArmor extends Armor {

	var HP:int = 100;

	function HandleHit(tag:String, factor:float) {
		if (HP > 0) {
			if (tag == "Bullet") {
				HP -= 40;		
			} else {
				HP -= 100;		
			}
			if (HP <= 0) {
				SendMessageUpwards("Killed", SendMessageOptions.DontRequireReceiver);
			}		
		}
		return true;
	}
}