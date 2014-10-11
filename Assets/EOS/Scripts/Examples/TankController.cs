using System.Collections.Generic;
using System.Linq;
using UnityEngine;

public class TankController : MonoBehaviour
{
    public GameObject RollerCollider;
    public float TrackTextureSpeed = 2.5f;
    public GameObject LeftTrack;
    public Transform[] LeftUpperRollers;
    public Transform[] LeftSupportRollers;
    public Transform[] LeftBones;
    public GameObject RightTrack;
    public Transform[] RightUpperRollers;
    public Transform[] RightSupportRollers;
    public Transform[] RightBones;
    public float MoveTorque = 60.0f;
    public float MoveBrakeTorque = 5.0f;
    public float MoveMultiplier = 1.3f;
    public float MoveStiffness = 0.05f;
    public float RotateTorque = 60.0f;
    public float RotateBrakeTorque = 30.0f;
    public float RotateMultiplier = 1.3f;
    public float RotateStiffness = 0.06f;
    public float StayBrakeTorque = 1000.0f;
    public Texture2D Logo;

    private const float MinBrakeTorque = 0.0f;
    protected RollerData[] LeftTrackRollerData;
    protected RollerData[] RightTrackRollerData;
    protected float LeftTrackTextureOffset = 0.0f;
    protected float RightTrackTextureOffset = 0.0f;

    void Awake()
    {
        LeftTrackRollerData = new RollerData[LeftSupportRollers.Length];
        RightTrackRollerData = new RollerData[RightSupportRollers.Length];

        for(var i = 0; i < LeftSupportRollers.Length; i++)
            LeftTrackRollerData[i] = SetupRollers(LeftSupportRollers[i], LeftBones[i]);

        for(var i = 0; i < RightSupportRollers.Length; i++)
            RightTrackRollerData[i] = SetupRollers(RightSupportRollers[i], RightBones[i]);

        var offset = transform.position;
        offset.z += 0.01f;
        transform.position = offset;
        rigidbody.centerOfMass= new Vector3(0, 0, -0.3f);
    }

    void FixedUpdate()
    {
        var accelerate = Input.GetAxis("Vertical");
        var steer = Input.GetAxis("Horizontal");
        UpdateRollers(accelerate, steer);
    }

    // Initial setting rollers
    RollerData SetupRollers(Transform roller, Transform bone)
    {
        var result = new RollerData();

        var go = new GameObject(roller.name + "_Collider");
        go.transform.parent = transform;
        go.transform.position = roller.position;
        go.transform.localRotation = Quaternion.Euler(0, roller.localRotation.y, 0);

        var col = (WheelCollider)go.AddComponent(typeof(WheelCollider));
        var colPref = RollerCollider.GetComponent<WheelCollider>();

        col.mass = colPref.mass;
        col.center = colPref.center;
        col.radius = colPref.radius;
        col.suspensionDistance = colPref.suspensionDistance;
        col.suspensionSpring = colPref.suspensionSpring;
        col.forwardFriction = colPref.forwardFriction;
        col.sidewaysFriction = colPref.sidewaysFriction;

        result.RollerTransform = roller;
        result.BoneTransform = bone;
        result.RollerCollider = col;
        result.RollerStartPosition = roller.transform.localPosition;
        result.BoneStartPosition = bone.transform.localPosition;
        result.StartRollerAngle = roller.transform.localRotation;

        return result;
    }

    // Update rollers position and rotation
    void UpdateRollers(float accel, float steer)
    {
        var delta = Time.fixedDeltaTime;
        var trackRpm = CalcRpm(LeftTrackRollerData);

        // Update position and rotation of left support rollers and bones
        foreach(var roller in LeftTrackRollerData)
        {
            roller.RollerTransform.localPosition = CalcRollerPosition(roller.RollerTransform, roller.RollerCollider, roller.RollerStartPosition);
            roller.BoneTransform.localPosition = CalcRollerPosition(roller.BoneTransform, roller.RollerCollider, roller.BoneStartPosition);
            roller.Rotation = Mathf.Repeat(roller.Rotation + delta * trackRpm * 360.0f / 60.0f, 360.0f);
            roller.RollerTransform.localRotation = Quaternion.Euler(roller.Rotation, roller.StartRollerAngle.y, roller.StartRollerAngle.z);
            CalcForce(roller.RollerCollider, accel, steer);
        }
        // Move lefttrack texture
        LeftTrackTextureOffset = Mathf.Repeat(LeftTrackTextureOffset + delta * trackRpm * TrackTextureSpeed / 60.0f, 1.0f);
        LeftTrack.renderer.material.SetTextureOffset("_MainTex", new Vector2(LeftTrackTextureOffset, 0));
        trackRpm = CalcRpm(RightTrackRollerData);

        // Update position and rotation of right support rollers and bones
        foreach(var roller in RightTrackRollerData)
        {
            roller.RollerTransform.localPosition = CalcRollerPosition(roller.RollerTransform, roller.RollerCollider, roller.RollerStartPosition);
            roller.BoneTransform.localPosition = CalcRollerPosition(roller.BoneTransform, roller.RollerCollider, roller.BoneStartPosition);
            roller.Rotation = Mathf.Repeat(roller.Rotation + delta * trackRpm * 360.0f / 60.0f, 360.0f);
            roller.RollerTransform.localRotation = Quaternion.Euler(roller.Rotation, roller.StartRollerAngle.y, roller.StartRollerAngle.z);
            CalcForce(roller.RollerCollider, accel, -steer);
        }
        // Move righttrack texture
        RightTrackTextureOffset = Mathf.Repeat(RightTrackTextureOffset + delta * trackRpm * TrackTextureSpeed / 60.0f, 1.0f);
        RightTrack.renderer.material.SetTextureOffset("_MainTex", new Vector2(RightTrackTextureOffset, 0));

        // Update rotation left upper rollers
        foreach(var roller in LeftUpperRollers)
            roller.localRotation = Quaternion.Euler(LeftTrackRollerData[0].Rotation, LeftTrackRollerData[0].StartRollerAngle.y, LeftTrackRollerData[0].StartRollerAngle.z);
        // Update rotation right upper rollers
        foreach(var roller in RightUpperRollers)
            roller.localRotation = Quaternion.Euler(RightTrackRollerData[0].Rotation, RightTrackRollerData[0].StartRollerAngle.y, RightTrackRollerData[0].StartRollerAngle.z);
    }

