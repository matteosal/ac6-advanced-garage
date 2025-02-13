* Mechanics to figure out
	* Heating/Cooling for orbits. BehaviorParam_PC -> Active Orbit Continous 
	Heat / continueShootAddHeatMaxTimeSec
	* QB distance, ground and aerial (needs to figure out detals of the QB velocity curve
		  over time)
	* FCS assist / firearm spec / lock times / etc
	* Firing animation times are not factored into DPS calculations, so DPS is skewed when 
	  those are large (fireAnimationNote tooltip). Adding BehaviorParam_PC -> 
	  burstFireInterval / shootInterval should correct many of them (especially missiles). Also consider shoulderShootDelay / waitTimeForShoot and 
	  shoulderChargedShootDelay / waitTimeForChargeShoot in equipParamWeapon
* Discrete scrolling for parts and stats. Factor code with slot box scrolling
* Tests
* Create custom Plotly bundle to reduce size