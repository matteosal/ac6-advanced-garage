## [v1.2.3](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.2.3) (Feb 3 2025)
* Fixed kick damage

## [v1.2.2](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.2.2) (Feb 3 2025)
* Added bullet speed for LCB and Viento
* Added LCB and Viento to recoil calculator

## [v1.2.1](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.2.1) (Feb 3 2025)
* Fixed Assembly image covering tooltips

## [v1.2.0](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.2.0) (Feb 3 2025)
* Added charged Ideal and Effective Ranges
* Added a ricochet calculator section
* Added overload indicators in the AC stats panel of the builder section
* Show AC assembly using frame part images in builder section
* Updated main title
* Fixed kick damage for reverse joint legs and added kick impact specs
* Fixed mag dump time and dps-related unit specs for burst weapons and other weapons which report their damage stats as an "a x b" product
* Account for PFAU having 2 shots in its magazine
* Account for homing lock delay and homing lock time in dps-related stats for SOUP and PFAU

## [v1.1.10](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.1.10) (Jan 30 2025)
* Added burst fire interval for kinetic weapons and accounter for it in recoil simulation graph
* Added bullet speeds
* Added kick damage
* Data fixes

## [v1.1.9](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.1.9) (Jan 23 2025)
* Added "Upward Economy" and "Assault Boost Economy" AC specs
* Added default part ordering
* Added "Recoil Accumulation Graph" and improved average recoil computation
* Minor cosmetic changes in other graph specs

## [v1.1.8](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.1.8) (Jan 20 2025)
* Added correct speed values when overburdened
* Added correct target tracking when arms are overburdened
* Added tetrapod QB hover speed
* Fixed melee boost speed

## [v1.1.7](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.1.7) (Jan 15 2025)
* Replaced boost speed with grounded and aerial versions
* Added upwards, assault boost, melee and hover speed

## [v1.1.6](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.1.6) (Jan 14 2025)
* Changed recoil buildup spec into average accumulated recoil over time
* Excluded back weapons which stop arm weapons from firing from recoil calculations
* Fixed Mag Dump Time spec

## [v1.1.5](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.1.5) (Jan 12 2025)
* Added recoil buildup AC spec 
* Added max recoil angle unit spec
* Improved error message when loading an invalid build
* Data fixes

## [v1.1.4](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.1.4) (Jan 03 2025)
* Removed intrusive tooltips, using info boxes everywhere
* Added a build loader input field to the main builder
* Fixed stat bar ranges for boosters and units
* Fixed units affected by "Energy Firearm Specialization"
* Added "Chg Direct Attack Power" and "Full Chg Direct Attack Power"
* Fixed Arquebus ADD logo not showing
* Data fixes

## [v1.1.3](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.1.3) (Jan 02 2025)
* Added reload time stats for units with heating/cooling mechanics and all the stats that derive from that ("Damage/s Incl Reload", etc)
* Added a checkbox in the central part spec panel to show the effect of equipped parts on some unit specs ("Melee Specialization" from the arms, "Energy Firearm Specialization" from the generator and "Missile Lock Correction" from the FCS)
* Added a dropdown menu in the central part spec panel to normalize spec values to Weight or
 EN Load
* Removed modified missile lock times from AC specs panel
* Updated rounding logic to show more digits on certain stats

## [v1.1.2](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.1.2) (Dec 17 2024)
* Fix bar display for "Upward EN Consumption" and "Melee Atk EN Consump"
* Fix pulse buckler image not showing
* Build link input fields in the "Compare Builds" section now remember their content when loading the build or leaving the section

## [v1.1.1](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.1.1) (Dec 12 2024)
* Fix jankiness of column drag highlighting in tables section
* Data fixes

## [v1.1.0](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.1.0) (Dec 08 2024)
* Added build compare and tables section
* Replaced part images with versions having transparent background
* Made the builder remember its state (e.g. slot ordering) closing and reopening it
* Show game version together with the site version

## [v1.0.6](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.0.6) (Dec 07 2024)
* Data fixes

## [v1.0.5](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.0.5) (Nov 29 2024)
* Resolve part ordering alphabetically if two parts have the same value
* Show pointer cursor on sorting keys
* Show normal cursor on inactive part slots

## [v1.0.4](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.0.4) (Nov 27 2024)
* Make keyboard commands work regardless of casing
* Require clicking on the slot box to change slot
* Improved contrast in the bars for states "Weight By Group" and "EN Load By Group"
* Enlarge default area for "EN Recovery Profiles" plot
* Display version number in the bottom left corner of the page

## [v1.0.3](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.0.3) (Nov 25 2024)
* Data fixes
* Excluded pulse shield launcher from DPS/IPS related stats
* Excluded laser turret for all advanced states
* Added missile lock time to reload time when computing "Damage/s Incl Reload", "Impact/s Incl Reload", "Acc Impact/s Incl Reload"
* Renamed "Direct Damage" to "Direct Attack Power"
* Renamed "Unit Range Profiles" to "Aim Assist Profile"

## [v1.0.2](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.0.2) (Nov 25 2024)
* Fixed build link generation

## [v1.0.1](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.0.1) (Nov 24 2024)
* Various data fixes
* Fixed speed computation for weight above 80k

## [v1.0.0](https://github.com/matteosal/ac6-advanced-garage/releases/tag/v1.0.0) (Nov 24 2024)
* Initial release