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

function Start()
{
	targetDistance = distance;
	if (target != null) {
		target.SendMessage("SetEye", transform, SendMessageOptions.DontRequireReceiver); 
	}
}

private var hit:RaycastHit = new RaycastHit();
private var euler:Vector3 = Vector3.zero;
private var tmpSpeed = 0.0;
private var targetDistance:float;

function LateUpdate()
{
	targetDistance -= Input.GetAxis("Mouse ScrollWheel") * mouseWheelSensitivity;
	targetDistance = Mathf.Min(cameraMaximumDistance, Mathf.Max(cameraMinimumDistance, targetDistance));
	
	distance = Mathf.SmoothDamp(distance, targetDistance, tmpSpeed, 0.3f);

	var currentPosition = Input.mousePosition;

	euler.x -= Input.GetAxis("Mouse Y") / mouseMoveSensitivity * Mathf.Rad2Deg;
	euler.x = Mathf.Max(cameraDropAngle, Mathf.Min(cameraElevateAngle, euler.x));
	euler.y += Input.GetAxis("Mouse X") / mouseMoveSensitivity * Mathf.Rad2Deg;
	var offset = Quaternion.Euler(euler) * Vector3.forward;
	
	if (cameraMinimumDistance == targetDistance) {
		var newTargetPosition = target.position;
		var newPosition = newTargetPosition - offset * 0.1;		
	} else {
		newTargetPosition = target.position + Vector3.up * (height + Mathf.Tan(5 * Mathf.Deg2Rad) * distance);
		newPosition = newTargetPosition - (offset * distance);	
	}

	var targetDirection = newPosition - newTargetPosition;
	
	if(Physics.Raycast(newTargetPosition, targetDirection, hit, distance, ~target.gameObject.layer))
		newPosition = hit.point;
	
	transform.position = newPosition;
	transform.LookAt(newTargetPosition);
}

function ZoomCamera() {


}

function Update() {
	Screen.lockCursor = true;
}

function SetTarget(newTarget:Transform) {
	target = newTarget;
}