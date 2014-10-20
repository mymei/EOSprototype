#pragma strict

var target:Transform;
var aim:Transform;
var height:float = 5f;
var distance:float = 4f;

var mouseWheelSensitivity = 1f;
var mouseMoveSensitivity = 100f;

var cameraMinimumDistance = 1f;
var cameraMaximumDistance = 10f;

var cameraElevateAngle = 85;
var cameraDropAngle = -20;

var zoomList:float[];
private var isZooming:boolean=false;
private var zoomLevel:int;

private var defaultFOV:float;

private var currentTarget:Transform;
private var targetBase:Transform;
private var turretGunners;

private var vehicleDrivers:Array;
private var driverIndex:int;

function InitTarget() {
	if (targetBase != target) {
		SetActiveBase(false);		
		targetBase = target;
		turretGunners = targetBase.GetComponentsInChildren(PlayerTurretGunner);
		SetActiveBase(true);	
	}
}

function SetActiveBase(flag:boolean) {
	if (targetBase) {
		var driver = targetBase.GetComponentInChildren(PlayerHandler);
		if (driver) {
			driver.enabled = flag;
		}		
		if (flag) {
			targetBase.BroadcastMessage("SetEye", transform, SendMessageOptions.DontRequireReceiver);
		} else {
			targetBase.BroadcastMessage("ResetEye", SendMessageOptions.DontRequireReceiver);
		}
	}
}

function Start()
{
	vehicleDrivers = FindObjectsOfType(PlayerHandler);
	
	for (var i = 0; i < vehicleDrivers.length; i ++) {
		var tmp:PlayerHandler = vehicleDrivers[i] as PlayerHandler;
		tmp.enabled = false;	
		if (tmp.transform == target) {
			driverIndex = i;
		}
	}
	targetDistance = distance;
	InitTarget();
	defaultFOV = camera.fieldOfView;
}

private var hit:RaycastHit = new RaycastHit();
private var euler:Vector3 = Vector3.zero;
private var tmpSpeed = 0.0;
private var targetDistance:float;

function LateUpdate()
{
	UpdateTarget();
	
	if (currentTarget) {
		if (isZooming) {
			zoomLevel = zoomLevel + (Input.GetAxis("Mouse ScrollWheel")!=0?Mathf.Sign(Input.GetAxis("Mouse ScrollWheel")):0);
			if (zoomLevel < -1) {
				isZooming = false;
			}
			zoomLevel = Mathf.Min(zoomList.Length - 1, zoomLevel);
		} else {
			targetDistance -= Input.GetAxis("Mouse ScrollWheel") * mouseWheelSensitivity;
			
			if (cameraMinimumDistance > targetDistance) {
				isZooming = true;
				zoomLevel = -1;
			}
			targetDistance = Mathf.Min(cameraMaximumDistance, Mathf.Max(cameraMinimumDistance, targetDistance));	
		}
		
		// position
		if (isZooming) {
			var newTargetPosition = currentTarget.position;
		} else {
			distance = Mathf.SmoothDamp(distance, targetDistance, tmpSpeed, 0.3f);
			newTargetPosition = currentTarget.position + Vector3.up * (height + Mathf.Tan(5 * Mathf.Deg2Rad) * distance);
		}
		
		// direction
		if (aim == null){
			euler = Quaternion.FromToRotation(Vector3.forward, transform.forward).eulerAngles;
		
			euler.x -= Input.GetAxis("Mouse Y") / mouseMoveSensitivity * Mathf.Rad2Deg;
			euler.y += Input.GetAxis("Mouse X") / mouseMoveSensitivity * Mathf.Rad2Deg;	
		} else {
			euler = Quaternion.FromToRotation(Vector3.forward, aim.position - newTargetPosition).eulerAngles;	
		}
		euler.x -= euler.x > 180?360:0;
		euler.x = Mathf.Max(cameraDropAngle, Mathf.Min(cameraElevateAngle, euler.x));
		
		//distance	
		if (isZooming) {
			var newPosition = newTargetPosition - GetDirection() * 0.1;			
			ZoomCamera(zoomLevel);
		} else {		
			newPosition = newTargetPosition - (GetDirection() * distance);
			if(Physics.Raycast(newTargetPosition, (newPosition - newTargetPosition).normalized, hit, distance, ~(1 << currentTarget.gameObject.layer)))
				newPosition = hit.point;
			SetFOV(defaultFOV);	
		}
		
		transform.position = newPosition;
		transform.LookAt(newTargetPosition);
	
	}
}

function Update() {
	Screen.lockCursor = true;
}

function GetDirection() {
	return Quaternion.Euler(euler) * Vector3.forward;
}

function ZoomCamera(zoomLevel:int) {
	if (zoomLevel == -1) {
		SetFOV(defaultFOV);
	} else {
		SetFOV(Mathf.Atan(Mathf.Atan(defaultFOV * Mathf.Deg2Rad) / zoomList[zoomLevel]) * Mathf.Rad2Deg);
	}
}

function SetFOV(newFOV:float) {
	if (newFOV != camera.fieldOfView) {
		camera.fieldOfView = newFOV;
	}
}

function isTargetVisible() {
	return !isZooming;
}

function setVisibility(_target:Transform, flag:boolean) {
	if (_target) {
		for (var r : Component in _target.root.GetComponentsInChildren(Renderer)) {
		    (r as Renderer).enabled = flag;
		}	
	}
}

function UpdateTarget() {
	if (Input.GetKeyDown("space")) {
		driverIndex ++;
		driverIndex = driverIndex < vehicleDrivers.length?driverIndex:0;
		target = (vehicleDrivers[driverIndex] as PlayerHandler).transform;
		InitTarget();			
	}

	var ret = targetBase;
	if (turretGunners) {
		for (var cmp in turretGunners) {
			if ((cmp as PlayerTurretGunner).IsControllable()) {
				ret = (cmp as PlayerTurretGunner).transform;				
				break;
			}		
		}
	}

	if (currentTarget != ret) {
		setVisibility(currentTarget, true);
		currentTarget = ret;
		SetAim(null);
	}
	setVisibility(currentTarget, isTargetVisible());
}

function SetAim(newAim:Transform) {
	aim = newAim == transform?null:newAim;
}

//var mat:Material;

//function OnRenderImage(src:RenderTexture, dest:RenderTexture) {
//	Graphics.Blit(src, dest, mat);
//}