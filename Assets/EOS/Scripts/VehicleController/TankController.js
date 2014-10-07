class CaterpillarWheel
{
	var collider : WheelCollider;

	var lastEmitPosition : Vector3 = Vector3.zero;
	var lastEmitTime : float = Time.time;
	var wheelVelo : Vector3 = Vector3.zero;
	var groundSpeed : Vector3 = Vector3.zero;
	
	var wheelGraphic : Transform;
	var WheelDefaultPosition : Vector3;
	
	var isLeft : boolean = false;
}

class TankController extends MonoBehaviour {
	private var wheelRadius : float = 0.4;

	var suspensionRange : float = 0.4;
	var suspensionDamper : float = 50;
	var suspensionSpring : float = 185000;
	
	var throttle : float = 0; 
	private var steer : float = 0;
	
	var centerOfMass : Transform;

	var leftWheels : Transform[];
	var rightWheels : Transform[];
	var leftUpperWheels : Transform[];
	var rightUpperWheels : Transform[];
	
	protected var wheels : CaterpillarWheel[];
	private var wfc : WheelFrictionCurve;

	var topSpeed : float = 160;

	var resetTime : float = 5.0;
	private var resetTimer : float = 0.0;

	var forwardStiffness = 10000;
	var sidewayStiffness = 10000;

	var motorTorque = 500;
	var brakeTorque = 500;
	var defaultTorque = 100;

	var maxRPM = 300;
	
	function Awake() {
		wheels = new CaterpillarWheel[leftWheels.Length + rightWheels.Length];
	}

	function Start()
	{	
		SetupWheelColliders();
		
		SetupCenterOfMass();
		
		topSpeed = topSpeed * 1000 / 60.0;
		
		BroadcastMessage("SetOwner", transform, SendMessageOptions.DontRequireReceiver);
	}

	function Update()
	{
		var relativeVelocity : Vector3 = transform.InverseTransformDirection(rigidbody.velocity);
		
		Check_If_Car_Is_Flipped();
		
		UpdateWheelGraphics(relativeVelocity);
	}

	function FixedUpdate()
	{	
		var relativeVelocity : Vector3 = transform.InverseTransformDirection(rigidbody.velocity);
		ApplyThrottle(relativeVelocity);	
	}

	function SetupWheelColliders()
	{
		SetupWheelFrictionCurve();
			
		var wheelCount : int = 0;
		
		var i:int;
		for(i = 0; i < leftWheels.Length; i++) {
			wheels[wheelCount] = SetupWheel(leftWheels[i], true);
			wheelCount++;
		}
		
		for(i = 0; i < rightWheels.Length; i++) {
			wheels[wheelCount] = SetupWheel(rightWheels[i], false);
			wheelCount++;
		}
	}

	function SetupWheelFrictionCurve()
	{
		wfc = new WheelFrictionCurve();
		wfc.extremumSlip = 1;
		wfc.extremumValue = 2;
		wfc.asymptoteSlip = 2;
		wfc.asymptoteValue = 1;
		wfc.stiffness = 1;
	}

	function SetupWheel(wheelTransform : Transform, isLeft:boolean)
	{
		var go : GameObject = new GameObject(wheelTransform.name + " Collider");
		go.transform.position = wheelTransform.position;
		go.transform.parent = transform;
		go.transform.rotation = wheelTransform.rotation;
			
		var wc : WheelCollider = go.AddComponent(typeof(WheelCollider)) as WheelCollider;
		wc.suspensionDistance = suspensionRange;
		var js : JointSpring = wc.suspensionSpring;
		
		js.spring = suspensionSpring;
			
		js.damper = suspensionDamper;
		wc.suspensionSpring = js;
			
		wheel = new CaterpillarWheel(); 
		wheel.collider = wc;
		wc.sidewaysFriction = wfc;
		wc.forwardFriction = wfc;
		wc.sidewaysFriction.stiffness = sidewayStiffness;
		wc.forwardFriction.stiffness = forwardStiffness;
		
		var renderer = wheelTransform.GetComponentInChildren(Renderer);
		if (renderer != null) {
			wheel.collider.radius = renderer.bounds.size.y / 2;		
		}
		
		wheel.wheelGraphic = wheelTransform;
		wheel.WheelDefaultPosition = wheelTransform.localPosition;

		wheel.isLeft = isLeft;
			
		return wheel;
	}

	function SetupCenterOfMass()
	{
		if(centerOfMass != null)
			rigidbody.centerOfMass = centerOfMass.localPosition;
	}

