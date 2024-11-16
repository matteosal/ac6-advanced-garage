* Look for monospaced font for numbers (remember plot text also)
* Use react context for assembly parts (and get rid of hasTankLegs)
* AC stats panel
	* Add expandable sections
* Parts explorer
	* Auto-select equipped part when changing slots (needs react context for assembly)
	* Clear search string when Q|E (use context for global state, get rid of hasTankLegs and move keydown handler to parts explorer so that it has access to search string)
	* Part stats spacing in table
	* Button prompts and implementation of other button-related stuff (sort parts, etc)
	* Manage case when units are moved bertween arm/back, emit messages
	* Parts default ordering and sorting
	* Separate sub-slots for back units
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