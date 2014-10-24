#pragma strict

var subdivisionArea:Vector3 = Vector3(10, 10, 10);
var test:GameObject;

static var mgr:SubdivisionManager;

private var managedObjects = new Array();
private var subdivision:Hashtable = new Hashtable();
private var coord4Obj:Hashtable = new Hashtable();

function Awake () {
	mgr = this;
}

private var size = 1.0;

private var PCL:Hashtable;
private var obstacleHash:Hashtable;
private var heightHash:Hashtable;

var PCLdensity:float = 5;
function CalcAllPrecomputedCovers() {
	PCL.Clear();
	var volumes = FindObjectsOfType(PrecomputedCoverVolume);
		
	for (var cmp in volumes) {
		var volume = cmp as PrecomputedCoverVolume;
		var start = Vector2(Mathf.Floor((volume.transform.position.x - volume.transform.localScale.x) / PCLdensity), Mathf.Floor((volume.transform.position.z - volume.transform.localScale.z) / PCLdensity));
		var end = Vector2(Mathf.Floor((volume.transform.position.x + volume.transform.localScale.x) / PCLdensity), Mathf.Floor((volume.transform.position.z + volume.transform.localScale.z) / PCLdensity));
		for (var x = start.x; x < end.x; x += 1) {
			for (var y = start.y; y < end.y; y += 1) {
				PCL[Vector3(x * PCLdensity, 0, y * PCLdensity)] = FindCovers(Vector3(x * PCLdensity, 0, y * PCLdensity), volume.range, volume.coverDensity);	
			}		
		}
	}
}

function AddList(list:Array, value:int) {
	var bytes = System.BitConverter.GetBytes(value);
	list.Add(bytes[0], bytes[1], bytes[2], bytes[3]);
}

function AddList(list:Array, value:float) {
	var bytes = System.BitConverter.GetBytes(value);
	list.Add(bytes[0], bytes[1], bytes[2], bytes[3]);
}

function Sync () {
	var path = "Assets/test.bytes";
	if (System.IO.File.Exists("Assets/test.bytes")) {
		var bin = System.IO.File.ReadAllBytes("Assets/test.bytes");
		var index = 0;
		
		var key:Vector3;
		var pos:Vector3;
		var readStream:Array;
		var length = System.BitConverter.ToInt32(bin, index); index+=4;
		
		for (var i = 0; i < length; i ++) {
			key.x = System.BitConverter.ToSingle(bin, index); index+=4;
			key.y = System.BitConverter.ToSingle(bin, index); index+=4;
			key.z = System.BitConverter.ToSingle(bin, index); index+=4;
			var listLength = System.BitConverter.ToInt32(bin, index); index+=4;
			readStream = new Array(listLength);
			
			for (var j = 0; j < listLength; j ++) {
				pos.x = System.BitConverter.ToSingle(bin, index); index+=4;
				pos.y = System.BitConverter.ToSingle(bin, index); index+=4;
				pos.z = System.BitConverter.ToSingle(bin, index); index+=4;
				readStream.Add(pos);
			}
			PCL[key] = readStream;
		}
	} else {
		CalcAllPrecomputedCovers();	
			
		var size = 4;
		for (var k:Vector3 in PCL.Keys) {
			size += (PCL[k] as Array).length * 12 + 16;			
		}
		var byteStream = new Array();
		
		AddList(byteStream, PCL.Count);		
		
		for (var k:Vector3 in PCL.Keys) {	
			var list = PCL[k] as Array;
			
			AddList(byteStream, k.x);
			AddList(byteStream, k.y);
			AddList(byteStream, k.z);
			AddList(byteStream, list.length);
			for (var item in list.ToBuiltin(Vector3) as Vector3[]) {
				AddList(byteStream, item.x);
				AddList(byteStream, item.y);
				AddList(byteStream, item.z);	
			}		
		}
	
		System.IO.File.WriteAllBytes("Assets/test.bytes", byteStream.ToBuiltin(byte) as byte[]);
	
	}
	

	
	
	
//	BitConverter.GetBytes();
//	
//	
//	Array();
	
	
	
	
	
	
//	
//	var test2:int = 10;
//	var test3 = BitConverter.GetBytes(test2);
//	var test4 = BitConverter.ToInt32(test3, 0);
//	
//	Debug.Log(test3);

//	BinaryReader(fs);
//	Resources.Load(
	
}

