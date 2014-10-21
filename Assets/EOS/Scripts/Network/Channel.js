#pragma strict

var supportedNetworkLevels : String[] = [ "Main" ];
var disconnectedLevel : String = "lobby";

class MissionInfo {
	var vehicleName : String;
	var player : int;
	var go : GameObject;
}

var vehicles:GameObject[];

var missionList : Array;

private var lastLevelPrefix = 0;

function Awake ()
{
    // Network level loading is done in a separate channel.
    DontDestroyOnLoad(this);
    networkView.group = 1;
    Application.LoadLevel(disconnectedLevel);
    
//    MasterServer.ipAddress = "127.0.0.1";
//    MasterServer.port = 10002;
	missionList = new Array();
	
	for (var obj in vehicles) {
		var vehicle = obj as GameObject;
		
		missionList.Add(new MissionInfo());
		var info = missionList[missionList.length - 1] as MissionInfo;
		
		info.vehicleName = vehicle.name;
		info.go = vehicle;
		info.player = -1;
	}
}

function Start () {

}

function Update () {

}

private var isProcessing:boolean = false;
private var isConnecting:boolean = false;
function OnGUI ()
{
    GUILayout.BeginArea(Rect(Screen.width / 4, Screen.height / 4, Screen.width / 2, Screen.height / 2));

	if (Network.peerType == NetworkPeerType.Disconnected)
    {
        GUILayout.BeginHorizontal();
        
        if (isProcessing) {
        
        } else if (isConnecting) {
        	GUILayout.BeginVertical();
        	var hostData:HostData[] = MasterServer.PollHostList();
        	for (var el in hostData) {
        		GUILayout.BeginHorizontal();
        		var name = el.gameName + " " + el.connectedPlayers + " / " + el.playerLimit;
        		GUILayout.Label(name);
        		GUILayout.Space(5);
        		var hostInfo:String;
        		hostInfo = "[";
        		for (var host in el.ip) {
        			hostInfo = hostInfo + host + ":" + el.port + " ";
        		}
        		hostInfo = hostInfo + "]";
        		GUILayout.Label(hostInfo);
        		GUILayout.Space(5);
        		GUILayout.Label(el.comment);
        		GUILayout.FlexibleSpace();
        		if (GUILayout.Button("Connect")) {
        			Network.Connect(el, "EOSKCUD");
			    	isProcessing = true;
			    	isConnecting = false;        		
        		}        		
        		GUILayout.EndHorizontal();       	
        	}
        	if (GUILayout.Button("Back")) {
		    	isConnecting = false;        		
        	}
        	GUILayout.EndVertical();
        } else {
            if (GUILayout.Button("Create a server")) {
		    	Network.incomingPassword = "EOSKCUD";
		    	Network.InitializeServer(5, 25000, !Network.HavePublicAddress());
		    	MasterServer.RegisterHost("EOS", "PVEP sample", "Just come in");

				isProcessing = true;
		    } 
		    
		    if (GUILayout.Button("Connect a server")) {  
		    	MasterServer.ClearHostList();
        		MasterServer.RequestHostList("EOS");
			    isConnecting = true;	
		    }
        }
           
        GUILayout.FlexibleSpace();
        GUILayout.EndHorizontal();
    } else {
    	if (Application.loadedLevelName.ToLower() == disconnectedLevel.ToLower()) {
    	    
	        GUILayout.BeginVertical();
	        
        	var id = int.Parse(Network.player.ToString());  
	        
	        GUILayout.Label("Running as a player " + id);
	        
	        var selected = false;
	      	for (var obj in missionList) {
	        	if ((obj as MissionInfo).player == id) {
	        		selected = true;
	        		break;
	        	}
	        }
	        
	        for (var obj in missionList) {
	            GUILayout.BeginHorizontal();

	        	var info = obj as MissionInfo;
	        	
	        	if ((!selected && info.player == -1) || info.player == id) {
		        	if (GUILayout.Button(info.vehicleName)) {
	       				if (Network.isServer) {
	       					SelectMission(info.vehicleName, Network.player);

	       				} else {
		       				networkView.RPC("SelectMission", RPCMode.Server, info.vehicleName, Network.player);
	      				}
	       			}	        	
	        	} else {
	        		GUILayout.Box(info.vehicleName);
	        	}
	        	
	        	if (info.player != -1) {
	        		GUILayout.Label("Player"+info.player);        	
	        	}
	        	GUILayout.EndHorizontal();
	        }			
	        
			if (Network.isServer) {
				for (var level in supportedNetworkLevels)
		        {
		            if (GUILayout.Button(level))
		            {
		                Network.RemoveRPCsInGroup(0);
		                Network.RemoveRPCsInGroup(1);
		                networkView.RPC( "LoadLevel", RPCMode.AllBuffered, level, lastLevelPrefix + 1);
		            }
		        }		
			}        

	        GUILayout.FlexibleSpace();
	        GUILayout.BeginVertical();
    	}
    }
    
    GUILayout.EndArea();
}

