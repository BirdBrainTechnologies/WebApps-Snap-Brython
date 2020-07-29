###############################################################
###############################################################
# Author                  Raghunath J, revised by Bambi Brewer
#                         and Kristina Lauwers
# Last Edit Date          11/20/2019
# Description             This python file contains Microbit,
# Hummingbird, and Finch classes.
# The Microbit class controls a micro:bit via bluetooth. It
# includes methods to print on the micro:bit LED array or set
# those LEDs individually. It also contains methods to read the
# values of the micro:bit accelerometer and magnetometer.
# The Hummingbird class extends the Microbit class to incorporate
# functions to control the inputs and outputs of the Hummingbird
# Bit. It includes methods to set the values of motors and LEDs,
# as well as methods to read the values of the sensors.
# The Finch class also extends the Microbit class. This class
# similarly includes function to control the inputs and outputs
# of the Finch robot.
###############################################################
###############################################################
import sys
import time
from browser import window, aio
###############################################################
###############################################################
#Constants

#Time to wait to make sure the value read from the sensor is recent
WAIT_BEFORE_SENSOR_READ = 0.05

#Calculations after receiving the raw values for Hummingbird
DISTANCE_FACTOR          = 117/100
SOUND_FACTOR             = 200/255
DIAL_FACTOR              = 100/230
LIGHT_FACTOR             = 100/255
VOLTAGE_FACTOR            = 3.3/255

#Scaling factors for Finch
FINCH_DISTANCE = 0.0919
TICKS_PER_ROTATION = 792

TEMPO                      = 60

###############################################################

