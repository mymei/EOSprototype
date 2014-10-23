class SlugBase extends MonoBehaviour {

	var weaponTag : String;
	var explosiveRange : float = 0;
	var explosion : GameObject[];
	
	protected var collided = false;
	function HandleHit(hits:RaycastHit[]) {
		if (hits.Length > 0) {
			var com:Armor;
			
			var dist = Mathf.Infinity;
			var nearHit:RaycastHit;
			for (var hit : RaycastHit in hits) {
				com = hit.collider.GetComponent("Armor") as Armor;
				if (com != null) {
					if (com.GetOwner() == owner) {
						continue;					
					}
				}
				if (hit.distance < dist) {
					dist = hit.distance;
					nearHit = hit;					
				}
			}
			
			
			if (dist < Mathf.Infinity) {
				com = nearHit.collider.GetComponent("Armor") as Armor;
				var dest = nearHit.collider.GetComponent("Destructable") as Destructable;
				
				var factor:float = 1.0;
				if (com != null) {
					if (com.GetOwner() != owner) {
						factor = com.AttenuateHit(weaponTag);
					}
				}
				
				if (factor > 0) {
					if (explosiveRange > 0) {
						var colliders = Physics.OverlapSphere(nearHit.point, explosiveRange);
						for (var col : Collider in colliders) {
							com = col.GetComponent("Armor") as Armor;
							if (com != null) {
								com.HandleHit(weaponTag, factor);
							}
							dest = col.GetComponent("Destructable") as Destructable;
							if (dest != null) {
								dest.SmashBy(weaponTag);
							}
						}
					} else {
						if (com != null) {
							com.HandleHit(weaponTag, factor);
						}
						if (dest != null) {
							dest.SmashBy(weaponTag);
						}		
					}
					
					for (var go in explosion) {
						GOCache.Spawn(go, nearHit.point, transform.rotation, 1.0);
					}
				}
				collided = true;
			}
		}
	}
	
	private var owner : Transform;
	function SetOwner(_owner:Transform) {
		owner = _owner;
	}
}
