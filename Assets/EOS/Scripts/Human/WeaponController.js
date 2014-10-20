#pragma strict

class WeaponController extends MonoBehaviour {

	var CoolDown:float = 1.0;
	var PreparationTime:float = 2.0;
	
	var magazine:Magazine;
	var gun:Transform;
	var muzzles:Transform[];
	var chainShot:int = 1;
	var chainInterval:float = 0.0;
	
	var SafetySwitch = true;
	
	protected var aimPos:Vector3;

	function Start () {

	}

	function Update () {
	}

	function SetAim(targetPos:Vector3) {
		aimPos = targetPos;
	}

	private var LastFireTime:float = 0;
	function FireWeapon() {
		if (magazine != null) {
			if (IsAmmoReloaded()) {
				LastFireTime = Time.time;
				magazine.Fire(gun.position, Quaternion.LookRotation(aimPos - transform.position), aimPos, chainShot, chainInterval, muzzles);
			}
		}
	}

	function Reload(newMagazine:Magazine) {
		if (newMagazine != magazine) {
			magazine = newMagazine;
			LastFireTime = Time.time;
		}
	}

	function GetMagazine() : Magazine {
		return magazine;
	}

	function SetSafetySwitch(flag:boolean) {
		SafetySwitch = flag;
	}
	function IsSafetySwitchOff():boolean {
		return !SafetySwitch;
	}
	function IsAmmoReloaded():boolean {
		return magazine.GetAmmoLeft() > 0 && CoolDown < Time.time - LastFireTime;	
	}
}