class Microbit:
    """Microbit Class includes the control of the outputs and inputs
    present on the micro:bit."""

    symbolvalue      =  None


    #######################   UTILITY FUNCTIONS   ###########################


    def __init__(self, device = 'A'):
        """Called when the class is initialized."""

        #Check if the letter of the device is valid, exit otherwise
        if('ABC'.find(device) != -1):
            self.device_s_no = device

            # Check if the device is connected
            if not self.isConnectionValid():
                sys.exit()

            # Check if the device is the correct type
            if not self._robotIsThisType():
                print("Error: Device " + str(self.device_s_no) + " is not a " + str(self.__class__.__name__))
                self.stopAll()
                sys.exit()

            self.symbolvalue = [0]*25
            self.buttonShakeIndex = 7
            if (str(self.__class__.__name__) == "Finch"):
                self.buttonShakeIndex = 16
                self.currentBeak = [0]*3 # the current state of the finch beak is needed to calculate light sensor values

        else:
            print("Error: Device must be A, B, or C.")
            sys.exit()


    def isConnectionValid(self):
        """This function tests a connection. Return true if the connection is
        good and false otherwise."""

        if(window.birdbrain.isConnected[self.device_s_no]):
            return True

        print("Error: Device " + str(self.device_s_no) + " is not connected")
        return False


    #def isMicrobit(self):
    def _robotIsThisType(self):
        """This function determines whether or not the device is a micro:bit."""
        return (window.birdbrain.robotType[self.device_s_no] == window.birdbrain.robotType.MICROBIT)


    @staticmethod
    def _clampParametersToBounds(input, inputMin, inputMax):
        """This function checks whether an input parameter is within the
        given bounds. If not, it prints a warning and returns a value of the
        input parameter that is within the required range. Otherwise, it
        just returns the initial value."""

        if ((input < inputMin) or (input > inputMax)):
            print("Warning: Please choose a parameter between " + str(inputMin) + " and " + str(inputMax))
            return max(inputMin, min(input, inputMax))
        else:
            return input


    @staticmethod
    def _process_display(value):
        """Convert a string of 1's and 0's into true and false."""

        new_str = ""
        for letter in value:
            if(letter == 0):
                new_str += "false/"
            else:                    #All nonzero values become true
                new_str += "true/"

        # Remove the last character in a string
        new_str = new_str[:len(new_str)-1]
        return new_str


    @staticmethod
    async def _sendCommand(command):
        window.birdbrain.sendCommand(command)
        #keep the backend from getting overloaded with commands
        await aio.sleep(0.01)


    #######################  OUTPUTS MICRO BIT ###########################


    async def setDisplay(self, LEDlist):
        """Set Display of the LED Array on microbit with the given input LED
        list of 0's and 1's."""

        #Check if LED_string is valid to be printed on the display
        #Check if the length of the array to form a symbol not equal than 25
        if(len(LEDlist) != 25):
            print("Error: setDisplay() requires a list of length 25")
            return             # if the array is the wrong length, don't want to do anything else

        #Check if all the characters entered are valid
        for index in range(0,len(LEDlist)):
            LEDlist[index] = self._clampParametersToBounds(LEDlist[index],0,1)

        # Reset the display status
        self.symbolvalue = LEDlist

        #Convert the LED_list to  an appropriate value which the server can understand
        LED_string = self._process_display(LEDlist)

        await self._sendCommand({
            'robot': self.device_s_no,
            'cmd': "symbol",
            'symbolString': LED_string
        });


    async def print(self, message):
        """Print the characters on the LED screen."""

        # Warn the user about any special characters - we can mostly only print English characters and digits
        for letter in message:
            if not (((letter >= 'a') and (letter <= 'z')) or ((letter >= 'A') and (letter <= 'Z')) or ((letter >= '0') and (letter <= '9')) or (letter == ' ')):
                print("Warning: Many special characters cannot be printed on the LED display")

        # Empty out the internal representation of the display, since it will be blank when the print ends
        self.symbolvalue = [0]*25

        await self._sendCommand({
            'robot': self.device_s_no,
            'cmd': "print",
            'printString': message
        });


    async def setPoint(self, x , y , value):
        """Choose a certain LED on the LED Array and switch it on or off.
        The value specified should be 1 for on, 0 for off."""

        #Check if x, y and value are valid
        x = self._clampParametersToBounds(x,1,5)
        y = self._clampParametersToBounds(y,1,5)
        value = self._clampParametersToBounds(value,0,1)

        #Calculate which LED should be selected
        index = (x-1)*5 + (y-1)

        # Update the state of the LED displayf
        self.symbolvalue[index] = value

        #Convert the display status to  an appropriate value which the server can understand
        outputString = self._process_display(self.symbolvalue)

        #window.birdbrain.sendCommand({
        await self._sendCommand({
            'robot': self.device_s_no,
            'cmd': "symbol",
            'symbolString': outputString
        });


    ############################ INPUTS MICROBIT ###############################


    async def getAcceleration(self):
        """Gives the acceleration of X,Y,Z in m/sec2."""

        await aio.sleep(WAIT_BEFORE_SENSOR_READ)

        x = window.birdbrain.getMicrobitAcceleration('X', self.device_s_no)
        y = window.birdbrain.getMicrobitAcceleration('Y', self.device_s_no)
        z = window.birdbrain.getMicrobitAcceleration('Z', self.device_s_no)
        return (x, y, z)


    async def getCompass(self):
        """Returns values 0-359 indicating the orentation of the Earth's
        magnetic field."""

        await aio.sleep(WAIT_BEFORE_SENSOR_READ)

        return window.birdbrain.getMicrobitCompass(self.device_s_no)


    async def getMagnetometer(self):
        """Return the values of X,Y,Z of a magnetommeter."""

        await aio.sleep(WAIT_BEFORE_SENSOR_READ)

        x = window.birdbrain.getMicrobitMagnetometer('X', self.device_s_no)
        y = window.birdbrain.getMicrobitMagnetometer('Y', self.device_s_no)
        z = window.birdbrain.getMicrobitMagnetometer('Z', self.device_s_no)
        return (x, y, z)


    async def getButton(self,button):
        """Return the status of the button asked. Specify button 'A' or 'B'."""

        await aio.sleep(WAIT_BEFORE_SENSOR_READ)

        button = button.upper()
        #Check if the button A and button B are represented in a valid manner
        if((button != 'A') and (button != 'B')):
            print("Error: Button must be A or B.")
            sys.exit()

        buttonState = window.birdbrain.sensorData[self.device_s_no][self.buttonShakeIndex] & 0xF0
        if (button == 'A'):
            return (buttonState == 0x00 or buttonState == 0x20)
        else:
            return (buttonState == 0x00 or buttonState == 0x10)


    async def isShaking(self):
        """Return true if the device is shaking, false otherwise."""

        await aio.sleep(WAIT_BEFORE_SENSOR_READ)

        shake = window.birdbrain.sensorData[self.device_s_no][self.buttonShakeIndex];
        return ((shake & 0x01) > 0);


    async def getOrientation(self):
        """Return the orentation of the micro:bit. Options include:
        "Screen up", "Screen down", "Tilt left", "Tilt right", "Logo up",
        "Logo down", and "In between"."""

        await aio.sleep(WAIT_BEFORE_SENSOR_READ)

        orientations = ["Screen up","Screen down","Tilt left","Tilt right","Logo up","Logo down"]

        #Check for orientation of each device and if true return that state
        for targetOrientation in orientations:
            isCurrentOrientation = window.birdbrain.microbitOrientation(targetOrientation, self.device_s_no)
            if (isCurrentOrientation):
                return targetOrientation

        #If we are in a state in which none of the above seven states are true
        return "In between"


    async def stopAll(self):
        """Stop all device outputs (ie. Servos, LEDs, LED Array, Motors, etc.)."""

        await aio.sleep(0.1)
        await self._sendCommand({
            'robot': self.device_s_no,
            'cmd': "stopAll"
        })
        self.symbolvalue = [0]*25


    ######## END class Microbit ########


