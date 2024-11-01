const useHID = false
const Hatchling = false
const HatchPlus = false
const useSnap=false
const FinchBlox = false
const BloxIDE = false
const robotTest = true 

const BLE_TYPE = {
  FINCH: 1,
  HUMMINGBIRD: 2,
  FINCH_AND_HUMMINGBIRD: 3,
}
var findable = BLE_TYPE.FINCH_AND_HUMMINGBIRD

const Colors = {}
//BBT Style guide colors
Colors.easternBlue = "#089BAB"; //bbt blue
Colors.neonCarrot = "#FF9922";
Colors.fountainBlue = "#62BCC7"; //lighter blue
Colors.seance = "#881199"; //dark purple
Colors.bbtDarkGray = "#535353";
Colors.iron = "#CACACA";

var userRobotID = ""


/*
<span id="downloadFirmware" style="color: white;"> Having trouble connecting? Download the latest firmware <a href="https://learn.birdbraintechnologies.com/downloads/installers/BBTFirmware.hex" style="color: #ff9922;">here</a>. For detailed installation instructions view steps 2 and 3 of this <a href="https://learn.birdbraintechnologies.com/finch/finchblox/program/1-1" style="color: #ff9922;">tutorial</a>.</span>
*/

///// Section Headers /////

const sectionHeaders = {}

sectionHeaders['welcome'] = `
<div class="row p-4 text-center">
	<h1>Welcome to our support app!</h1>
</div>
`
sectionHeaders['contactSupport'] = `
<div class="row p-4 text-center">
	<h1>Contact Support</h1>
</div>
`
sectionHeaders['success'] = `
<div class="row p-4 text-center">
	<h1>Success!</h1>
</div>
`

function createSectionHeader(product, section) {
	let text = (product == 'finch') ? "Finch Robot Support " : "Hummingbird Kit Support "
	let subText = (section != null) ? "<h2>" + section + "</h2>" : ""
	let imageFile = (product == 'finch') ? "finch_top_left_transparent.png" : "HummingbirdBitController_12.jpg"
	return `
		<div class="row">
			<div class="col-sm-6 text-end align-self-center">
				<h1>` + text + `</h1>
				` + subText + `
			</div>
			<div class="col-sm-6">
				<img src="robotTesting/` + imageFile + `"/>
			</div>
		</div>
	`
}

sectionHeaders['finch'] = createSectionHeader("finch")
sectionHeaders['finchPower'] = createSectionHeader("finch", "Power") 
sectionHeaders['finchBluetooth'] = createSectionHeader("finch", "Bluetooth")
sectionHeaders['finchCode'] = createSectionHeader("finch", "Code")
sectionHeaders['finchMotors'] = createSectionHeader("finch", "Motors")
sectionHeaders['finchLEDs'] = createSectionHeader("finch", "LEDs")
sectionHeaders['finchSensors'] = createSectionHeader("finch", "Sensors")

sectionHeaders['hummingbird'] = createSectionHeader("hummingbird")

///// Reusable Elements /////

const subHeader = `<div class="row align-self-center"><h2>What seems to be the trouble?</h2></div>`

const connectRobotOverBle = `
<div class="row align-self-center">
	<span>For this test, your robot will need to be connected via bluetooth.</span>
</div>
<div id="currentConnection" class="row align-self-center">

</div>
<div class="row"></div>
`
const establishConnection = `
<div class="row">
	<span>Use the button below to look for a connection</span>
</div>
<div class="row">
	<div class="col-sm-12">
		<button id="find-button" class="btn btn-orange btn-lg" onclick="findAndConnect()">Find Robots</button>
	</div>
</div>
<div class="row">
</div>
`
const currentlyConnectedTo = `
<div class="row">
	<span>You are currently connected to</span>
</div>
<div id="robotDetails" class="row">
	
</div>
<div class="row">
	<div class="col-sm-6">
		<button class="btn btn-orange btn-lg" onclick="currentPage.nextAction()">Test this robot</button>
	</div>
	<div class="col-sm-6">
		<button class="btn btn-orange btn-lg" onclick="changeRobot()">Test a different robot</button>
	</div>
</div>
`
const cameraInstruction = `
<div class="row">
	<span>Please have your phone or other recording device ready to record the test.  Your video may need to be sent to the support team to confirm the test results.</span>
</div>
<div class="row">
	<div class="col-sm-12">
		<button class="btn btn-orange btn-lg" onclick="currentPage.nextAction()">I am recording</button>
	</div>
</div>
<div class="row"></div>
`

