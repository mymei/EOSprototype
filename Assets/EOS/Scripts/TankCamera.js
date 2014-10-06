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

function Start()
{
	targetDistance = distance;
	if (target != null) {
		target.SendMessage("SetEye", transform, SendMessageOptions.DontRequireReceiver); 
	}
	defaultFOV = camera.fieldOfView;
}

private var hit:RaycastHit = new RaycastHit();
private var euler:Vector3 = Vector3.zero;
private var tmpSpeed = 0.0;
private var targetDistance:float;

function LateUpdate()
{
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
		var newTargetPosition = target.position;
	} else {
		distance = Mathf.SmoothDamp(distance, targetDistance, tmpSpeed, 0.3f);
		newTargetPosition = target.position + Vector3.up * (height + Mathf.Tan(5 * Mathf.Deg2Rad) * distance);
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
		if(Physics.Raycast(newTargetPosition, (newPosition - newTargetPosition).normalized, hit, distance, ~(1 << target.gameObject.layer)))
			newPosition = hit.point;
		SetFOV(defaultFOV);	
	}
	
	transform.position = newPosition;
	transform.LookAt(newTargetPosition);
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
		if (camera.fieldOfView != defaultFOV) {
			setTargetVisibility(false);
		} else {
			setTargetVisibility(true);
		}
	}
}

function setTargetVisibility(flag:boolean) {
	if (target != null) {
		for (var r : Component in target.GetComponentsInChildren(Renderer)) {
		    (r as Renderer).enabled = flag;
		}
	}
}

function SetTarget(newTarget:Transform) {
	if (target != newTarget) {
		setTargetVisibility(true);
		target = newTarget;
	}
}

function SetAim(newAim:Transform) {
	aim = newAim == transform?null:newAim;
}

//var mat:Material;

//function OnRenderImage(src:RenderTexture, dest:RenderTexture) {
//	Graphics.Blit(src, dest, mat);
//}