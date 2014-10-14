#pragma strict

@RPC
function SetEffectActive(flag:boolean) {
	if (particleSystem != null) {
		if (!flag) {			
			particleSystem.Stop();			
			particleSystem.Clear();
			particleSystem.randomSeed = 1;
		} else {
			particleSystem.Play();		
		}
	}
}