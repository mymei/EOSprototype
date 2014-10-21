#pragma strict

class HelicopterController extends VehicleController {

	var throttle : float = 0; 
	private var frontSteer : float = 0;
	private var sideSteer : float = 0;

	var centerOfMass : Transform;

	var topSpeed : float = 160;
	var topElevationSpeed : float = 10;
	var currentSpeed : float;

	var rotorAxis : Vector3;
	var responsiveness : float = 1;

	var tailRotor : float = 180;

	function Start()
	{	
		topSpeed = topSpeed * 1000 / 3600.0;
		
		BroadcastMessage("SetOwner", transform, SendMessageOptions.DontRequireReceiver);
	}

	function Update()
	{
		currentSpeed = rigidbody.velocity.magnitude * 3600 / 1000;
		var relativeVelocity : Vector3 = transform.InverseTransformDirection(rigidbody.velocity);
			
		UpdateRotorGraphics(relativeVelocity);
	}

	function FixedUpdate()
	{	
		// The rigidbody velocity is always given in world space, but in order to work in local space of the car model we need to transform it first.
		var relativeVelocity : Vector3 = transform.InverseTransformDirection(rigidbody.velocity);
		
		ApplyThrottle(relativeVelocity);
		ApplySteering(relativeVelocity);
	}

	function SetupCenterOfMass()
	{
		if(centerOfMass != null)
			rigidbody.centerOfMass = centerOfMass.localPosition;
	}

	/**************************************************/
	/* Functions called from Update()                 */
	/**************************************************/
	private var targetFrontSteer = 0.0;
	private var targetSideSteer = 0.0;
	private var frontSteerVel = 0.0;
	private var sideSteerVel = 0.0;
	function GetInput(input:float[])
	{
		throttle = input[0];
		targetFrontSteer = input[1];
		targetSideSteer = input[2];
		frontSteer = Mathf.SmoothDamp(frontSteer, targetFrontSteer, frontSteerVel, responsiveness, 1);
		sideSteer = Mathf.SmoothDamp(sideSteer, targetFrontSteer==0?0:targetSideSteer, sideSteerVel, responsiveness, 1);
	}
	
	var axis:Vector3;
	var angle:float;

	function UpdateRotorGraphics(relativeVelocity : Vector3)
	{
		if (MyNetwork.IsGOControlled(gameObject)) {

			var tmpAxis = transform.InverseTransformDirection(rotorAxis);

			axis = Vector3.Cross(tmpAxis.normalized, Vector3.up);
			angle = Mathf.Asin(axis.magnitude) * Mathf.Rad2Deg;
		}
		
		var formerAxis = Vector3.Cross(transform.Find("Rotor_root").transform.localRotation * Vector3.up, Vector3.up);
		var formerAngle = Mathf.Asin(formerAxis.magnitude) * Mathf.Rad2Deg;	
				
		var tmpRot = transform.Find("Rotor_root").transform.localRotation * Quaternion.AngleAxis(1000 * Time.deltaTime, Vector3.up);
		tmpRot = Quaternion.AngleAxis(angle, axis) * Quaternion.AngleAxis(formerAngle, formerAxis.normalized) * tmpRot;
		transform.Find("Rotor_root").transform.localRotation = tmpRot;		
		transform.Find("Body_root").transform.localRotation = Quaternion.AngleAxis(angle, axis);
	}
	
	function OnSerializeNetworkView(stream:BitStream, info:NetworkMessageInfo) {
		stream.Serialize(axis);
		stream.Serialize(angle);
	}

	var forwardForce:Vector3;
	var upForce:Vector3;
	private var i:float = 0;
	private var e1:float = 0;
	function ApplyThrottle(relativeVelocity : Vector3)
	{
		

		var verticalSpeed = throttle * topElevationSpeed;
		var currentVerticalSpeed = Vector3.Dot(rigidbody.velocity, Vector3.up); 
		
		var forwardVec = rigidbody.rotation * Vector3.forward;
		var rightVec = rigidbody.rotation * Vector3.right;
		
		var	tmpAxis = -frontSteer * forwardVec - sideSteer * rightVec;
		tmpAxis = tmpAxis.magnitude > 1?tmpAxis.normalized:tmpAxis;
			
		var forwardSpeed = Vector3.Dot(forwardVec, topSpeed * tmpAxis);
		var currentForwardSpeed = Vector3.Dot(forwardVec, rigidbody.velocity);
		var rightSpeed = Vector3.Dot(rightVec, topSpeed * tmpAxis);
		var currentRightSpeed = Vector3.Dot(rightVec, rigidbody.velocity);	
			
		var e = forwardSpeed - currentForwardSpeed;
		i += e;
		forwardForce = rigidbody.mass * (0.1 * e + 0.000 * i + 0.00 * (e - e1)) * forwardVec;
		var rightForce = rigidbody.mass * (0.1 * (rightSpeed - currentRightSpeed)) * rightVec;
		upForce = rigidbody.mass * Physics.gravity * -1 * (1 + 0.1 * (verticalSpeed - currentVerticalSpeed));
		e1 = e;
			
		rotorAxis = -forwardForce - rightForce + rigidbody.mass * Physics.gravity;
		
	//	Debug.Log(rotorAxis);	
	//	rigidbody.AddForce(upForce.magnitude / rotorAxis.y * rotorAxis.magnitude * rotorAxis.normalized);	
				
		rigidbody.AddForce(upForce);
		rigidbody.AddForce(forwardForce);
		rigidbody.AddForce(rightForce);
	//	rigidbody.AddForce(rigidbody.mass * Physics.gravity.magnitude * (1 + 0.5 * throttle) * (rigidbody.rotation * -rotorAxis.normalized));
		
		if (targetFrontSteer == 0) {
			rigidbody.MoveRotation(rigidbody.rotation * Quaternion.AngleAxis(tailRotor * targetSideSteer * Time.deltaTime, Vector3.up));
		} else {
			var displacement = rigidbody.velocity;
			displacement.y = 0.0;
			if (displacement.magnitude > 0) {
				rigidbody.MoveRotation(Quaternion.RotateTowards(rigidbody.rotation, Quaternion.LookRotation(-displacement), 10 * Time.deltaTime));
			}	
		}
		rigidbody.angularVelocity = Vector3.zero;
	}

	function ApplySteering(relativeVelocity : Vector3)
	{
	//	rotorAxis = frontSteer * Vector3.forward + sideSteer * Vector3.right;
	//	rotorAxis = rotorAxis.magnitude > 1?rotorAxis.normalized:rotorAxis;
	//	rotorAxis = -1 / Mathf.Tan(20 * Mathf.Deg2Rad) * Vector3.up + rotorAxis;
	}
}