function OnSerializeNetworkView(stream:BitStream, info:NetworkMessageInfo) {
	for (var obj in missionList) {
		var mi = obj as MissionInfo;
		stream.Serialize(mi.player);
	}
}

@RPC
function SelectMission (vehicleName:String, player:NetworkPlayer) {
	var id:int = int.Parse(player.ToString());
	for (var obj in missionList) {
		var mi = obj as MissionInfo;
		if (mi.vehicleName == vehicleName) {
			if (mi.player == -1) {
				mi.player = id;
			} else if (mi.player == id) {
				mi.player = -1;
			}
		}
	}
}

function OnConnectedToServer() {
	Debug.Log("Connected to server");
	isProcessing = false;
}

function OnFailedToConnect(error : NetworkConnectionError) {
	Debug.Log("Could not connect to server: "+ error);
	isProcessing = false;
}

function OnServerInitialized() {
	Debug.Log("Server initialized and ready");
	isProcessing = false;
}

function OnPlayerDisconnected(player:NetworkPlayer) {
	var id:int = int.Parse(player.ToString());
	for (var obj in missionList) {
		var mi = obj as MissionInfo;
		if (mi.player == id) {
			mi.player = -1;
		}
	}
}

@RPC
function LoadLevel (level : String, levelPrefix : int)
{
    lastLevelPrefix = levelPrefix;

        // There is no reason to send any more data over the network on the default channel,
        // because we are about to load the level, thus all those objects will get deleted anyway
        Network.SetSendingEnabled(0, false);    

        // We need to stop receiving because first the level must be loaded first.
        // Once the level is loaded, rpc's and other state update attached to objects in the level are allowed to fire
        Network.isMessageQueueRunning = false;
        
        // All network views loaded from a level will get a prefix into their NetworkViewID.
        // This will prevent old updates from clients leaking into a newly created scene.
        Network.SetLevelPrefix(levelPrefix);
        Application.LoadLevel(level);
        yield;
        yield;

        // Allow receiving data again
        Network.isMessageQueueRunning = true;
        // Now the level has been loaded and we can start sending out data to clients
        Network.SetSendingEnabled(0, true);

//		if (Network.isServer) {
//	        for (var obj in FindObjectsOfType(Rigidbody)) {
//	        	networkView.RPC("SyncRigidbody", RPCMode.AllBuffered, (obj as Rigidbody).gameObject.name, Network.AllocateViewID());
//	        }
//        }

	var id:int = int.Parse(Network.player.ToString());
	for (var obj in missionList) {
		var mi = obj as MissionInfo;
		if (mi.player == id) {		
			var vehicle = Network.Instantiate(mi.go, Vector3(100 + 10 * id, 4, 100),Quaternion.identity, 0);
			(FindObjectOfType(TankCamera) as TankCamera).target = vehicle.transform;
			(FindObjectOfType(TankCamera) as TankCamera).InitTarget();
			break;
		}
	}
}

//@RPC
//function SyncRigidbody(name:String, viewID:NetworkViewID) {
//	var go = GameObject.Find(name) as GameObject;
//	if (go) {
//		var view = go.AddComponent(NetworkView);
//		(view as NetworkView).viewID = viewID;
//		(view as NetworkView).observed = go.rigidbody;
//		(view as NetworkView).stateSynchronization = NetworkStateSynchronization.Unreliable;
//	
//	}
//}

function OnDisconnectedFromServer ()
{
    Application.LoadLevel(disconnectedLevel);
}

@script RequireComponent(NetworkView)