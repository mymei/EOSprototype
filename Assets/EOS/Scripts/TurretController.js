#pragma strict

var gun:Transform;
var muzzles:Transform[];
var chainShot:int = 1;
var chainInterval:float = 0.0;

var turretTraverse : float = 30;
var elevationSpeed : float = 30;

var depression : float = -10;
var elevation :float = 20;

var aimPos:Vector3;
var aimTarget:Transform = null;

var ignoreLayers:LayerMask = -1;

var CoolDown:float = 1.0;

var weaponTag:String;

var gauge:Texture;

var skin:GUISkin;

private var hit:RaycastHit = new RaycastHit();
private var raycastLayers:LayerMask = -1;

private var actualTargetPos:Vector3;
private var magazine:Magazine;
private var euler:Vector3;

private var dummyTarget:GameObject;

function AimControl(targetPos:Vector3) {
	aimPos = targetPos;
	SetTarget(aimTarget==null?transform:aimTarget);
	gun = gun==null?transform.GetComponentsInChildren(Transform)[1] as Transform:gun;	
}

function lockOn(target:Transform) {
	if (target == null) {
		SetTarget(aimTarget == transform?transform:null);
	} else {
		SetTarget(target == aimTarget?null:target);
	}
	return aimTarget == transform?null:aimTarget;
}

function isAiming() : boolean {
	return aimTarget!=null;
}

function SetTarget(target:Transform) {
	if (aimTarget != target) {
		aimTarget = target;
		euler = Vector3.zero;
		EffectCache.Destroy(dummyTarget);
		if (aimTarget != null && aimTarget != transform) {
			dummyTarget = EffectCache.Spawn(aimTarget.parent.gameObject, aimTarget.position, aimTarget.rotation, 0);
			for (var comp in dummyTarget.GetComponentsInChildren(Collider)) {
				(comp as Collider).enabled = false;
			}
		}
	}
}

function getAimPos():Vector3 {
	return aimTarget!=null && aimTarget != transform?aimTarget.position:aimPos;
}

function Start () {
	var tmp:int = ignoreLayers;
	raycastLayers = ~tmp;
//	GUI.skin = skin;
}

private var tmpTest = 0.0;
function Update () {
	if (isAiming()) {
		var _aimPos = getAimPos();
		
		var tmpDir:Vector3 = transform.parent.InverseTransformDirection(_aimPos - transform.position);
		var lookRotation = Quaternion.LookRotation(tmpDir);
		
//		transform.localRotation.eulerAngles.y = Mathf.SmoothDampAngle(transform.localRotation.eulerAngles.y, lookRotation.eulerAngles.y, tmpTest, 0.1, turretTraverse);
		transform.localRotation.eulerAngles.y = Mathf.MoveTowardsAngle(transform.localRotation.eulerAngles.y, lookRotation.eulerAngles.y + euler.y, turretTraverse * Time.deltaTime);
		
		var tmp = lookRotation.eulerAngles.x;
		tmp = tmp > 180?Mathf.Max(360 - elevation, tmp):tmp;
		tmp = tmp <= 180?Mathf.Min(-depression, tmp):tmp;	
		
		var gunTransform = gun.transform;
		gunTransform.localRotation.eulerAngles.x = 
		Mathf.MoveTowardsAngle(gunTransform.localRotation.eulerAngles.x, tmp + euler.x, Time.deltaTime * elevationSpeed); 	
		
		var currentTargetPos = transform.position + gun.forward * 500;
		if(Physics.Raycast(transform.position, gun.forward, hit, 500, ~LayerMask.GetMask("projectile"))) {
			if (hit.collider.transform.root.GetComponentInChildren(TurretController) != this) {
				currentTargetPos = hit.point;			
			}
		}
		actualTargetPos = Vector3.Lerp(actualTargetPos, currentTargetPos, 0.8);	
		
		if (dummyTarget != null) {
			dummyTarget.transform.position = aimTarget.position;
			dummyTarget.transform.rotation = aimTarget.rotation;
			dummyTarget.transform.position += aimTarget.root.rigidbody.velocity * 0.5;
			dummyTarget.transform.rotation *= Quaternion.AngleAxis(aimTarget.root.rigidbody.angularVelocity.magnitude * Mathf.Rad2Deg * 0.5, aimTarget.root.rigidbody.angularVelocity.normalized);
			
			aimTarget.root.rigidbody.angularVelocity * 0.5;
		}
	}
}

function GetTargetPos() {
	return actualTargetPos;
}

function InputOffset(XAxisOffset:float, YAxisOffset:float) {
	if (aimTarget!=null && aimTarget != transform) {
		euler.y += XAxisOffset / 100 * Mathf.Rad2Deg;
		euler.x += YAxisOffset / 100 * Mathf.Rad2Deg;	
	}
}

private var LastFireTime:float = 0;
function Fire() {
	if (magazine != null) {
		if (magazine.GetAmmoLeft() > 0) {
			if (CoolDown < Time.time - LastFireTime) {
				LastFireTime = Time.time;
				var tmpPos = gun.position;
				if (muzzles.Length > 0) {
					tmpPos = Vector3.zero;
					for (var tr in muzzles) {
						tmpPos += tr.position;
					}
					tmpPos /= muzzles.Length;
				}
				magazine.Fire(tmpPos, gun.rotation, chainShot, chainInterval, muzzles);
			}
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

private var SafetySwitch = true;
function SetSafetySwitch(flag:boolean) {
	SafetySwitch = flag;
}
function IsSafetySwitchOff():boolean {
	return !SafetySwitch;
}

function OnGUI() {
	if (IsSafetySwitchOff() && magazine != null && gauge != null) {
		var tmp = magazine.GetAmmoLeft() == 0?1:Mathf.Max(0, Mathf.Min(CoolDown, CoolDown - (Time.time - LastFireTime))) / CoolDown;
		GUI.DrawTexture(Rect(10, Screen.height - gauge.height - 10, gauge.width * (1 - tmp), gauge.height), gauge);
		GUI.Label(Rect(10, Screen.height - 50, 100, 20), "" + magazine.GetAmmoLeft());
	}
}