///// Contents /////

const contents = {}

contents["home"] =  `
<div class="row align-self-center"><h2>Select your product</h2></div>
<div class="row align-self-center">
	<div class="col-sm-6">
		<button class="btn btn-orange btn-lg btn-product" aria-label="finch" onclick="navigateTo('finchHome')">
			<span>Finch Robot</span></br>
			<img src="robotTesting/finch_top_left_transparent.png"/>
		</button>
	</div>
	<div class="col-sm-6">
		<button class="btn btn-orange btn-lg btn-product" aria-label="hummingbird" onclick="navigateTo('hummingbirdHome')">
			<span>Hummingbird Kit</span></br>
			<img src="robotTesting/HummingbirdBitController_12.jpg"/>
		</button>
	</div>
</div>
<div class="row"></div>
`
contents["comingSoon"] = `
<div class="row align-self-center"><h2>Support for this topic is coming soon</h2></div>
`
contents["contactSupport"] = `
<div class="row align-self-center">
	<h2>Thank you for using the support app!</h2> 
	<span>Please contact our support team for further assistance. Be sure to include the following information in your message:
		<ul style="text-align: left">
			<li>Your order number (it would start with a BB)</li>
			<li>Your shipping address</li>
			<li>A detailed description of what you have tried to fix the problem</li>
			<li>A video of the problem if you have been prompted to record one</li>
		</ul>
	</span>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
		<a class="btn btn-orange btn-lg" style="color: #fff;" target="_blank" href="https://www.birdbraintechnologies.com/about-us/contact-us/">Contact Support</a>
	</div>
</div>
<div class="row"></div>
`
contents["finchHome"] = subHeader + `
<div class="row align-self-center">
	<div class="col-sm-4">
		<button class="btn btn-orange btn-lg" aria-label="power" onclick="navigateTo('finchPower')" style="width: 200px;">
			<span>Power</span>
		</button>
	</div>
	<div class="col-sm-4">
		<button class="btn btn-orange btn-lg" aria-label="bluetooth" onclick="navigateTo('finchBluetooth')" style="width: 200px;">
			<span>Bluetooth</span>
		</button>
	</div>
	<div class="col-sm-4">
		<button class="btn btn-orange btn-lg" aria-label="code" onclick="navigateTo('finchCode')" style="width: 200px;">
			<span>Code</span>
		</button>
	</div>
</div>
<div class="row align-self-center">
	<div class="col-sm-4">
		<button class="btn btn-orange btn-lg" aria-label="motors or wheels" onclick="navigateTo('finchMotors')" style="width: 200px;">
			<span>Motors/Wheels</span>
		</button>
	</div>
	<div class="col-sm-4">
		<button class="btn btn-orange btn-lg" aria-label="L E D's" onclick="navigateTo('finchLEDs')" style="width: 200px;">
			<span>LEDs</span>
		</button>
	</div>
	<div class="col-sm-4">
		<button class="btn btn-orange btn-lg" aria-label="sensors" onclick="navigateTo('finchSensors')" style="width: 200px;">
			<span>Sensors</span>
		</button>
	</div>
</div>
<div class="row align-self-center">
</div>
`
contents["hummingbirdHome"] = subHeader + `
<div class="row align-self-center">
	<div class="col-sm-4">
		<button class="btn btn-orange btn-lg" aria-label="power" onclick="navigateTo('hummingbirdPower')" style="width: 200px;">
			<span>Power</span>
		</button>
	</div>
	<div class="col-sm-4">
		<button class="btn btn-orange btn-lg" aria-label="bluetooth" onclick="navigateTo('hummingbirdBluetooth')" style="width: 200px;">
			<span>Bluetooth</span>
		</button>
	</div>
	<div class="col-sm-4">
		<button class="btn btn-orange btn-lg" aria-label="code" onclick="navigateTo('hummingbirdCode')" style="width: 200px;">
			<span>Code</span>
		</button>
	</div>
</div>
<div class="row align-self-center">
	<div class="col-sm-4">
		<button class="btn btn-orange btn-lg" aria-label="servos" onclick="navigateTo('hummingbirdServos')" style="width: 200px;">
			<span>Servos</span>
		</button>
	</div>
	<div class="col-sm-4">
		<button class="btn btn-orange btn-lg" aria-label="L E D's" onclick="navigateTo('hummingbirdLEDs')" style="width: 200px;">
			<span>LEDs</span>
		</button>
	</div>
	<div class="col-sm-4">
		<button class="btn btn-orange btn-lg" aria-label="sensors" onclick="navigateTo('hummingbirdSensors')" style="width: 200px;">
			<span>Sensors</span>
		</button>
	</div>
</div>
<div class="row align-self-center">
</div>
`
contents["finchMotors1"] = `
<div class="col-sm-6 align-self-center">
	<img src="robotTesting/finch_grommet.jpg"/>
</div>
<div class="col-sm-6 align-self-center">
	<div class="row pb-5">
		<span>First, please flip your Finch over to look at the underside. Take a look at the gray star-shaped rubber grommet. Is it dislodged or torn?</span>
	</div>
	<div class="row">
		<div class="col-sm-6">
			<button class="btn btn-orange btn-lg" onclick="navigateTo('finchMotors3')">My grommet looks fine</button>
		</div>
		<div class="col-sm-6">
			<button class="btn btn-orange btn-lg" onclick="navigateTo('finchMotors2')">My grommet needs help</button>
		</div>
	</div>
</div>
`
contents["finchMotors2"] = `
<div class="row align-self-center">
	<span>The grommet is only there to hold a marker during drawing activities, and many markers don't even need it. You can safely remove this part, adjust its position, or replace it if you have a spare. If you need help doing this, please take a look at this <a target="_blank" href="https://support.birdbraintechnologies.com/hc/en-us/articles/21908696662811-How-do-I-replace-Finch-2-0-s-rubber-marker-grommet">support article</a>. </span>
</div>
<div class="row align-self-center">
	<div class="col-sm-6">
		<button class="btn btn-orange btn-lg" onclick="navigateTo('finchMotorsSuccess')">Fixing the grommet has solved my problem</button>
	</div>
	<div class="col-sm-6">
		<button class="btn btn-orange btn-lg" onclick="navigateTo('finchMotors3')">I have fixed my grommet but still have a problem</button>
	</div>
</div>
`
contents["finchMotors3"] = `
<div class="row align-self-center">
	<span>Next, we will test the motors by sending some commands automatically. Please ensure that your Finch is powered on.</span>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
		<button class="btn btn-orange btn-lg" onclick="navigateTo('finchMotors4')">My Finch is powered on</button>
	</div>
</div>
<div class="row">
</div>
`
contents["finchMotors4"] = connectRobotOverBle

