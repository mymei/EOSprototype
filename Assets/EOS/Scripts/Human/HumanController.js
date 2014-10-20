#pragma strict

class HumanController extends MonoBehaviour {
	
	var Speed = 10.0;
	var AngularSpeed = 90.0;
	var responsiveness = 1.0;	

	protected var directionLocked = false;
	protected var seeker:PlayerSeeker;
	protected var anim:Animator;
	protected var throttle = 0.0;
	protected var steer = 0.0;
	protected var dead = false;

	function Start () {
		anim = GetComponent(Animator);
		seeker = GetComponent(PlayerSeeker);
	}

	function Update () {
	
		if (!dead) {
			if (directionLocked) {
				var dir = Goal() - transform.position;
				dir.y = 0;
				transform.rotation = Quaternion.LookRotation(dir, Vector3.up);
			} else {
				var rotation = Quaternion.AngleAxis(AngularSpeed * Time.deltaTime * steer, Vector3.up);
				transform.rotation *= rotation;
			}
			
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
	
	function OnSerializeNetworkView(stream:BitStream, info:NetworkMessageInfo) {
		var pos = transform.position;
		stream.Serialize(steer);
		stream.Serialize(pos);
		stream.Serialize(throttle);
		transform.position = pos;
	}
	
	function Killed() {
		dead = true;
		anim.SetBool("Dead", true);	
		for (var cmp in GetComponentsInChildren(Renderer)) {
			var renderer = cmp as Renderer;
			renderer.material.color = Color.black;
		}
	}
	
	function Lock(flag:boolean) {
		directionLocked = flag;
	}
	
	function Goal() {
		return seeker?seeker.Goal():transform.forward * 10;	
	}
}
