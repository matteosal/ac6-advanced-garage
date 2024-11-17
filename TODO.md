* AC stats panel
	* Add expandable sections
* Parts explorer
	* Part stats spacing in table
	* Button prompts and implementation of other button-related stuff (sort parts, etc)
	* Parts default ordering and sorting
	* Separate sub-slots for back units
* Refactoring
	* Look into removing slot range from preview state, bringing it into SlotSelector. 
	useState can set its initial state by looking at the preview slot. The keydown handler for
	Q|E can also be put in SlotSelector (it can coexist with the one looking for ESC) and can 
	set the local slot range state + call the dispatch to set the slot
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
	* Icon credit if eventually used
		* <a href="https://www.flaticon.com/free-icons/mechanic" title="mechanic icons">Mechanic icons created by Good Ware - Flaticon</a>
	* Link to icons8.com for info icon
* Fix warnings given by npm start
* Run linter / code checking tool