contents["finchMotors5"] = `
<div class="row align-self-center">
	<span>Your finch is about to receive commands to move forward, move backward, turn right, and turn left.</span>
</div>
` + cameraInstruction

contents["finchMotors6"] = `
<div class="row align-self-center">
	<span>Did the finch move forward, move backward, turn right, and turn left?</span>
</div>
<div class="row align-self-center">
	<div class="col-sm-6">
		<button class="btn btn-orange btn-lg" onclick="navigateTo('finchMotorsSuccess')">Yes</button>
	</div>
	<div class="col-sm-6">
		<button class="btn btn-orange btn-lg" onclick="navigateTo('contactSupport')">No</button>
	</div>
</div>
`
contents["finchMotorsSuccess"] = `
<div class="row align-self-center">
	<h2>Thanks for using the support app! Your Finch's motors appear to be functioning normally!</h2>
</div>
<div class="row align-self-center">
	<div class="col-sm-6">
		<button class="btn btn-orange btn-lg" onclick="navigateTo('finchCode')">Help me with my code</button>
	</div>
	<div class="col-sm-6">
		<button class="btn btn-orange btn-lg" onclick="navigateTo('finchHome')">Diagnose another problem</button>
	</div>
</div>
`
contents["finchPower1"] = `
<div class="row align-self-center">
	<span>First, make sure your battery is charged</span>
</div>
<div class="row align-self-center">
	<div class="col-sm-4">
		<img src="robotTesting/finch_plugged_in.png"/>
	</div>
	<div class="col-sm-8">
		<p>
			To charge the Finch, plug the USB-C cable (micro-USB on older models) into the charging slot beneath the Finch’s tail. A small green or yellow light will illuminate next to the charging charging plug. 
			<br>
			Plugging the micro USB into the micro:bit will <b>NOT</b> charge the Finch! A full charge requires 7 hours, consider charging overnight.
		</p>
	</div>
</div>
<div class="row align-self-center text-center">
	<div class="col-sm-12">
		<button class="btn btn-orange btn-lg" onclick="navigateTo('finchPowerSuccess')">Charging solved my problem</button>
		<button class="btn btn-orange btn-lg" onclick="navigateTo('finchPower2')">My battery is charged</button>
		<button class="btn btn-orange btn-lg" onclick="navigateTo('finchPower3')">My battery won't charge</button>
	</div>
</div>
<div class="row align-self-center"></div>
`
contents["finchPower2"] = `
<div class="row align-self-center">
	<span>Next, attempt to power your finch on</span>
</div>
<div class="row align-self-center">
	<div class="col-sm-4">
		<img src="robotTesting/finch_power_on.png"/>
	</div>
	<div class="col-sm-8">
		<p>
			To turn on the Finch press and hold the power button on the bottom of your Finch until one or more of the LEDs in the tail turn on. This should take about 2 seconds.
		</p>
	</div>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
		<button class="btn btn-orange btn-lg" onclick="navigateTo('finchPowerSuccess')">This solved my problem</button>
		<button class="btn btn-orange btn-lg" onclick="navigateTo('finchPower3')">My Finch is powered on</button>
		<button class="btn btn-orange btn-lg" onclick="navigateTo('finchPower3')">My Finch will not power on</button>
	</div>
</div>
<div class="row align-self-center"></div>
`
contents["finchPower3"] = `
<div class="row align-self-center">
	<span>Now, ensure that the Finch's battery is seated correctly</span>
</div>
<div class="row align-self-center">
	<div class="col-sm-6">
		<iframe src="//fast.wistia.com/embed/iframe/u5v892f6q9" width="448" height="252" frameborder="0" allowfullscreen=""></iframe>
	</div>
	<div class="col-sm-6">
		<p>
			One reason you may be experiencing battery issues is because the battery is not seated properly in the holder. To correct this, please open the battery door and push the battery into the holder with enough force to depress the springs in the Finch. You can see this procedure in the video to the left.
		</p>
	</div>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
		<button class="btn btn-orange btn-lg" onclick="navigateTo('finchPowerSuccess')">This solved my problem</button>
		<button class="btn btn-orange btn-lg" onclick="navigateTo('finchPower4')">My battery is seated correctly</button>
	</div>
</div>
<div class="row align-self-center"></div>
`
contents["finchPower4"] = `
<div class="row align-self-center">
	<span>Check that the Finch's battery is able to hold a charge</span>
</div>
<div class="row align-self-center">
	<div class="col-sm-6">
		<iframe src="//fast.wistia.com/embed/iframe/u5v892f6q9" width="448" height="252" frameborder="0" allowfullscreen=""></iframe>
	</div>
	<div class="col-sm-6">
		<p>
			Another reason you may be experiencing battery issues is because the battery is no longer holding a charge. You can test this by switching batteries with a working Finch using the same video below. If swapping the battery works, then you will need a replacement battery.
		</p>
	</div>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
		<button class="btn btn-orange btn-lg" onclick="navigateTo('finchPowerSuccess')">This solved my problem</button>
		<button class="btn btn-orange btn-lg" onclick="navigateTo('contactSupport')">My battery is holding a charge</button>
		<button class="btn btn-orange btn-lg" onclick="navigateTo('contactSupport')">I need a replacement battery</button>
		<button class="btn btn-orange btn-lg" onclick="navigateTo('contactSupport')">I don't have a second Finch</button>
	</div>
</div>
<div class="row align-self-center"></div>
`
contents["bluetooth1"] = `
<div class="row align-self-center">
	<span>When connecting over bluetooth, your robot should be on, and the micro:bit display should be flashing a sequence of characters. This sequence should be three letters, followed by the '#' symbol, followed by a seven character code.</span>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
		<button id="btn_not_on" class="btn btn-orange btn-lg">My robot will not power on</button>
		<button id="btn_no_display" class="btn btn-orange btn-lg">My robot is on but display is off or wrong</button>
		<button id="btn_ok" class="btn btn-orange btn-lg">My robot is on and flashing the right characters</button>
	</div>
</div>
<div class="row align-self-center"></div>
`
contents["bluetooth2"] = `
<div class="row align-self-center">
	<span>If your robot is powered on, but is not displaying the correct sequence of characters, please update your firmware. For detailed installation instructions view steps 2 and 3 of this <a href="https://learn.birdbraintechnologies.com/finch/finchblox/program/1-1" target="_blank">tutorial</a>.</span>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
		<button class="btn btn-orange btn-lg" type="button" onclick="location.href='https://learn.birdbraintechnologies.com/downloads/installers/BBTFirmware.hex'">Download latest firmware</button>
		<button id="btn_success" class="btn btn-orange btn-lg">Installing firmware has solved my problem</button>
		<button id="btn_fail" class="btn btn-orange btn-lg">I have updated the firmware but still have a problem</button>
	</div>
</div>
<div class="row align-self-center"></div>
`
contents["bluetooth3"] = `
<div class="row align-self-center">
	<span>To connect your robot over bluetooth using a web browser, you will need your seven character code. This is the code that follows '#' symbol. The first two characters of this code denote the type of robot you are using (FN for Finch, BB for Hummingbird, and MB for micro:bit). The five characters after that are unique to the micro:bit.</span>
</div>
<div class="row align-self-center">
	<div class="col-sm-3">
	</div>
	<div class="col-sm-6">
		
			<label for="robotID">Please enter your code below (eg. MB4A50F):</label>
		
	 		<input type="text" id="robotID" name="robotID">
	 		<button class="btn btn-orange btn-lg" onclick="saveRobotId()">Submit</button>
	
 	</div>
 	<div class="col-sm-3">
 	</div>
</div>
<div class="row align-self-center">
</div>
`