function Start () {

//	PCL = new Hashtable();
//	obstacleHash = new Hashtable();
//	heightHash = new Hashtable();
//	
//	Sync();
//	CalcAllPrecomputedCovers();
//	
//	var center:Vector3 = Vector3(50, 0, 50);
//	
//	Sync(center);
	
//	var list:Array;
//	
//	for (var x = 0; x < 1; x ++) {
//		for (var y = 0; y < 1; y ++) {
//			list = FindCovers(Vector3(x + 125, 0, y + 43), 100);
//		
//		}
//	}	
}

function FindCovers(center:Vector3, range:float, density:float) {
	center.y = GetHeight(center);
	center.y += 2;
	
	var maxStep = Mathf.FloorToInt(range/density);
	
	var ret = new Array();
	var a:int;
	var pos = center;
	for (var step = 1; step < maxStep; step+=2) {
		for (a = 0; a < step; a++) {
			pos.x += density;
			AddCover(pos, center, ret);		
		}
		for (a = 0; a < step; a++) {
			pos.z += density;
			AddCover(pos, center, ret);		
		}
		for (a = 0; a < step + 1; a++) {
			pos.x -= density;
			AddCover(pos, center, ret);		
		}
		for (a = 0; a < step + 1; a++) {
			pos.z -= density;
			AddCover(pos, center, ret);		
		}
	}
	return ret;
}

function GetHeight(pos:Vector3):float {
	var key = Vector3(pos.x, 0, pos.z);
	if (!heightHash.ContainsKey(key)) {
		heightHash[key] = Terrain.activeTerrain.SampleHeight(pos);	
	}
	return System.Convert.ToDouble(heightHash[key]);
}

function AddCover(pos:Vector3, center:Vector3, list:Array) {

	pos.y = GetHeight(pos);
	pos.y += 1;
	
	var dir = pos - center;	

//	if (Physics.Raycast(center, dir.normalized, dir.magnitude, 
//	~(LayerMask.GetMask("vehicle") | LayerMask.GetMask("Invisible") | LayerMask.GetMask("human") | LayerMask.GetMask("wall4human") | LayerMask.GetMask("Ignore Raycast")))) {
		var key = Vector3(pos.x, 0, pos.z);
		if (!obstacleHash.ContainsKey(key)) {
			if (!Physics.CheckSphere(pos, 0.7, 
			~(LayerMask.GetMask("notatall") | LayerMask.GetMask("vehicle") | LayerMask.GetMask("Invisible") | LayerMask.GetMask("human") | LayerMask.GetMask("wall4human") | LayerMask.GetMask("Ignore Raycast")))) {
				obstacleHash[key] = false;
			} else {
				obstacleHash[key] = true;
			}		
		}
		
		if (!obstacleHash[key]) {
			if (!isCoveredByObstacle(center, pos)) {
//				Instantiate(test, pos, Quaternion.identity);
				list.Add(pos);
			}		
		}
//	}	
}

function isCoveredByObstacle(from:Vector3, to:Vector3) {
	var ret = true;
	var offset = from - to;
	
	if (Mathf.Abs(offset.x) > Mathf.Abs(offset.z)) {
		var _x = Mathf.Sign(offset.x);
		var next1 = Vector3(_x + to.x, 0, Mathf.Floor(_x * offset.z / offset.x / size + 0.5) * size + to.z);	
		if (obstacleHash.ContainsKey(next1) && obstacleHash[next1]) {
			ret = false;
		}
	} else { 
		var _z = Mathf.Sign(offset.z);
		var next2 = Vector3(Mathf.Floor(_z * offset.x / offset.z / size + 0.5) * size + to.x, 0, _z + to.z);	
		if (obstacleHash.ContainsKey(next2) && obstacleHash[next1]) {
			ret = false;
		}
	}
	
	return ret;
}

function Update () {
	mgr = this;
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

private var poleList = new Array();
private var currentPCLKey:Vector3;
function _showCovers(pos:Vector3) {
	var key = Vector3(Mathf.Floor(pos.x / PCLdensity) * PCLdensity, 0, Mathf.Floor(pos.z / PCLdensity) * PCLdensity);
	
	if (currentPCLKey != key) {
		for (var ob in poleList) {
			var go = ob as GameObject;
			Destroy(go);			
		}
		poleList.clear();
		
		if (PCL.ContainsKey(key)) {
			var list = PCL[key] as Array;
			for (var pp in list.ToBuiltin(Vector3) as Vector3[]) {
				poleList.Add(Instantiate(test, pp, Quaternion.identity));
				
			}	
		}
		currentPCLKey = key;
	}
}

static function showCovers(pos:Vector3) {
	mgr._showCovers(pos);
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