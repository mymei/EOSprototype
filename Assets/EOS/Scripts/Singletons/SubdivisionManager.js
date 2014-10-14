#pragma strict

var subdivisionArea:Vector3 = Vector3(10, 10, 10);

static var mgr:SubdivisionManager;

private var managedObjects = new Array();
private var subdivision:Hashtable = new Hashtable();
private var coord4Obj:Hashtable = new Hashtable();

function Awake () {
	mgr = this;
}

function Start () {
}

function Update () {
	for (var obj in managedObjects) {
		var tr = obj as Transform;
		var coord = GetSubdivisionCoord(tr.position);
		
		if (coord != coord4Obj[tr]) {
			ClearInfo(tr);

			if (!subdivision.ContainsKey(coord)) {
				subdivision[coord] = new Array();
			}
			(subdivision[coord] as Array).Add(tr);
			coord4Obj[tr] = coord;		
		}
	}
}

function _register(tr:Transform) {
	managedObjects.Add(tr);
}

function _unregister(tr:Transform) {
	ClearInfo(tr);
	managedObjects.Remove(tr);
}

function ClearInfo(tr:Transform) {
	if (coord4Obj.ContainsKey(tr)) {
		(subdivision[coord4Obj[tr]] as Array).Remove(tr);
		coord4Obj.Remove(tr);
	}
}

function GetObjList4Coord(coord:Vector3) {
	return subdivision[coord] as Array;
}

function GetSubdivisionCoord(pos:Vector3) {
	return Vector3(Mathf.Floor(pos.x / subdivisionArea.x), Mathf.Floor(pos.y / subdivisionArea.z), Mathf.Floor(pos.y / subdivisionArea.z));	
}

function GetCoordList(pos:Vector3) {
	var ret = new Vector3[8];
	var coord = GetSubdivisionCoord(pos);
	var nextCoord = Vector3(Mathf.Floor(pos.x / subdivisionArea.x + 0.5), Mathf.Floor(pos.y / subdivisionArea.z + 0.5), Mathf.Floor(pos.y / subdivisionArea.z + 0.5));
	nextCoord.x = nextCoord.x == coord.x?-1:1;
	nextCoord.y = nextCoord.y == coord.y?-1:1;
	nextCoord.z = nextCoord.z == coord.z?-1:1;

	for (var i = 0; i < 2; i ++) {
		for (var j = 0; j < 2; j ++) {
			for (var k = 0; k < 2; k ++) {
				ret[i + j * 2 + k * 4] = Vector3(coord.x + i * nextCoord.x, coord.y + j * nextCoord.y, coord.z + k * nextCoord.z);				
			}
		}
	}
	return ret;		
}

static function Register(tr:Transform) {
	mgr._register(tr);
}

static function Unregister(tr:Transform) {
	mgr._unregister(tr);
}

static function Retrieve(pos:Vector3):Transform[] {
	var coordList = mgr.GetCoordList(pos);
	var ret:Array = new Array();
	for (var coord:Vector3 in coordList) {
		var array = mgr.GetObjList4Coord(coord);
		if (array) {
			for (var obj in array) {
				var tr = obj as Transform;
				ret.Add(tr);			
			}
		}
	}
	return ret.ToBuiltin(Transform) as Transform[];	
}