///// Pages /////

function Page(headerName, contentName, setupFn, takedownFn, nextAction) {
	this.headerName = headerName
	this.contentName = contentName
	this.setup = setupFn
	this.takedown = takedownFn
	this.nextAction = nextAction

	this.productID = null
	this.productName = null
	if (headerName.startsWith("finch") || contentName.startsWith("finch")) {
		this.product = "FN"
		this.productName = "Finch"
	} else if (headerName.startsWith("hummingbird") || contentName.startsWith("hummingbird")) {
		this.product = "BB"
		this.productName = "Hummingbird"
	}
}
Page.prototype.show = function() {
	const header = sectionHeaders[this.headerName]
	const content = contents[this.contentName]

	if (header && content) {
		const headerDiv = document.getElementById("section-header")
		headerDiv.innerHTML = header

		const mainDiv = document.getElementById("main-content")
		mainDiv.innerHTML = content
	} else {
		console.error("Unknown section header '" + this.headerName + "' or content '" + this.contentName + "'.")
		document.getElementById("main-content").innerHTML = contents['comingSoon']
	}

	if (this.setup) { this.setup() }
}

function setupSuccess() {
	document.getElementById("section-header").classList.add("success")
}
function takedownSuccess() {
	document.getElementById("section-header").classList.remove("success")
}

