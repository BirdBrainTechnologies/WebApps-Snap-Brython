const useHID = false


const Colors = {}
//BBT Style guide colors
Colors.easternBlue = "#089BAB"; //bbt blue
Colors.neonCarrot = "#FF9922";
Colors.fountainBlue = "#62BCC7"; //lighter blue
Colors.seance = "#881199"; //dark purple
Colors.bbtDarkGray = "#535353";
Colors.iron = "#CACACA";

/*
<span id="downloadFirmware" style="color: white;"> Having trouble connecting? Download the latest firmware <a href="https://learn.birdbraintechnologies.com/downloads/installers/BBTFirmware.hex" style="color: #ff9922;">here</a>. For detailed installation instructions view steps 2 and 3 of this <a href="https://learn.birdbraintechnologies.com/finch/finchblox/program/1-1" style="color: #ff9922;">tutorial</a>.</span>
*/

///// Section Headers /////

const sectionHeaders = {}

sectionHeaders['welcome'] = "<h1>Welcome to our support app!</h1>"

sectionHeaders['finch'] = "<h1>Finch Robot Support</h1>"

sectionHeaders['hummingbird'] = "<h1>Hummingbird Kit Support</h1>"


///// Reusable Elements /////

const subHeader = `<div class="row align-self-center"><h2>What seems to be the trouble?</h2></div>`
const findRobotsBn = `
<a id="find-button" class="btn btn-orange btn-lg" href="#" onclick="findAndConnect()">
	<span>Find Robots</span>
</a>
`

///// Contents /////

const contents = {}

contents["home"] =  `
<div class="row"><h2>Select your product</h2></div>
<div class="row">
	<div class="col-sm-6">
		<a class="btn btn-orange btn-lg" aria-label="finch" href="#" onclick="navigateTo('finchHome')">
			<span>Finch Robot</span>
		</a>
	</div>
	<div class="col-sm-6">
		<a id="hummingbirdBn" class="btn btn-orange btn-lg" aria-label="hummingbird" href="#" onclick="navigateTo('hummingbirdHome')">
			<span>Hummingbird Kit</span>
		</a>
	</div>
</div>
`
contents["comingSoon"] = `
<div class="row"><h2>Support for this topic is coming soon</h2></div>
`
contents["finchHome"] = subHeader + `
<div class="row align-self-center">
	<div class="col-sm-4">
		<a class="btn btn-orange btn-lg" aria-label="power" href="#" onclick="navigateTo('finchPower')" style="width: 200px;">
			<span>Power</span>
		</a>
	</div>
	<div class="col-sm-4">
		<a class="btn btn-orange btn-lg" aria-label="bluetooth" href="#" onclick="navigateTo('finchBluetooth')" style="width: 200px;">
			<span>Bluetooth</span>
		</a>
	</div>
	<div class="col-sm-4">
		<a class="btn btn-orange btn-lg" aria-label="code" href="#" onclick="navigateTo('finchCode')" style="width: 200px;">
			<span>Code</span>
		</a>
	</div>
</div>
<div class="row align-self-center">
	<div class="col-sm-4">
		<a class="btn btn-orange btn-lg" aria-label="motors or wheels" href="#" onclick="navigateTo('finchWheels')" style="width: 200px;">
			<span>Motors/Wheels</span>
		</a>
	</div>
	<div class="col-sm-4">
		<a class="btn btn-orange btn-lg" aria-label="L E D's" href="#" onclick="navigateTo('finchLEDs')" style="width: 200px;">
			<span>LEDs</span>
		</a>
	</div>
	<div class="col-sm-4">
		<a class="btn btn-orange btn-lg" aria-label="sensors" href="#" onclick="navigateTo('finchSensors')" style="width: 200px;">
			<span>Sensors</span>
		</a>
	</div>
</div>
<div class="row align-self-center">
</div>
`

///// Pages /////

function Page(headerName, contentName, setupFn) {
	this.headerName = headerName
	this.contentName = contentName
	this.setup = setupFn
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
		console.error("Unknown section header '" + headerName + "' or content '" + contentName + "'.")
		document.getElementById("main-content").innerHTML = contents['comingSoon']
	}

	if (this.setup) { this.setup() } //TODO: Remove setup var?
}

const pages = {}

pages['home'] = new Page("welcome", "home", function() {})

pages['finchHome'] = new Page("finch", "finchHome")

pages['hummingbirdHome'] = new Page("hummingbird", "comingSoon")


///// Navigation /////

function navigateTo(pageName) {
	previousPages.push(currentPage) 
	currentPage = pageName
	document.getElementById("back-button").setAttribute("style", "visibility: visible;")

	_showPage(pageName)
}

function navigateBack() {
	let pageName = previousPages.pop()
	currentPage = pageName
	if (previousPages.length == 0) {
		document.getElementById("back-button").setAttribute("style", "visibility: hidden;")
	}

	_showPage(pageName)
}

function _showPage(pageName) {
	let page = pages[pageName]

	if (!page) {
		console.error("Unknown page " + pageName)
		document.getElementById("main-content").innerHTML = contents['comingSoon']
		return
	}
	
	page.show()
}


///// Initialize State ///////

var currentPage = "home"
const previousPages = []
pages[currentPage].show()
