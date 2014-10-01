#pragma strict

var turretTraverse : float = 30;
var elevationSpeed : float = 30;

var depression : float = -10;
var elevation :float = 20;

var aimPos:Vector3;
var aimTarget:Transform = null;

var ignoreLayers:LayerMask = -1;

var CoolDown:float = 1.0;

var weaponTag:String;
var launchPos:Vector3;

var gauge:Texture;

var skin:GUISkin;

private var hit:RaycastHit = new RaycastHit();
private var raycastLayers:LayerMask = -1;

private var actualTargetPos:Vector3;
private var gun:Transform;
private var magazine:Magazine;

function AimControl(targetPos:Vector3) {
	aimPos = targetPos;
	aimTarget = aimTarget==null?transform:aimTarget;
	gun = transform.Find("Joint");
}

function lockOn(target:Transform) {
	if (target == null) {
		aimTarget = aimTarget == transform?transform:null;
	} else {
		aimTarget = target;
	}
}

function isAiming() : boolean {
	return aimTarget!=null;
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

		var gunTransform = gun.transform;

		var tmpPos:Vector3 = transform.parent.InverseTransformPoint(_aimPos);
		
		var lookRotation = Quaternion.LookRotation(tmpPos - transform.localPosition);
		
//		transform.localRotation.eulerAngles.y = Mathf.SmoothDampAngle(transform.localRotation.eulerAngles.y, lookRotation.eulerAngles.y, tmpTest, 0.1, turretTraverse);
		transform.localRotation.eulerAngles.y = Mathf.MoveTowardsAngle(transform.localRotation.eulerAngles.y, lookRotation.eulerAngles.y, turretTraverse * Time.deltaTime);
		
		var tmp = lookRotation.eulerAngles.x;
		tmp = tmp > 180?Mathf.Max(360 - elevation, tmp):tmp;
		tmp = tmp <= 180?Mathf.Min(-depression, tmp):tmp;	
		
		gunTransform.localRotation.eulerAngles.x = 
		Mathf.MoveTowardsAngle(gunTransform.localRotation.eulerAngles.x, tmp, Time.deltaTime * elevationSpeed); 	
		
		var currentTargetPos = transform.position + gun.forward * 500;
		if(Physics.Raycast(transform.position, gun.forward, hit, 500, ~LayerMask.GetMask("projectile"))) {
			currentTargetPos = hit.point;
		}
		actualTargetPos = Vector3.Lerp(actualTargetPos, currentTargetPos, 0.8);	
	}
}

function GetTargetPos() {
	return actualTargetPos;
}

private var LastFireTime:float = 0;
function Fire() {
	if (magazine != null) {
		if (magazine.GetAmmoLeft() > 0) {
			if (CoolDown < Time.time - LastFireTime) {
				LastFireTime = Time.time;
				magazine.Fire(gun.position + gun.TransformDirection(launchPos), gun.rotation);
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
	if (IsSafetySwitchOff() && magazine != null) {
		var tmp = magazine.GetAmmoLeft() == 0?1:Mathf.Max(0, Mathf.Min(CoolDown, CoolDown - (Time.time - LastFireTime))) / CoolDown;
		GUI.DrawTexture(Rect(10, Screen.height - gauge.height - 10, gauge.width * (1 - tmp), gauge.height), gauge);
		GUI.Label(Rect(10, Screen.height - 50, 100, 20), "" + magazine.GetAmmoLeft());
	}
}