    // Calculate move force
    void CalcForce(WheelCollider col, float accel, float steer)
    {
        var fc = col.sidewaysFriction;

        if(accel == 0 && steer == 0) // Stop
            col.brakeTorque = StayBrakeTorque;
        else if(accel == 0) 
        {
            // Rotate on stand
            col.brakeTorque = RotateBrakeTorque;
            col.motorTorque = steer * RotateTorque * RotateMultiplier;
            fc.stiffness = 1.0f + RotateStiffness - Mathf.Abs(steer);
        }
        else
        {
            // Move forward or backward
            col.brakeTorque = MinBrakeTorque;
            col.motorTorque = accel * MoveTorque;

            // Move forward and steer
            if(accel > 0 && steer != 0)
            {
                col.brakeTorque = MoveBrakeTorque;
                col.motorTorque = steer * MoveTorque * MoveMultiplier;
                fc.stiffness = 1.0f + MoveStiffness - Mathf.Abs(steer);
            }

            // Move backward and steer
            if(accel < 0 && steer != 0)
            {
                col.brakeTorque = MoveBrakeTorque;
                col.motorTorque = -steer * MoveTorque * MoveMultiplier;
                fc.stiffness = 1.0f + MoveStiffness - Mathf.Abs(steer);
            }
        }

        if(fc.stiffness > 1.0f) fc.stiffness = 1.0f;
        col.sidewaysFriction = fc;

        if(col.rpm > 0 && accel < 0)
            col.brakeTorque = StayBrakeTorque;
        else if(col.rpm < 0 && accel > 0)
            col.brakeTorque = StayBrakeTorque;
    }

    // Calculate rpm
    float CalcRpm(RollerData[] roller)
    {
        var rpm = 0.0f;
        var groundedRollersId = new List<int>();

        for(var i = 0; i < roller.Length; i++)
            if(roller[i].RollerCollider.isGrounded)
                groundedRollersId.Add(i);

        if(groundedRollersId.Count == 0)
        {
            rpm += roller.Sum(rollerdata => rollerdata.RollerCollider.rpm);
            rpm /= roller.Length;
        }
        else
        {
            rpm += groundedRollersId.Sum(i => roller[i].RollerCollider.rpm);
            rpm /= groundedRollersId.Count;
        }

        return rpm;
    }

    // Calculate roller position
    Vector3 CalcRollerPosition(Transform roller, WheelCollider col, Vector3 startPos)
    {
        WheelHit hit;
        var lp = roller.localPosition;
        if(col.GetGroundHit(out hit))
            lp.y -= Vector3.Dot(roller.position - hit.point, transform.up) - RollerCollider.GetComponent<WheelCollider>().radius;
        else
            lp.y = startPos.y - RollerCollider.GetComponent<WheelCollider>().suspensionDistance;

        return lp;
    }

    void OnGUI()
    {
        GUI.color = Color.black;
        GUILayout.BeginArea(new Rect(10, 10, 400, 200));
        GUILayout.Label("Move and rotate: W,S,A,D");
        GUILayout.Label("Turret and gun: Mouse");
        GUILayout.Label("Look around: Mouse + right mouse button");
        GUILayout.Label("Camera zoom: Mouse scroll wheel");
        GUILayout.EndArea();

        GUI.color = Color.white;
        GUI.DrawTexture(new Rect(Screen.width - 266, 10, 256, 40), Logo);
    }
}

public class RollerData
{
    public Transform RollerTransform;
    public Transform BoneTransform;
    public WheelCollider RollerCollider;
    public Vector3 RollerStartPosition;
    public Vector3 BoneStartPosition;
    public float Rotation = 0.0f;
    public Quaternion StartRollerAngle;
}