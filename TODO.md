* Mechanics to figure out
	* Ricochet distance calculation
	* Heating/Cooling for orbits. BehaviorParamPC -> Active Orbit Continous Heat in Smithbox
	* Recoil buildup vs recoil control, for related advanced targeting stat
	* Bullet speed
	* Several mobility stats (CalcCorrectGraph in Smithbox)
		* AB/upwards/hover/melee attack speed
		* QB distance, ground and aerial
		* EN efficiency (EN/m) for all movements
	* Firing animation times are not factored into DPS calculations, so DPS is skewed when 
	  those are large (fireAnimationNote tooltip)
* Direct Chg/FullChg Attack Power
* Discrete scrolling for parts and stats. Factor code with slot box scrolling
* Build image using parts
* Tests
* Create custom Plotly bundle to reduce size