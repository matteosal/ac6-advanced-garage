## [v1.1.7](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.1.7)
* Replaced boost speed with grounded and aerial versions
* Added upwards, assault boost, melee and hover speed

## [v1.1.6](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.1.6)
* Changed recoil buildup spec into average accumulated recoil over time
* Excluded back weapons which stop arm weapons from firing from recoil calculations
* Fixed Mag Dump Time spec

## [v1.1.5](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.1.5)
* Added recoil buildup AC spec 
* Added max recoil angle unit spec
* Improved error message when loading an invalid build
* Data fixes

## [v1.1.4](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.1.4)
* Removed intrusive tooltips, using info boxes everywhere
* Added a build loader input field to the main builder
* Fixed stat bar ranges for boosters and units
* Fixed units affected by "Energy Firearm Specialization"
* Added "Chg Direct Attack Power" and "Full Chg Direct Attack Power"
* Fixed Arquebus ADD logo not showing
* Data fixes

## [v1.1.3](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.1.3)
* Added reload time stats for units with heating/cooling mechanics and all the stats that derive from that ("Damage/s Incl Reload", etc)
* Added a checkbox in the central part spec panel to show the effect of equipped parts on some unit specs ("Melee Specialization" from the arms, "Energy Firearm Specialization" from the generator and "Missile Lock Correction" from the FCS)
* Added a dropdown menu in the central part spec panel to normalize spec values to Weight or
 EN Load
* Removed modified missile lock times from AC specs panel
* Updated rounding logic to show more digits on certain stats

## [v1.1.2](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.1.2)
* Fix bar display for "Upward EN Consumption" and "Melee Atk EN Consump"
* Fix pulse buckler image not showing
* Build link input fields in the "Compare Builds" section now remember their content when loading the build or leaving the section

## [v1.1.1](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.1.1)
* Fix jankiness of column drag highlighting in tables section
* Data fixes

## [v1.1.0](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.1.0)
* Added build compare and tables section
* Replaced part images with versions having transparent background
* Made the builder remember its state (e.g. slot ordering) closing and reopening it
* Show game version together with the site version

## [v1.0.6](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.0.6)
* Data fixes

## [v1.0.5](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.0.5)
* Resolve part ordering alphabetically if two parts have the same value
* Show pointer cursor on sorting keys
* Show normal cursor on inactive part slots

## [v1.0.4](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.0.4)
* Make keyboard commands work regardless of casing
* Require clicking on the slot box to change slot
* Improved contrast in the bars for states "Weight By Group" and "EN Load By Group"
* Enlarge default area for "EN Recovery Profiles" plot
* Display version number in the bottom left corner of the page

## [v1.0.3](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.0.3)
* Data fixes
* Excluded pulse shield launcher from DPS/IPS related stats
* Excluded laser turret for all advanced states
* Added missile lock time to reload time when computing "Damage/s Incl Reload", "Impact/s Incl Reload", "Acc Impact/s Incl Reload"
* Renamed "Direct Damage" to "Direct Attack Power"
* Renamed "Unit Range Profiles" to "Aim Assist Profile"

## [v1.0.2](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.0.2)
* Fixed build link generation

## [v1.0.1](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.0.1)
* Various data fixes
* Fixed speed computation for weight above 80k

## [v1.0.0](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.0.0)
* Initial release