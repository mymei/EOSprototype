#pragma strict

class SoldierController extends HumanController {
	
	protected var weaponController:WeaponController;	
	protected var preparationStartTime = 0.0;
	protected var isFiring = false;
	protected var shootingHash = Animator.StringToHash("Shooting");
	protected var shootHash = Animator.StringToHash("Shoot");
	protected var Shot_Ready_Hash = Animator.StringToHash("Base Layer.Shot_Ready");
	protected var Shot_Rifle_Hash = Animator.StringToHash("Base Layer.Shot_Rifle");

	function Start () {
		super.Start();
		weaponController = GetComponentInChildren(WeaponController);
	}

	function Update () {
		super.Update();	
		
		if (weaponController && weaponController.IsSafetySwitchOff()) {
	
			if (isFiring) {
				if (preparationStartTime == 0.0) {
					if (weaponController.IsAmmoReloaded()) {
						preparationStartTime = Time.time;				
					}			
				} else if (Time.time - preparationStartTime > weaponController.PreparationTime) {
					var stateInfo : AnimatorStateInfo = anim.GetCurrentAnimatorStateInfo(0);
					if (stateInfo.nameHash == Shot_Ready_Hash && !anim.IsInTransition(0)) {
						anim.SetTrigger(shootHash);	
						
						weaponController.SetAim(Goal());
						weaponController.FireWeapon();
					} else if (stateInfo.nameHash == Shot_Rifle_Hash) {
						preparationStartTime = 0.0;	
					}
				}
			} else {
				preparationStartTime = 0.0;
			}
			anim.SetBool(shootingHash, preparationStartTime != 0.0);	
		}
	}
	
	function SetFire(flag:boolean) {
		isFiring = flag;
		Lock(flag);
	}
	
	function isCoolDown() {
		return !weaponController.IsAmmoReloaded();	
	}
	
	function OnShoot() {

	}
}