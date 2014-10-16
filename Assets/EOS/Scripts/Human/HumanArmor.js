#pragma strict

class HumanArmor extends Armor {

	function HandleHit() {
		SendMessageUpwards("Killed", SendMessageOptions.DontRequireReceiver);
	}
}