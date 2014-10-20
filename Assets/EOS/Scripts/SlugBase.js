class SlugBase extends MonoBehaviour {

	var weaponTag : String;
	var explosiveRange : float = 0;
	var explosion : GameObject[];
	
	protected var collided = false;
	function HandleHit(hits:RaycastHit[]) {
		if (hits.Length > 0) {
			var com:Armor;
			var factor:float = 1.0;
			for (var hit : RaycastHit in hits) {
				com = hit.collider.GetComponent("Armor") as Armor;
				if (com != null) {
					if (com.GetOwner() == owner) {
						continue;					
					}
					factor = com.AttenuateHit(weaponTag);
				}
				
				if (factor > 0) {
					if (explosiveRange > 0) {
						var colliders = Physics.OverlapSphere(hit.point, explosiveRange);
						for (var col : Collider in colliders) {
							com = col.GetComponent("Armor") as Armor;
							if (com != null) {
								com.HandleHit(weaponTag, factor);
							}	
						}
					} else if (com != null) {
						com.HandleHit(weaponTag, factor);		
					}
					
					for (var go in explosion) {
						GOCache.Spawn(go, hits[0].point, transform.rotation, 1.0);
					}
				}
				collided = true;
				break;			
			}
		}
	}
	
	private var owner : Transform;
	function SetOwner(_owner:Transform) {
		owner = _owner;
	}
}