class Hummingbird(Microbit):
    """Hummingbird Bit Class includes the control of the outputs and inputs
        present on the Hummingbird Bit."""


    ######################  UTILITY FUNCTIONS ################################


    def _robotIsThisType(self):
        """This function determines whether or not the device is a Hummingbird."""
        return (window.birdbrain.robotType[self.device_s_no] == window.birdbrain.robotType.HUMMINGBIRDBIT)


    @staticmethod
    def __isPortValid(port, portMax):
        """This function checks whether a port is within the given bounds.
        It returns a boolean value that is either true or false and prints
        an error if necessary."""

        if ((port < 1) or (port > portMax)):
            print("Error: Please choose a port value between 1 and " + str(portMax))
            return False
        else:
            return True


    @staticmethod
    def _calculate_LED(intensity):
        """ Utility function to covert LED from 0-100 to 0-255."""

        intensity_c = int((intensity * 255) / 100) ;

        return intensity_c


    @staticmethod
    def _calculate_RGB(r_intensity, g_intensity, b_intensity):
        """Utility function to covert RGB LED from 0-100 to 0-255."""

        r_intensity_c   = int((r_intensity * 255) / 100) ;
        g_intensity_c   = int((g_intensity * 255) / 100) ;
        b_intensity_c    = int((b_intensity * 255) / 100) ;

        return (r_intensity_c,g_intensity_c,b_intensity_c)


    @staticmethod
    def __calculate_servo_p(servo_value):
        """Utility function to covert Servo from 0-180 to 0-255."""

        servo_value_c   = int((servo_value * 254)/180) ;

        return servo_value_c


    @staticmethod
    def __calculate_servo_r(servo_value):
        """Utility function to covert Servo from -100 - 100 to 0-255."""

        #If the vlaues are above the limits fix the instensity to maximum value,
        #if less than the minimum value fix the intensity to minimum value
        if ((servo_value>-10) and (servo_value<10)):
            servo_value_c = 255
        else:
            servo_value_c = int(( servo_value*23 /100) + 122)
        return servo_value_c


    ######################### HUMMINGBIRD BIT OUTPUT ###########################


    async def setLED(self, port, intensity):
        """Set LED  of a certain port requested to a valid intensity."""

        # Early return if we can't execute the command because the port is invalid
        if not self.__isPortValid(port,3):
            return

        #Check the intensity value lies with in the range of LED limits
        intensity = self._clampParametersToBounds(intensity,0,100)

        #Change the range from 0-100 to 0-255
        intensity_c = self._calculate_LED(intensity)

        await self._sendCommand({
            'robot': self.device_s_no,
            'cmd': "led",
            'port': port,
            'intensity': intensity_c
        })


    async def setTriLED(self, port, redIntensity, greenIntensity, blueIntensity):
        """Set TriLED  of a certain port requested to a valid intensity."""

        # Early return if we can't execute the command because the port is invalid
        if not self.__isPortValid(port,2):
            return

        #Check the intensity value lies with in the range of RGB LED limits
        red = self._clampParametersToBounds(redIntensity,0,100)
        green = self._clampParametersToBounds(greenIntensity,0,100)
        blue = self._clampParametersToBounds(blueIntensity,0,100)

        #Change the range from 0-100 to 0-255
        (r_intensity_c, g_intensity_c, b_intensity_c) = self._calculate_RGB(red,green,blue)

        await self._sendCommand({
            'robot': self.device_s_no,
            'cmd': "triled",
            'port': port,
            'red': r_intensity_c,
            'green': g_intensity_c,
            'blue': b_intensity_c
        });


    async def setPositionServo(self, port, angle):
        """Set Position servo of a certain port requested to a valid angle."""

        # Early return if we can't execute the command because the port is invalid
        if not self.__isPortValid(port,4):
            return

        #Check the angle lies within servo limits
        angle = self._clampParametersToBounds(angle,0,180)

        angle_c = self.__calculate_servo_p(angle)

        await self._sendCommand({
            'robot': self.device_s_no,
            'cmd': "servo",
            'port': port,
            'value': angle_c
        });


    async def setRotationServo(self, port, speed):
        """Set Rotation servo of a certain port requested to a valid speed."""

        # Early return if we can't execute the command because the port is invalid
        if not self.__isPortValid(port,4):
            return

        #Check the speed lies within servo limits
        speed = self._clampParametersToBounds(speed,-100,100)

        speed_c  = self.__calculate_servo_r(speed)

        await self._sendCommand({
            'robot': self.device_s_no,
            'cmd': "servo",
            'port': port,
            'value': speed_c
        });


    async def playNote(self, note, beats):
        """Make the buzzer play a note for certain number of beats."""

        ### Check that both parameters are within the required bounds
        note = self._clampParametersToBounds(note,32,135)
        beats = self._clampParametersToBounds(beats,0,16)

        beats = int(beats * (60000/TEMPO))

        await self._sendCommand({
            'robot': self.device_s_no,
            'cmd': "playNote",
            'note': note,
            'duration': beats
        })


    ########################### HUMMINGBIRD BIT INPUT ##########################


    async def getSensor(self,port):
        """Read the value of the sensor attached to a certain port.
        If the port is not valid, it returns -1."""

        await aio.sleep(WAIT_BEFORE_SENSOR_READ)

        # Early return if we can't execute the command because the port is invalid
        if not self.__isPortValid(port,3):
            return -1

        return window.birdbrain.sensorData[self.device_s_no][port - 1]


    async def getLight(self, port):
        """Read the value of the light sensor attached to a certain port."""

        response = await self.getSensor(port)
        light_value    = int(response * LIGHT_FACTOR)
        return light_value


    async def getSound(self, port):
        """Read the value of the sound sensor attached to a certain port."""

        response = await self.getSensor(port)
        sound_value    = int(response *SOUND_FACTOR)
        return sound_value


    async def getDistance(self, port):
        """Read the value of the distance sensor attached to a certain port."""

        response = await self.getSensor(port)
        distance_value    = int(response * DISTANCE_FACTOR)
        return distance_value


    async def getDial(self, port):
        """Read the value of the dial attached to a certain port."""

        response = await self.getSensor(port)
        dial_value    = int(response *DIAL_FACTOR)
        if(dial_value > 100):
            dial_value = 100
        return dial_value


    async def getVoltage(self, port):
        """Read the voltage of the sensor attached to a certain port."""

        response = await self.getSensor(port)
        voltage_value    = response *VOLTAGE_FACTOR
        return voltage_value


    ######## END class Hummingbird ########


