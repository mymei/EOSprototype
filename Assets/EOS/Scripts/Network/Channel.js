#pragma strict

var supportedNetworkLevels : String[] = [ "Main" ];
var disconnectedLevel : String = "lobby";

private var lastLevelPrefix = 0;

function Awake ()
{
    // Network level loading is done in a separate channel.
    DontDestroyOnLoad(this);
    networkView.group = 1;
    Application.LoadLevel(disconnectedLevel);
}

function Start () {

}

function Update () {

}

private var isProcessing:boolean = false;
function OnGUI ()
{
	if (Network.peerType == NetworkPeerType.Disconnected)
    {
        GUILayout.BeginArea(Rect(0, Screen.height - 30, Screen.width, 30));
        GUILayout.BeginHorizontal();
        
        if (isProcessing) {
        
        } else {
            if (GUILayout.Button("Create a server")) {
		    	Network.incomingPassword = "EOS";
		    	Network.InitializeServer(5, 25000, false);

				isProcessing = true;
		    } 
		    
		    if (GUILayout.Button("Connect a server")) {            	
		    	Network.Connect("127.0.0.1", 25000, "EOS");
		    	isProcessing = true;
		    }
        }
           
        GUILayout.FlexibleSpace();
        GUILayout.EndHorizontal();
        GUILayout.EndArea();
    } else {
        GUILayout.BeginArea(Rect(0, Screen.height - 30, Screen.width, 30));
        GUILayout.BeginHorizontal();
        
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
		} else if (Network.isClient)
			GUILayout.Label("Running as a client");         

        GUILayout.FlexibleSpace();
        GUILayout.EndHorizontal();
        GUILayout.EndArea();
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

		if (Network.isServer) {
	        for (var obj in FindObjectsOfType(Rigidbody)) {
	        	networkView.RPC("SyncRigidbody", RPCMode.AllBuffered, (obj as Rigidbody).gameObject.name, Network.AllocateViewID());
	        }
        }
}

@RPC
function SyncRigidbody(name:String, viewID:NetworkViewID) {
	var go = GameObject.Find(name) as GameObject;
	if (go) {
		var view = go.AddComponent(NetworkView);
		(view as NetworkView).viewID = viewID;
		(view as NetworkView).observed = go.rigidbody;
	
	}
}

function OnDisconnectedFromServer ()
{
    Application.LoadLevel(disconnectedLevel);
}

@script RequireComponent(NetworkView)