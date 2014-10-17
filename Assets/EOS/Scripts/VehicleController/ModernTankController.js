#pragma strict

class CaterpillarBone
{
	var boneGraphic : Transform;
	var BoneDefaultPosition:Vector3;	
}

class ModernTankController extends TankController
{
	var leftBones : Transform[];
	var rightBones : Transform[];
	var leftTrack : GameObject;
	var rightTrack : GameObject;
	
	private var bones : CaterpillarBone[];
	
	function Awake() {
		super.Awake();
		bones = new CaterpillarBone[leftWheels.Length + rightWheels.Length];
	}
	
	function SetupWheelColliders()
	{
		super.SetupWheelColliders();
	
		var boneCount : int = 0;
		
		var i:int;
		for(i = 0; i < leftWheels.Length; i++) {
			bones[boneCount] = SetupBone(leftBones.Length > i?leftBones[i]:null);
			boneCount++;
		}
		
		for(i = 0; i < rightWheels.Length; i++) {
			bones[boneCount] = SetupBone(rightBones.Length > i?rightBones[i]:null);
			boneCount++;
		}
	}
	
	function SetupBone(boneTransform:Transform) {
		var bone = new CaterpillarBone(); 
		bone.boneGraphic = boneTransform;
		bone.BoneDefaultPosition = bone.boneGraphic?bone.boneGraphic.localPosition:Vector3.zero;
		return bone;
	}
	
	protected var LeftTrackTextureOffset:float = 0.0;
	protected var RightTrackTextureOffset:float = 0.0;
	protected var TrackTextureSpeed = 2.5f;
	
	function UpdateWheelGraphics(relativeVelocity : Vector3)
	{
		super.UpdateWheelGraphics(relativeVelocity);	
		
		for(var i = 0; i < wheels.length; i ++)
		{
			if (bones[i].boneGraphic) {
				bones[i].boneGraphic.localPosition = CalcWheelPosition(bones[i].boneGraphic, wheels[i].collider, bones[i].BoneDefaultPosition);
			}
		}
		LeftTrackTextureOffset = Mathf.Repeat(LeftTrackTextureOffset + Time.deltaTime * leftRPM * TrackTextureSpeed / 60.0f, 1.0f);
        leftTrack.renderer.material.SetTextureOffset("_MainTex", new Vector2(LeftTrackTextureOffset, 0));
        RightTrackTextureOffset = Mathf.Repeat(RightTrackTextureOffset + Time.deltaTime * rightRPM * TrackTextureSpeed / 60.0f, 1.0f);
        rightTrack.renderer.material.SetTextureOffset("_MainTex", new Vector2(RightTrackTextureOffset, 0));
	}
}