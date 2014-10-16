#pragma strict

private var lifeTime = 2;
private var startTime:float;

function Start () {
	var cmps = GetComponentsInChildren(Rigidbody);
	var i = 0;
	var direction = transform.right;
	var rot = Quaternion.AngleAxis(-120, transform.forward);
	for (var cmp in cmps) {
		var rb = cmp as Rigidbody;
		
		direction = rot * direction;
		rb.AddForce(direction * 10 + transform.forward * 10, ForceMode.Impulse);
	}
	startTime = Time.time;	
}

function Update () {
	if (Time.time - startTime > lifeTime) {
		Destroy(gameObject);	
	}	
}