	function GetInput(input)
	{
		throttle = input[0];
		steer = input[1];
	}

	function Check_If_Car_Is_Flipped()
	{
		if(transform.localEulerAngles.z > 80 && transform.localEulerAngles.z < 280)
			resetTimer += Time.deltaTime;
		else
			resetTimer = 0;
		
		if(resetTimer > resetTime)
			FlipCar();
	}

	function FlipCar()
	{
		transform.rotation = Quaternion.LookRotation(transform.forward);
		transform.position += Vector3.up * 0.5;
		rigidbody.velocity = Vector3.zero;
		rigidbody.angularVelocity = Vector3.zero;
		resetTimer = 0;
	}
	
	function CalcWheelPosition(wheel:Transform, col:WheelCollider, defaultPos:Vector3)
    {
        var hit:WheelHit;
        var lp = wheel.localPosition;
        if(col.GetGroundHit(hit))
            lp.y -= Vector3.Dot(wheel.position - hit.point, transform.up) - col.radius;
        else
            lp.y = defaultPos.y - col.suspensionDistance;

        return lp;
    }
    
    var leftRPM = 0;
	var rightRPM = 0;
	function UpdateWheelGraphics(relativeVelocity : Vector3)
	{	
		leftRPM = 0;
		rightRPM = 0;
		for(var w : CaterpillarWheel in wheels)
		{
			var wc : WheelCollider = w.collider;
			
			if (wc.isGrounded) {
				if (w.isLeft) {
					leftRPM = Mathf.Abs(leftRPM) > Mathf.Abs(wc.rpm)?leftRPM:wc.rpm;
				} else {
					rightRPM = Mathf.Abs(rightRPM) > Mathf.Abs(wc.rpm)?rightRPM:wc.rpm;
				}
			}
		}
		
		for(var w : CaterpillarWheel in wheels)
		{
			w.wheelGraphic.localPosition = CalcWheelPosition(w.wheelGraphic, w.collider, w.WheelDefaultPosition);
			if (w.isLeft) {
				w.wheelGraphic.Rotate(Vector3.right * (leftRPM / 60.0 * Time.deltaTime / w.collider.radius * 360));
			} else {
				w.wheelGraphic.Rotate(Vector3.right * (rightRPM / 60.0 * Time.deltaTime / w.collider.radius * 360));
			}
		}
		
		if (leftUpperWheels) {
			for (var t : Transform in leftUpperWheels) {
				t.Rotate(Vector3.right * (leftRPM / 60.0 * Time.deltaTime / t.GetComponentInChildren(Renderer).bounds.size.y / 2 * 360));
			}
		}
		
		if (rightUpperWheels) {
			for (var t : Transform in rightUpperWheels) {
				t.Rotate(Vector3.right * (rightRPM / 60.0 * Time.deltaTime / t.GetComponentInChildren(Renderer).bounds.size.y / 2 * 360));
			}		
		}
	}

	var rpmMonitor : float;

	function getMotorTorque(torque:float, rpm:float) {

		return (maxRPM - Mathf.Min(maxRPM, Mathf.Abs(rpm))) / maxRPM * torque;
	}

	function ApplyThrottle(relativeVelocity : Vector3)
	{
		for(var index = 0; index < wheels.length; index++)
		{
			var w = wheels[index];
	//		var multiplier = Mathf.Clamp(throttle + (ArrayUtility.IndexOf(wheels, w) % 2 == 0?1:-1) * steer, -1, 1);
			var flag = HaveTheSameSign(relativeVelocity.z, throttle) || Mathf.Abs(relativeVelocity.z) < 1;
			var multiplier = (throttle + (w.isLeft?1:-1) * steer * (throttle >= 0?1:-1)) * 0.5; 
			
			w.collider.motorTorque = flag?multiplier * Mathf.Sign(motorTorque) * (getMotorTorque(Mathf.Max(Mathf.Abs(motorTorque) - defaultTorque, 0), w.collider.rpm) + defaultTorque):0;
			w.collider.brakeTorque = (!flag?(brakeTorque - defaultTorque) * Mathf.Abs(throttle):0) + defaultTorque;
		}	
		rpmMonitor = wheels.Length > 0?wheels[0].collider.rpm:0;
	}

	function HaveTheSameSign(first : float, second : float) : boolean
	{
		if (Mathf.Sign(first) == Mathf.Sign(second))
			return true;
		else
			return false;
	}

}





