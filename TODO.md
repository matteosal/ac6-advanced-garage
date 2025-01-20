* Mechanics to figure out
	* Ricochet distance calculation
	* Heating/Cooling for orbits. BehaviorParamPC -> Active Orbit Continous Heat in Smithbox
	* Bullet speed
	* Several mobility stats (CalcCorrectGraph in Smithbox)
		* QB distance, ground and aerial (needs to figure out detals of the QB velocity curve
		  over time)
	* Kick stats (damage, impact, range, ...)
	* FCS assist / firearm spec / lock times / etc
	* Firing animation times are not factored into DPS calculations, so DPS is skewed when 
	  those are large (fireAnimationNote tooltip)
* Recoil plot / buildup
* Discrete scrolling for parts and stats. Factor code with slot box scrolling
* Overburden / arms overburden / EN overload indicators in AC stats header
* Default part ordering
* Build image using parts
* Tests
* Create custom Plotly bundle to reduce size