class Finch(Microbit):
    """The Finch class includes the control of the outputs and inputs present
    in the Finch robot. When creating an instance, specify which robot by the
    device letter used in the BlueBirdConnector device list (A, B, or C)."""


    ######## Finch Utility Functions ########


    def _robotIsThisType(self):
        """Determine whether or not the device is a Finch"""
        return (window.birdbrain.robotType[self.device_s_no] == window.birdbrain.robotType.FINCH)


    @staticmethod
    def __calculate_RGB(r_intensity, g_intensity, b_intensity):
        """Utility function to covert RGB LED from 0-100 to 0-255"""
        r_intensity_c = int((r_intensity * 255) / 100)
        g_intensity_c = int((g_intensity * 255) / 100)
        b_intensity_c = int((b_intensity * 255) / 100)

        return (r_intensity_c, g_intensity_c, b_intensity_c)


    @staticmethod
    def __formatRightLeft(direction):
        """Utility function to format a selection of right or left for a backend request."""
        if direction == "R" or direction == "r" or direction == "Right" or direction == "right":
            return "Right"
        elif direction == "L" or direction == "l" or direction == "Left" or direction == "left":
            return "Left"
        else:
            print("Error: Please specify either 'R' or 'L' direction.")
            return None


    @staticmethod
    def __formatForwardBackward(direction):
        """Utility function to format a selection of forward or backward for a backend request."""
        if direction == "F" or direction == "f" or direction == "Forward" or direction == "forward":
            return "Forward"
        elif direction == "B" or direction == "b" or direction == "Backward" or direction == "backward":
            return "Backward"
        else:
            print("Error: Please specify either 'F' or 'B' direction.")
            return None


    ######## Finch Output ########


    async def __setTriLED(self, port, redIntensity, greenIntensity, blueIntensity):
        """Set TriLED(s) on the Finch.
        Port 1 is the beak. Ports 2 to 5 are tail. Specify port "all" to set the whole tail."""

        #Early return if we can't execute the command because the port is invalid
        if ((not port == "all") and ((port < 1) or (port > 5))):
                return 0

        #Check the intensity value lies with in the range of RGB LED limits
        red = self._clampParametersToBounds(redIntensity,0,100)
        green = self._clampParametersToBounds(greenIntensity,0,100)
        blue = self._clampParametersToBounds(blueIntensity,0,100)

        #Change the range from 0-100 to 0-255
        (red_c, green_c, blue_c) = self.__calculate_RGB(red,green,blue)

        await self._sendCommand({
            'robot': self.device_s_no,
            'cmd': "triled",
            'port': port,
            'red': red_c,
            'green': green_c,
            'blue': blue_c}
        )


    async def setBeak(self, redIntensity, greenIntensity, blueIntensity):
        """Set beak to a valid intensity. Each intensity should be an integer from 0 to 100."""

        self.currentBeak = [redIntensity, greenIntensity, blueIntensity]
        await self.__setTriLED(1, redIntensity, greenIntensity, blueIntensity)


    async def setTail(self, port, redIntensity, greenIntensity, blueIntensity):
        """Set tail to a valid intensity. Port can be specified as 1, 2, 3, 4, or all.
        Each intensity should be an integer from 0 to 100."""

        #Triled port 1 is the beak. Tail starts counting at 2
        if not port == "all":
                port = port + 1

        await self.__setTriLED(port, redIntensity, greenIntensity, blueIntensity)


    async def playNote(self, note, beats):
        """Make the buzzer play a note for certain number of beats. Note is the midi
        note number and should be specified as an integer from 32 to 135. Beats can be
        any number from 0 to 16."""

        #Check that both parameters are within the required bounds
        note = self._clampParametersToBounds(note, 32, 135)
        beats = self._clampParametersToBounds(beats, 0, 16)

        beats = int(beats * (60000/TEMPO))

        await self._sendCommand({
            'robot': self.device_s_no,
            'cmd': "playNote",
            'note': note,
            'duration': beats
        })


    async def __moveFinchAndWait(self, command):
        """Send a command to move the finch and wait until the finch has finished
        its motion to return. Used by setMove and setTurn."""

        isMoving = window.birdbrain.finchIsMoving(self.device_s_no)
        wasMoving = isMoving
        commandSendTime = time.time()
        done = False

        await self._sendCommand(command)

        #while (not((wasMoving) and (not isMoving)) and self.isConnectionValid()):
        while (not(done) and self.isConnectionValid()):
            wasMoving = isMoving
            await aio.sleep(0.01)
            isMoving = window.birdbrain.finchIsMoving(self.device_s_no)
            done = ((time.time() > commandSendTime + 0.5) or wasMoving) and (not isMoving)


    async def setMove(self, direction, distance, speed):
        """Move the Finch forward or backward for a given distance at a given speed.
        Direction should be specified as 'F' or 'B' and distance and speed should
        be given as integers."""

        direction = self.__formatForwardBackward(direction)
        if direction is None:
                return 0

        distance = self._clampParametersToBounds(distance, -10000, 10000)
        speed =  self._clampParametersToBounds(speed, 0, 100)

        await self.__moveFinchAndWait({
            'robot': self.device_s_no,
            'cmd': "move",
            'direction': direction,
            'distance': distance,
            'speed': speed
        })


    async def setTurn(self, direction, angle, speed):
        """Turn the Finch right or left to a given angle at a given speed.
        Direction should be specified as 'R' or 'L' and angle and speed should
        be given as integers."""

        direction = self.__formatRightLeft(direction)
        if direction is None:
                return 0

        angle =  self._clampParametersToBounds(angle, -360000, 360000)
        speed =  self._clampParametersToBounds(speed, 0, 100)

        await self.__moveFinchAndWait({
            'robot': self.device_s_no,
            'cmd': "turn",
            'direction': direction,
            'angle': angle,
            'speed': speed
        })


    async def setMotors(self, leftSpeed, rightSpeed):
        """Set the speed of each motor individually. Speed should be an integer in
        the range of -100 to 100."""

        leftSpeed = self._clampParametersToBounds(leftSpeed, -100, 100)
        rightSpeed = self._clampParametersToBounds(rightSpeed, -100, 100)

        await self._sendCommand({
            'robot': self.device_s_no,
            'cmd': "wheels",
            'speedL': leftSpeed,
            'speedR': rightSpeed
        })


    async def stop(self):
        """Stop the Finch motors."""

        await self._sendCommand({
            'robot': self.device_s_no,
            'cmd': "stopFinch"
        })


    async def resetEncoders(self):
        """Reset both encoder values to 0."""

        await self._sendCommand({
            'robot': self.device_s_no,
            'cmd': "resetEncoders"
        })
        #the finch needs a little time to reset
        await aio.sleep(0.1)


    ######## Finch Inputs ########


    async def getLight(self, direction):
        """Read the value of the right or left light sensor ('R' or 'L')."""

        await aio.sleep(WAIT_BEFORE_SENSOR_READ)

        direction = self.__formatRightLeft(direction)
        R = self.currentBeak[0]
        G = self.currentBeak[1]
        B = self.currentBeak[2]
        rawLight = 0
        correction = 0
        if direction == "Right":
            rawLight = window.birdbrain.sensorData[self.device_s_no][3];
            correction = 6.40473070e-03*R + 1.41015162e-02*G + 5.05547817e-02*B + 3.98301391e-04*R*G + 4.41091223e-04*R*B + 6.40756862e-04*G*B + -4.76971242e-06*R*G*B
        elif direction == "Left":
            rawLight = window.birdbrain.sensorData[self.device_s_no][2];
            correction = 1.06871493e-02*R + 1.94526614e-02*G + 6.12409825e-02*B + 4.01343475e-04*R*G + 4.25761981e-04*R*B + 6.46091068e-04*G*B + -4.41056971e-06*R*G*B
        else:
            return 0

        return round(max(0, min((rawLight - correction), 100)))


    async def getDistance(self):
        """Read the value of the distance sensor"""

        await aio.sleep(WAIT_BEFORE_SENSOR_READ)

        msb = window.birdbrain.sensorData[self.device_s_no][0];
        lsb = window.birdbrain.sensorData[self.device_s_no][1];
        distance = msb << 8 | lsb

        return int(distance * FINCH_DISTANCE)


    async def getLine(self, direction):
        """Read the value of the right or left line sensor ('R' or 'L').
        Returns brightness as a value 0-100 where a larger number
        represents more reflected light."""

        await aio.sleep(WAIT_BEFORE_SENSOR_READ)

        direction = self.__formatRightLeft(direction)
        value = 0
        if direction == "Right":
            value = window.birdbrain.sensorData[self.device_s_no][5];
        elif direction == "Left":
            value = window.birdbrain.sensorData[self.device_s_no][4];
            #first bit is for position control
            value = (0x7F & value)

        return (100 - value)


    async def getEncoder(self, direction):
        """Read the value of the right or left encoder ('R' or 'L').
        Values are returned in rotations."""

        await aio.sleep(WAIT_BEFORE_SENSOR_READ)

        direction = self.__formatRightLeft(direction)
        if direction is None:
            return 0

        msb = 0
        ssb = 0
        lsb = 0
        if direction == "Right":
            msb = window.birdbrain.sensorData[self.device_s_no][10];
            ssb = window.birdbrain.sensorData[self.device_s_no][11];
            lsb = window.birdbrain.sensorData[self.device_s_no][12];
        elif direction == "Left":
            msb = window.birdbrain.sensorData[self.device_s_no][7];
            ssb = window.birdbrain.sensorData[self.device_s_no][8];
            lsb = window.birdbrain.sensorData[self.device_s_no][9];

        encoder = msb << 16 | ssb << 8 | lsb

        if encoder >= 0x800000: #if the number is negative, do a two's complement conversion
            tmp = encoder.to_bytes(3, byteorder=sys.byteorder, signed=False)
            encoder = int.from_bytes(tmp, byteorder=sys.byteorder, signed=True)

        #convert value to rotations and round to two decimal places.
        encoder_value = round(float(encoder)/TICKS_PER_ROTATION, 2)
        return encoder_value


    # The following methods override those within the Microbit
    # class to return values within the Finch reference frame.

    async def getAcceleration(self):
        """Gives the acceleration of X,Y,Z in m/sec2, relative
        to the Finch's position."""

        await aio.sleep(WAIT_BEFORE_SENSOR_READ)

        x = window.birdbrain.getFinchAcceleration('X', self.device_s_no)
        y = window.birdbrain.getFinchAcceleration('Y', self.device_s_no)
        z = window.birdbrain.getFinchAcceleration('Z', self.device_s_no)
        return (x, y, z)

    async def getCompass(self):
        """Returns values 0-359 indicating the orentation of the Earth's
        magnetic field, relative to the Finch's position."""

        await aio.sleep(WAIT_BEFORE_SENSOR_READ)

        return window.birdbrain.getFinchCompass(self.device_s_no)


    async def getMagnetometer(self):
        """Return the values of X,Y,Z of a magnetommeter, relative to the Finch's position."""

        await aio.sleep(WAIT_BEFORE_SENSOR_READ)

        x = window.birdbrain.getFinchMagnetometer('X', self.device_s_no)
        y = window.birdbrain.getFinchMagnetometer('Y', self.device_s_no)
        z = window.birdbrain.getFinchMagnetometer('Z', self.device_s_no)
        return (x, y, z)


    async def getOrientation(self):
        """Return the orentation of the Finch. Options include:
        "Beak up", "Beak down", "Tilt left", "Tilt right", "Level",
        "Upside down", and "In between"."""

        await aio.sleep(WAIT_BEFORE_SENSOR_READ)

        orientations = ["Beak up","Beak down","Tilt left","Tilt right","Level","Upside down"]

        #Check for orientation of each device and if true return that state
        for targetOrientation in orientations:
            isCurrentOrientation = window.birdbrain.finchOrientation(targetOrientation, self.device_s_no)
            if (isCurrentOrientation):
                return targetOrientation

        #If we are in a state in which none of the above seven states are true
        return "In between"


    ######## END class Finch ########