const pages = {}

pages['home'] = new Page("welcome", "home", function() {
	document.getElementById("home-button").setAttribute("style", "visibility: hidden;")
}, function() {
	document.getElementById("home-button").setAttribute("style", "visibility: visible;")
})
pages['contactSupport'] = new Page("contactSupport", "contactSupport")

//finch pages
pages['finchHome'] = new Page("finch", "finchHome")

pages['finchMotors'] = new Page("finchMotors", "finchMotors1")
pages['finchMotors2'] = new Page("finchMotors", "finchMotors2")
pages['finchMotors3'] = new Page("finchMotors", "finchMotors3")
pages['finchMotors4'] = new Page("finchMotors", "finchMotors4", setupConnectionPage, null, function() {
	navigateTo("finchMotors5")
})
pages['finchMotors5'] = new Page("finchMotors", "finchMotors5", null, null, async function() {
	await testFinchMotors()
	navigateTo("finchMotors6")
})
pages['finchMotors6'] = new Page("finchMotors", "finchMotors6") 
pages['finchMotorsSuccess'] = new Page("success", "finchMotorsSuccess", function() {
	document.getElementById("section-header").classList.add("success")
}, function() {
	document.getElementById("section-header").classList.remove("success")
}) 

pages['finchPower'] = new Page("finchPower", "finchPower1")
pages['finchPower2'] = new Page("finchPower", "finchPower2")
pages['finchPower3'] = new Page("finchPower", "finchPower3")
pages['finchPower4'] = new Page("finchPower", "finchPower4")
pages['finchPowerSuccess'] = new Page("success", "finchPowerSuccess", setupSuccess, takedownSuccess)

