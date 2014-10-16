#pragma strict

class HumanController extends MonoBehaviour {
	
	var Speed = 10.0;
	var AngularSpeed = 90.0;
	var responsiveness = 1.0;	

	protected var anim:Animator;
	protected var throttle = 0.0;
	protected var steer = 0.0;
	protected var dead = false;

	function Start () {
		anim = GetComponent(Animator);
	}

	function Update () {
	
		if (!dead) {
			var rotation = Quaternion.AngleAxis(AngularSpeed * Time.deltaTime * steer, Vector3.up);
			transform.rotation *= rotation;
			
			var actualThrottle = throttle >= 0?throttle:0.5 * throttle;
			anim.SetFloat("Speed", Mathf.Abs(actualThrottle));
			GetComponent(CharacterController).SimpleMove(transform.forward * Speed * actualThrottle);		
		}
//		transform.position += transform.forward * Time.deltaTime * Speed * actualThrottle;	
	}
	
	private var targetThrottle = 0.0;
	private var throttleVel = 0.0;
	function GetInput(input:float[])
	{
		steer = input[1];
		targetThrottle = input[0];
		throttle = Mathf.SmoothDamp(throttle, targetThrottle, throttleVel, responsiveness, 1);
	}
	
	function Killed() {
		dead = true;
		anim.SetBool("Dead", true);	
	}
}
