#pragma strict

var target:Transform;
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

	var currentPosition = Input.mousePosition;

	euler.x -= Input.GetAxis("Mouse Y") / mouseMoveSensitivity * Mathf.Rad2Deg;
	euler.x = Mathf.Max(cameraDropAngle, Mathf.Min(cameraElevateAngle, euler.x));
	euler.y += Input.GetAxis("Mouse X") / mouseMoveSensitivity * Mathf.Rad2Deg;
	var offset = Quaternion.Euler(euler) * Vector3.forward;
	
	if (isZooming) {
		var newTargetPosition = target.position;
		var newPosition = newTargetPosition - offset * 0.1;	
		
		ZoomCamera(zoomLevel);
	} else {
		distance = Mathf.SmoothDamp(distance, targetDistance, tmpSpeed, 0.3f);
		newTargetPosition = target.position + Vector3.up * (height + Mathf.Tan(5 * Mathf.Deg2Rad) * distance);
		newPosition = newTargetPosition - (offset * distance);
		if(Physics.Raycast(newTargetPosition, (newPosition - newTargetPosition).normalized, hit, distance, ~target.gameObject.layer))
			newPosition = hit.point;
		
		SetFOV(defaultFOV);	
	}
	
	transform.position = newPosition;
	transform.LookAt(newTargetPosition);
}

function Update() {
	Screen.lockCursor = true;
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
	target = newTarget;
}