pages['finchBluetooth'] = new Page("finchBluetooth", "bluetooth1", function() {
	document.getElementById("btn_not_on").setAttribute("onclick", "navigateTo('finchPower')")
	document.getElementById("btn_no_display").setAttribute("onclick", "navigateTo('finchBluetooth2')")
	document.getElementById("btn_ok").setAttribute("onclick", "navigateTo('finchBluetooth3')")
})
pages['finchBluetooth2'] = new Page("finchBluetooth", "bluetooth2", function() {
	document.getElementById("btn_success").setAttribute("onclick", "navigateTo('finchBluetoothSuccess')")
	document.getElementById("btn_fail").setAttribute("onclick", "navigateTo('finchBluetooth3')")
})
pages['finchBluetooth3'] = new Page("finchBluetooth", "bluetooth3", null, null, function() {
	navigateTo("finchBluetooth4")
})
pages['finchBluetooth4'] = new Page("finchBluetooth", "bluetooth4", checkRobotId)
pages['finchBluetoothSuccess'] = new Page("success", "finchBluetoothSuccess", setupSuccess, takedownSuccess)


pages['finchCode'] = new Page("finchCode", "comingSoon")
pages['finchLEDs'] = new Page("finchLEDs", "comingSoon")
pages['finchSensors'] = new Page("finchSensors", "comingSoon")

//hummingbird pages
pages['hummingbirdHome'] = new Page("hummingbird", "comingSoon")


