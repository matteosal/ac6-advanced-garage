* Mechanics to figure out
	* Heating/Cooling for orbits. BehaviorParamPC -> Active Orbit Continous Heat in Smithbox
	* QB distance, ground and aerial (needs to figure out detals of the QB velocity curve
		  over time)
	* FCS assist / firearm spec / lock times / etc
	* Firing animation times are not factored into DPS calculations, so DPS is skewed when 
	  those are large (fireAnimationNote tooltip). Adding BurstFireInterval should correct
	  many of them (especially missiles)
* Discrete scrolling for parts and stats. Factor code with slot box scrolling
* Tests
* Create custom Plotly bundle to reduce size