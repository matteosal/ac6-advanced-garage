* Discrete scrolling for parts and stats. Factor code with slot box scrolling
* AC stats panel
	* Add expandable sections
* Parts explorer
	* Precompute parts and unique stats for each slot
	* Part stats spacing in table. Define stat groups and add empty lines between groups. Don't
	force Weight/EN load at the bottom
	* Have PartSelector remember the sorting for every slot
* Refactoring
	* Look into putting acParts.preview in the actual preview
* Add build link generation and load, make sure build is validated
	* Existing parts
	* Tank legs vs booster
	* Units in wrong slots
	* Duplicated units
* Add advanced weapon stats
* Add build global scores to center
* Add about section
	* Basic info and github link
	* Icon credits if eventually used
		* <a href="https://www.flaticon.com/free-icons/mechanic" title="mechanic icons">Mechanic 
		icons created by Good Ware - Flaticon</a>
		* <a href="https://www.flaticon.com/free-icons/sort-ascending" title="sort ascending icons">Sort ascending icons created by Icon Hubs - Flaticon</a>
	* Link to icons8.com for info icon
* Fix warnings given by npm start
* Run linter / code checking tool