///// Navigation /////

function navigateTo(pageName) {
	previousPages.push(currentPage) 
	document.getElementById("back-button").setAttribute("style", "visibility: visible;")

	let page = pages[pageName]
	if (!page) {
		console.error("Unknown page " + pageName)
		document.getElementById("main-content").innerHTML = contents['comingSoon']
		return
	}
	_showPage(page)
}

function navigateBack() {
	if (previousPages.length == 0) { return } //Should not happen

	let page = previousPages.pop()
	if (previousPages.length == 0) {
		document.getElementById("back-button").setAttribute("style", "visibility: hidden;")
	}

	_showPage(page)
}

function _showPage(page) {
	if (currentPage.takedown) { currentPage.takedown() }

	currentPage = page
	page.show()
}

///// Connections /////

function setupConnectionPage() {
	if (robots.length == 0) {
		document.getElementById("currentConnection").innerHTML = establishConnection
	} else {
		updateConnectedDevices()
	}
}

/* replaces function in gui.js */
function updateConnectedDevices() {
	if (robots.length == 0) { 
		setupConnectionPage() 
		return
	}

	let robot = robots[0]
	document.getElementById("currentConnection").innerHTML = currentlyConnectedTo
	document.getElementById("robotDetails").innerHTML = "<span>" + robot.fancyName + "</span>"

}

function changeRobot() {
	while (robots.length != 0) {
		let robot = robots.pop()
		robot.userDisconnect()
	}

	setupConnectionPage()
}

//Should we display the battery status?
function updateBatteryStatus() {}

// replacements for functions in gui.js. Maybe not needed?
function closeErrorModal() {}
function loadIDE() {}


///// Shared Test Functions /////

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function saveRobotId() {
	userRobotID = document.getElementById("robotID").value.toUpperCase()
	console.log("*** the user entered ID: " + userRobotID)
}

function checkRobotId() {
	let text = ""
	if (userRobotID.length != 7) {
		text = "You have entered " + userRobotID + ". This ID is " + userRobotID.length + " characters long. Your id must be 7 characters long. Please go back and try again."
	}
	let type = userRobotID.slice(0, 2)
	let codes = ["FN", "BB", "MB"]
	if (type != currentPage.productID) {
		if (codes.includes(type)) {
			text = "You have entered " + userRobotID + " which starts with " + type + ". Since this is not the correct code for " + currentPage.productName + ", this suggests that your micro:bit may not be seated correctly. Please remove and reinsert the micro:bit. Then go back and enter the new code."
		} else {
			text = "You have entered " + userRobotID + " which is an invalid code. Please go back and enter the correct code."
		}
	}

}

///// Finch Tests /////

async function testFinchMotors() {

  await timeout(500)

  let speed = 50
  let distance = 10
  
  await moveFinchAndWait(speed, speed, distance)
  await moveFinchAndWait(-speed, -speed, distance)
  await moveFinchAndWait(speed, -speed, distance)
  await moveFinchAndWait(-speed, speed, distance)

}

async function moveFinchAndWait(speedL, speedR, distance) {
  let robot = robots[0]
  let ticks = distance * FINCH_TICKS_PER_CM
  let wasMoving = robot.isMoving()
  let moveSentTime = new Date().getTime()
  let moveStartTimedOut = false
  let done = false
  
  robot.setMotors(speedL, ticks, speedR, ticks)

  while(!done) {
    await timeout(100)
    moveStartTimedOut = (new Date().getTime() > moveSentTime + 500);
    let isMoving = robot.isMoving()
    console.log("Waiting for move " + moveStartTimedOut + " " + isMoving + " " + wasMoving + " " + done)
    done = ((wasMoving || moveStartTimedOut) && !isMoving)
    wasMoving = isMoving
  }
}


////////End robot test app functions



///// Initialize State ///////

var currentPage = pages["home"]
const previousPages = []
currentPage.show()
