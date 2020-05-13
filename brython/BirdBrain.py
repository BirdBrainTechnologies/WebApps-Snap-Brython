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
#import urllib.request
import sys
#import time
from browser import window, timer, aio
###############################################################
###############################################################
#Constants

CHAR_FLASH_TIME = 0.3        #Character Flash time

# Error strings
CONNECTION_SERVER_CLOSED = "Error: Request to device failed"
NO_CONNECTION = "Error: The device is not connected"

#Calculations after receveing the raw values for Hummingbird
DISTANCE_FACTOR          = 117/100
SOUND_FACTOR             = 200/255
DIAL_FACTOR              = 100/230
#LIGHT_FACTOR             = 100/255 #also used for Finch -> handled in backend?
VOLTAGE_FACTOR            = 3.3/255

#Scaling factors for Finch
FINCH_DISTANCE = 0.0919
BATTERY_FACTOR = 0.0406

TEMPO                      = 60

###############################################################

class Microbit:
    """Microbit Class includes the control of the outputs and inputs
    present on the micro:bit."""

    symbolvalue      =  None


    ##################################################################################
    #######################     UTILITY FUNCTIONS      ###############################
    ##################################################################################



    def __init__(self, device = 'A'):
        """Called when the class is initialized."""

        #Check if the letter of the device is valid, exit otherwise
        if('ABC'.find(device) != -1):
            self.device_s_no = device
            self.buttonShakeIndex = 7
            # Check if the device is connected and if it is a micro:bit
            if not self.isConnectionValid():
                self.stopAll()
                sys.exit()

            if not self.isMicrobit():        # it isn't a micro:bit
                print("Error: Device " + str(self.device_s_no) + " is not a micro:bit")
                self.stopAll()
                sys.exit()

            self.symbolvalue = [0]*25
        else:
            print("Error: Device must be A, B, or C.")
            #self.stopAll()
            sys.exit()


    def isConnectionValid(self):
        """This function tests a connection. Return true if the connection is
        good and false otherwise."""

        if(window.birdbrain.isConnected[self.device_s_no]):
            return True

        print("Error: Device " + str(self.device_s_no) + " is not connected")
        return False


    def isMicrobit(self):
        """This function determines whether or not the device is a micro:bit."""
        return (window.birdbrain.robotType[self.device_s_no] == window.birdbrain.robotType.MICROBIT)
        # http_request = self.base_request_in + "/isMicrobit/static/" + str(self.device_s_no)
        # response = self._send_httprequest(http_request)
        #
        # return (response == 'true')


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

    ######################################################################
    #######################  OUTPUTS MICRO BIT ###########################
    ######################################################################

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

        #window.birdbrain.sendCommand({
        await self._sendCommand({
            'robot': self.device_s_no,
            'cmd': "symbol",
            'symbolString': LED_string
        });
        #Send the http request
        # response = self.send_httprequest_micro("symbol",LED_string)
        # return response


    async def print(self, message):
        """Print the characters on the LED screen."""

        # Warn the user about any special characters - we can mostly only print English characters and digits
        for letter in message:
            if not (((letter >= 'a') and (letter <= 'z')) or ((letter >= 'A') and (letter <= 'Z')) or ((letter >= '0') and (letter <= '9')) or (letter == ' ')):
                print("Warning: Many special characters cannot be printed on the LED display")

        # Need to replace spaces with %20
#        message = message.replace(' ','%20')

        # Empty out the internal representation of the display, since it will be blank when the print ends
        self.symbolvalue = [0]*25

        #window.birdbrain.sendCommand({
        await self._sendCommand({
            'robot': self.device_s_no,
            'cmd': "print",
            'printString': message
        });
        #Send the http request
        # response = self.send_httprequest_micro("print",message)
        # return response


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
        #Send the http request
        # response = self.send_httprequest_micro("symbol",outputString)
        # return response


    ##############################################################################
    ############################## INPUTS MICROBIT ###############################
    ##############################################################################


    # def _getXYZvalues(self, sensor, intResult):
    #     """Return the X, Y, and Z values of the given sensor."""
    #
    #     dimension = ['X','Y','Z']
    #     values = []
    #
    #     for i in range(0,3):
    #         #Send HTTP request
    #         response = self.send_httprequest_micro_in(sensor, dimension[i])
    #         if intResult:
    #             values.append(int(response))
    #         else:
    #             values.append(round(float(response), 3))
    #
    #     return (values[0],values[1],values[2])


    def getAcceleration(self):
        """Gives the acceleration of X,Y,Z in m/sec2."""

        x = window.birdbrain.getMicrobitAcceleration('X', self.device_s_no)
        y = window.birdbrain.getMicrobitAcceleration('Y', self.device_s_no)
        z = window.birdbrain.getMicrobitAcceleration('Z', self.device_s_no)
        return (x, y, z)
#        return self._getXYZvalues("Accelerometer", False)


    def getCompass(self):
        """Returns values 0-359 indicating the orentation of the Earth's
        magnetic field."""

        return window.birdbrain.getMicrobitCompass(self.device_s_no)
        #Send HTTP request
        # response = self.send_httprequest_micro_in("Compass",None)
        # compass_heading = int(response)
        # return compass_heading


    def getMagnetometer(self):
        """Return the values of X,Y,Z of a magnetommeter."""

        x = window.birdbrain.getMicrobitMagnetometer('X', self.device_s_no)
        y = window.birdbrain.getMicrobitMagnetometer('Y', self.device_s_no)
        z = window.birdbrain.getMicrobitMagnetometer('Z', self.device_s_no)
        return (x, y, z)
#        return self._getXYZvalues("Magnetometer", True)


    def getButton(self,button):
        """Return the status of the button asked. Specify button 'A' or 'B'."""

        button = button.upper()
        #Check if the button A and button B are represented in a valid manner
        if((button != 'A') and (button != 'B')):
            sys.exit()

        buttonState = window.birdbrain.sensorData[self.device_s_no][self.buttonShakeIndex] & 0xF0
        if (button == 'A'):
            return (buttonState == 0x00 or buttonState == 0x20)
        else:
            return (buttonState == 0x00 or buttonState == 0x10)
        #Send HTTP request
        # response = self.send_httprequest_micro_in("button", button)
        # #Convert to boolean form
        # if(response == "true"):
        #     button_value = True
        # else:
        #     button_value = False
        #
        # return button_value


    def isShaking(self):
        """Return true if the device is shaking, false otherwise."""

        shake = window.birdbrain.sensorData[self.device_s_no][self.buttonShakeIndex];
        return ((shake & 0x01) > 0);
        #Send HTTP request
        # response = self.send_httprequest_micro_in("Shake",None)
        # if(response == "true"):        # convert to boolean
        #     shake = True
        # else:
        #     shake = False
        #
        # return shake


    def getOrientation(self):
        """Return the orentation of the micro:bit. Options include:
        "Screen up", "Screen down", "Tilt left", "Tilt right", "Logo up",
        "Logo down", and "In between"."""

        # orientations = ["Screen%20Up","Screen%20Down","Tilt%20Left","Tilt%20Right","Logo%20Up","Logo%20Down"]
        # orientation_result = ["Screen up","Screen down","Tilt left","Tilt right","Logo up","Logo down"]
        orientations = ["Screen Up","Screen Down","Tilt Left","Tilt Right","Logo Up","Logo Down"]

        #Check for orientation of each device and if true return that state
        for targetOrientation in orientations:
            isCurrentOrientation = window.birdbrain.microbitOrientation(targetOrientation, self.device_s_no)
            if (isCurrentOrientation):
                return targetOrientation
            # response = self.send_httprequest_micro_in(targetOrientation,None)
            # if(response == "true"):
            #     return orientation_result[orientations.index(targetOrientation)]

        #If we are in a state in which none of the above seven states are true
        return "In between"


    async def stopAll(self):
        """Stop all device outputs (ie. Servos, LEDs, LED Array, Motors, etc.)."""

        #time.sleep(0.1)         # Hack to give stopAll() time to act before the end of a program
        #response = self.send_httprequest_stopAll()
        #self.symbolvalue = [0]*25
        #return response
        await aio.sleep(0.1)
        await self._sendCommand({
            'robot': self.device_s_no,
            'cmd': "stopAll"
        })
        self.symbolvalue = [0]*25


    ##########################################################################
    ####################### SEND HTTP REQUESTS ###############################
    ##########################################################################

    # def _send_httprequest(self, http_request):
    #     """Send an HTTP request and return the result."""
    #     try :
    #         response_request =  urllib.request.urlopen(http_request)
    #     except:
    #         print(CONNECTION_SERVER_CLOSED)
    #         sys.exit();
    #
    #     response = response_request.read().decode('utf-8')
    #     if(response == "Not Connected"):
    #         print(NO_CONNECTION)
    #         sys.exit()
    #
    #     time.sleep(0.01)        # Hack to prevent http requests from overloading the BlueBird Connector
    #     return response


    # def send_httprequest_micro(self, peri , value):
    #     """Utility function to arrange and send the http request for microbit output functions."""
    #
    #     #Print command
    #     if(peri == "print"):
    #         http_request = self.base_request_out + "/" + peri +  "/" + str(value)   + "/" + str(self.device_s_no)
    #     elif(peri == "symbol"):
    #         http_request = self.base_request_out + "/" + peri +  "/"  + str(self.device_s_no)  + "/" + str(value)
    #     try :
    #         response_request =  urllib.request.urlopen(http_request)
    #         if(response_request.read() == b'200'):
    #             response = 1
    #         else :
    #             response = 0
    #     except:
    #         print(CONNECTION_SERVER_CLOSED)
    #         sys.exit()
    #     time.sleep(0.01)        # Hack to prevent http requests from overloading the BlueBird Connector
    #     return response


    # def send_httprequest_micro_in(self, peri , value):
    #     """Utility function to arrange and send the http request for microbit input functions."""
    #
    #     if(peri == "Accelerometer"):
    #         http_request = self.base_request_in + "/" + peri +  "/" + str(value)   + "/" + str(self.device_s_no)
    #     elif(peri == "Compass"):
    #         http_request = self.base_request_in + "/" + peri + "/" + str(self.device_s_no)
    #     elif(peri == "Magnetometer"):
    #         http_request = self.base_request_in + "/" + peri + "/" + str(value)   + "/"+str(self.device_s_no)
    #     elif(peri == "button"):
    #         http_request = self.base_request_in + "/" + peri + "/" + str(value)   + "/"+str(self.device_s_no)
    #     elif(peri == "Shake"):
    #         http_request = self.base_request_in + "/" + "orientation" + "/" + peri + "/" +str(self.device_s_no)
    #     elif(peri == "Screen%20Up"):
    #         http_request = self.base_request_in + "/" + "orientation" + "/" + peri + "/" +str(self.device_s_no)
    #     elif(peri == "Screen%20Down"):
    #         http_request = self.base_request_in + "/" + "orientation" + "/" + peri + "/" +str(self.device_s_no)
    #     elif(peri == "Tilt%20Right"):
    #         http_request = self.base_request_in + "/" + "orientation" + "/" + peri + "/" +str(self.device_s_no)
    #     elif(peri == "Tilt%20Left"):
    #         http_request = self.base_request_in + "/" + "orientation" +  "/" + peri + "/" +str(self.device_s_no)
    #     elif(peri == "Logo%20Up"):
    #         http_request = self.base_request_in + "/" + "orientation" + "/" + peri + "/" +str(self.device_s_no)
    #     elif(peri == "Logo%20Down"):
    #         http_request = self.base_request_in + "/" + "orientation" + "/" + peri + "/" +str(self.device_s_no)
    #     else:
    #         http_request = self.base_request_in + "/" + peri +  "/" + str(value)   + "/" + str(self.device_s_no)
    #
    #     try :
    #         response_request =  urllib.request.urlopen(http_request)
    #     except:
    #         print(CONNECTION_SERVER_CLOSED)
    #         sys.exit();
    #     response = response_request.read().decode('utf-8')
    #     if(response == "Not Connected"):
    #         print(NO_CONNECTION)
    #         sys.exit()
    #     time.sleep(0.01)        # Hack to prevent http requests from overloading the BlueBird Connector
    #     return response


    # def send_httprequest_stopAll(self):
    #     """Send HTTP request for hummingbird bit output."""
    #
    #     #Combine diffrenet strings to form a HTTP request
    #     http_request = self.stopall + "/" +str(self.device_s_no)
    #     try :
    #         response_request =  urllib.request.urlopen(http_request)
    #     except:
    #         print(CONNECTION_SERVER_CLOSED)
    #         sys.exit();
    #     if(response_request.read() == b'200'):
    #         response = 1
    #     else :
    #         response = 0
    #     time.sleep(0.01)        # Hack to prevent http requests from overloading the BlueBird Connector
    #     return response

    ######## END class Microbit ########


class Hummingbird(Microbit):
    """Hummingbird Bit Class includes the control of the outputs and inputs
        present on the Hummingbird Bit."""

    ##########################################################################
    ######################  UTILITY FUNCTIONS ################################
    ##########################################################################

    def __init__(self , device = 'A'):
        """Class initializer. Specify device letter A, B or C."""

        #Check if the length of the array to form a symbol is greater than 25"""
        if('ABC'.find(device) != -1):
            self.device_s_no = device
            self.buttonShakeIndex = 7
            # Check if device is connected and is a hummingbird
            if not self.isConnectionValid():
                self.stopAll()
                sys.exit()
            if not self.isHummingbird():
                print("Error: Device " + str(self.device_s_no) + " is not a Hummingbird")
                self.stopAll()
                sys.exit()
            self.symbolvalue = [0]*25
        else:
            self.stopAll()
            sys.exit()


    def isHummingbird(self):
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


    ##############################################################################
    ########################### HUMMINGBIRD BIT OUTPUT ###########################
    ##############################################################################


    async def setLED(self, port, intensity):
        """Set LED  of a certain port requested to a valid intensity."""

        # Early return if we can't execute the command because the port is invalid
        if not self.__isPortValid(port,3):
            return

        #Check the intensity value lies with in the range of LED limits
        intensity = self._clampParametersToBounds(intensity,0,100)

        #Change the range from 0-100 to 0-255
        intensity_c = self._calculate_LED(intensity)

        #window.birdbrain.sendCommand({
        await self._sendCommand({
            'robot': self.device_s_no,
            'cmd': "led",
            'port': port,
            'intensity': intensity_c
        })
        #Send HTTP request
#        response    = self.send_httprequest("led" , port , intensity_c)
#        return response



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

        #window.birdbrain.sendCommand({
        await self._sendCommand({
            'robot': self.device_s_no,
            'cmd': "triled",
            'port': port,
            'red': r_intensity_c,
            'green': g_intensity_c,
            'blue': b_intensity_c
        });
        #Send HTTP request
#        response = self.send_httprequest("triled" , port , str(r_intensity_c)+ "/" + str(g_intensity_c) +"/" + str(b_intensity_c))
#        return response


    async def setPositionServo(self, port, angle):
        """Set Position servo of a certain port requested to a valid angle."""

        # Early return if we can't execute the command because the port is invalid
        if not self.__isPortValid(port,4):
            return

        #Check the angle lies within servo limits
        angle = self._clampParametersToBounds(angle,0,180)

        angle_c = self.__calculate_servo_p(angle)

        #window.birdbrain.sendCommand({
        await self._sendCommand({
            'robot': self.device_s_no,
            'cmd': "servo",
            'port': port,
            'value': angle_c
        });
        #Send HTTP request
#        response = self.send_httprequest("servo" , port , angle_c)
#        return response


    async def setRotationServo(self, port, speed):
        """Set Rotation servo of a certain port requested to a valid speed."""

        # Early return if we can't execute the command because the port is invalid
        if not self.__isPortValid(port,4):
            return

        #Check the speed lies within servo limits
        speed = self._clampParametersToBounds(speed,-100,100)

        speed_c  = self.__calculate_servo_r(speed)

        #window.birdbrain.sendCommand({
        await self._sendCommand({
            'robot': self.device_s_no,
            'cmd': "servo",
            'port': port,
            'value': speed_c
        });
        #Send HTTP request
#        response = self.send_httprequest("rotation", port, speed_c)
#        return response


    async def playNote(self, note, beats):
        """Make the buzzer play a note for certain number of beats."""

        ### Check that both parameters are within the required bounds
        note = self._clampParametersToBounds(note,32,135)
        beats = self._clampParametersToBounds(beats,0,16)

        beats = int(beats * (60000/TEMPO))

        #window.birdbrain.sendCommand({
        await self._sendCommand({
            'robot': self.device_s_no,
            'cmd': "playNote",
            'note': note,
            'duration': beats
        })
        #Send HTTP request
#        response = self.send_httprequest_buzzer(note, beats)
#        return response


    ############################################################################
    ########################### HUMMINGBIRD BIT INPUT ##########################
    ############################################################################

    def getSensor(self,port):
        """Read the value of the sensor attached to a certain port.
        If the port is not valid, it returns -1."""

        # Early return if we can't execute the command because the port is invalid
        if not self.__isPortValid(port,3):
            return -1

        return window.birdbrain.sensorData[self.device_s_no][port - 1]
#        response       = self.send_httprequest_in("sensor",port)
#        return response


    def getLight(self, port):
        """Read the value of the light sensor attached to a certain port."""

        response = self.getSensor(port)
        light_value    = int(response * LIGHT_FACTOR)
        return light_value


    def getSound(self, port):
        """Read the value of the sound sensor attached to a certain port."""

        response = self.getSensor(port)
        sound_value    = int(response *SOUND_FACTOR)
        return sound_value


    def getDistance(self, port):
        """Read the value of the distance sensor attached to a certain port."""

        response = self.getSensor(port)
        distance_value    = int(response * DISTANCE_FACTOR)
        return distance_value


    def getDial(self, port):
        """Read the value of the dial attached to a certain port."""

        response       = self.getSensor(port)
        dial_value    = int(response *DIAL_FACTOR)
        if(dial_value > 100):
            dial_value = 100
        return dial_value


    def getVoltage(self, port):
        """Read the value of  the dial attached to a certain port."""

        response       = self.getSensor(port)
        voltage_value    = response *VOLTAGE_FACTOR
        return voltage_value


    ###########################################################################
    ########################### SEND HTTP REQUESTS ############################
    ###########################################################################

#    def send_httprequest_in(self, peri, port):
#        """Send HTTP requests for Hummingbird bit inputs."""

        #Combine different strings to form an HTTP request
#        http_request = self.base_request_in + "/" + peri    + "/" + str(port) + "/" + str(self.device_s_no)
#        try :
#            response_request =  urllib.request.urlopen(http_request)
#        except:
#            print(CONNECTION_SERVER_CLOSED)
#            sys.exit();
#        response = response_request.read().decode('utf-8')
#        if(response == "Not Connected"):
#            print(NO_CONNECTION)
#            sys.exit()
#        time.sleep(0.01)        # Hack to prevent http requests from overloading the BlueBird Connector
#        return int(response)


#    def send_httprequest(self, peri, port , value):
#        """Send HTTP request for Hummingbird bit output"""

        #Combine different strings to form an HTTP request
#        http_request = self.base_request_out + "/" + peri    + "/" + str(port) +  "/" + str(value)   + "/" + str(self.device_s_no)
#        try :
#            response_request =  urllib.request.urlopen(http_request)
#        except:
#            print(CONNECTION_SERVER_CLOSED)
#            sys.exit();
#        if(response_request.read() == b'200'):
#            response = 1
#        else :
#            response = 0
#        time.sleep(0.01)        # Hack to prevent http requests from overloading the BlueBird Connector
#        return response


#    def send_httprequest_buzzer(self, note, beats):
#        """Send HTTP request for hummingbird bit buzzer."""

        #Combine different strings to form an HTTP request
#        http_request = self.base_request_out + "/" + "playnote" +  "/" + str(note)   + "/" + str(beats)   + "/" + str(self.device_s_no)
#        try :
#            response_request =  urllib.request.urlopen(http_request)
#        except:
#            print(CONNECTION_SERVER_CLOSED)
#            sys.exit();
#        if(response_request.read() == b'200'):
#            response = 1
#        else :
#            response = 0
#        time.sleep(0.01)        # Hack to prevent http requests from overloading the BlueBird Connector
#        return response

    ######## END class Hummingbird ########


class Finch(Microbit):
    """The Finch class includes the control of the outputs and inputs present
    in the Finch robot. When creating an instance, specify which robot by the
    device letter used in the BlueBirdConnector device list (A, B, or C)."""

    def __init__(self , device = 'A'):
        """Class initializer. """

        if('ABC'.find(device) != -1): #check for valid device letter
            self.device_s_no = device
            self.buttonShakeIndex = 16

            if not self.isConnectionValid():
                self.__exit("Error: Invalid Connection")

            if not self.__isFinch():
                self.__exit("Error: Device " + str(self.device_s_no) + " is not a Finch")

            self.symbolvalue = [0]*25

        else:
            self.__exit("Error: Device must be A, B, or C.")


    ######## Finch Utility Functions ########

    def __exit(self, msg):
        """Print error, shutdown robot, and exit python"""
        print(msg)
        self.stopAll()
        sys.exit()


    def __isFinch(self):
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


    @staticmethod
    def __constrainToInt(number):
        """Utility function to ensure number is an integer. Will round and cast to int
        (with warning) if necessary."""

        if not isinstance(number, int):
            oldNumber = number
            number = int(round(number))
            print("Warning: Parameter must be an integer. Using " + str(number) + " instead of " + str(oldNumber) + ".")

        return number

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

        #window.birdbrain.sendCommand({
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

        note = self.__constrainToInt(note)
        beats = int(beats * (60000/TEMPO))

        #window.birdbrain.sendCommand({
        await self._sendCommand({
            'robot': self.device_s_no,
            'cmd': "playNote",
            'note': note,
            'duration': beats
        })


    async def __moveFinchAndWait(self, command):
        """Send a command to move the finch and wait until the finch has finished
        its motion to return. Used by setMove and setTurn."""

#        length = self.__constrainToInt(length)
#        speed = self.__constrainToInt(speed)

        isMoving = window.birdbrain.finchIsMoving(self.device_s_no)
        wasMoving = isMoving

        #window.birdbrain.sendCommand(command)
        await self._sendCommand(command)

        while (not((wasMoving) and (not isMoving)) and self.isConnectionValid()):
            wasMoving = isMoving
            await aio.sleep(0.01)
            isMoving = window.birdbrain.finchIsMoving(self.device_s_no)

#        return response


    async def setMove(self, direction, distance, speed):
        """Move the Finch forward or backward for a given distance at a given speed.
        Direction should be specified as 'F' or 'B' and distance and speed should
        be given as integers."""

        direction = self.__formatForwardBackward(direction)
        if direction is None:
                return 0

        distance = self._clampParametersToBounds(distance, 0, 500)
        speed =  self._clampParametersToBounds(speed, 0, 100)

        #window.birdbrain.sendCommand({
        await self.__moveFinchAndWait({
            'robot': self.device_s_no,
            'cmd': "move",
            'direction': direction,
            'distance': distance,
            'speed': speed
        })
#        response = self.__moveFinchAndWait("move", direction, distance, speed)

#        return response


    async def setTurn(self, direction, angle, speed):
        """Turn the Finch right or left to a given angle at a given speed.
        Direction should be specified as 'R' or 'L' and angle and speed should
        be given as integers."""

        direction = self.__formatRightLeft(direction)
        if direction is None:
                return 0

        angle =  self._clampParametersToBounds(angle, 0, 360)
        speed =  self._clampParametersToBounds(speed, 0, 100)

        #window.birdbrain.sendCommand({
        await self.__moveFinchAndWait({
            'robot': self.device_s_no,
            'cmd': "turn",
            'direction': direction,
            'angle': angle,
            'speed': speed
        })
#        response = self.__moveFinchAndWait("turn", direction, angle, speed)

#        return response


    async def setMotors(self, leftSpeed, rightSpeed):
        """Set the speed of each motor individually. Speed should be an integer in
        the range of -100 to 100."""

        leftSpeed = self._clampParametersToBounds(leftSpeed, -100, 100)
        leftSpeed = self.__constrainToInt(leftSpeed)
        rightSpeed = self._clampParametersToBounds(rightSpeed, -100, 100)
        rightSpeed = self.__constrainToInt(rightSpeed)

        #window.birdbrain.sendCommand({
        await self._sendCommand({
            'robot': self.device_s_no,
            'cmd': "wheels",
            'speedL': left,
            'speedR': right
        })
        #Send HTTP request
#        response = self.__send_httprequest_move("wheels", leftSpeed, rightSpeed, None)
#        return response


    async def stop(self):
        """Stop the Finch motors."""

        #window.birdbrain.sendCommand({
        await self._sendCommand({
            'robot': self.device_s_no,
            'cmd': "stopFinch"
        })


    async def resetEncoders(self):
        """Reset both encoder values to 0."""

        #window.birdbrain.sendCommand({
        await self._sendCommand({
            'robot': self.device_s_no,
            'cmd': "resetEncoders"
        })
        #the finch needs a little time to reset
        await aio.sleep(0.1)
#        response = self.__send_httprequest_out("resetEncoders", None, None)

        #The finch needs a chance to actually reset
#        time.sleep(0.1)

#        return response


    ######## Finch Inputs ########

#    def __getSensor(self, sensor, port):
#        """Read the value of the specified sensor. Port should be specified as either 'R'
#        or 'L'. If the port is not valid, returns -1."""

        #Early return if we can't execute the command because the port is invalid
#        if ((not sensor == "finchOrientation") and (not port == "Left") and (not port == "Right") and
#            (not ((port == "static") and (sensor == "Distance" or sensor == "finchCompass")))):
#                return -1

#        response = self.__send_httprequest_in(sensor, port)
#        return response


    def getLight(self, direction):
        """Read the value of the right or left light sensor ('R' or 'L')."""
        direction = self.__formatRightLeft(direction)
        if direction == "Right":
            return window.birdbrain.sensorData[self.device_s_no][3];
        elif direction == "Left":
            return window.birdbrain.sensorData[self.device_s_no][2];
        else:
            return 0


    def getDistance(self):
        """Read the value of the distance sensor"""
        msb = window.birdbrain.sensorData[self.device_s_no][0];
        lsb = window.birdbrain.sensorData[self.device_s_no][1];
        distance = msb << 8 | lsb

        return int(distance * FINCH_DISTANCE)


    def getLine(self, direction):
        """Read the value of the right or left line sensor ('R' or 'L').
        Returns brightness as a value 0-100 where a larger number
        represents more reflected light."""
        direction = self.__formatRightLeft(direction)
        value = 0
        if direction == "Right":
            value = window.birdbrain.sensorData[self.device_s_no][5];
        elif direction == "Left":
            value = window.birdbrain.sensorData[self.device_s_no][4];
            #first bit is for position control
            value = (0x7F & value)

        return (100 - value)


    def getEncoder(self, direction):
        """Read the value of the right or left encoder ('R' or 'L').
        Values are returned in rotations."""
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
        if encoder >= 0x800000:
            encoder = encoder | 0xFF000000
        encoder_value = round(float(encoder), 2)
        return encoder_value


    # The following methods override those within the Microbit
    # class to return values within the Finch reference frame.

    def getAcceleration(self):
        """Gives the acceleration of X,Y,Z in m/sec2, relative
        to the Finch's position."""

#        return self._getXYZvalues("finchAccel", False)
        x = window.birdbrain.getFinchAcceleration('X', self.device_s_no)
        y = window.birdbrain.getFinchAcceleration('Y', self.device_s_no)
        z = window.birdbrain.getFinchAcceleration('Z', self.device_s_no)
        return (x, y, z)

    def getCompass(self):
        """Returns values 0-359 indicating the orentation of the Earth's
        magnetic field, relative to the Finch's position."""

        #Send HTTP request
#        response = self.__getSensor("finchCompass", "static")
#        compass_heading = int(response)
#        return compass_heading
        return window.birdbrain.getFinchCompass(self.device_s_no)


    def getMagnetometer(self):
        """Return the values of X,Y,Z of a magnetommeter, relative to the Finch's position."""

#        return self._getXYZvalues("finchMag", True)
        x = window.birdbrain.getFinchMagnetometer('X', self.device_s_no)
        y = window.birdbrain.getFinchMagnetometer('Y', self.device_s_no)
        z = window.birdbrain.getFinchMagnetometer('Z', self.device_s_no)
        return (x, y, z)


    def getOrientation(self):
        """Return the orentation of the Finch. Options include:
        "Beak up", "Beak down", "Tilt left", "Tilt right", "Level",
        "Upside down", and "In between"."""

#        orientations = ["Beak%20Up","Beak%20Down","Tilt%20Left","Tilt%20Right","Level","Upside%20Down"]
#        orientation_result = ["Beak up","Beak down","Tilt left","Tilt right","Level","Upside down"]
        orientations = ["Beak Up","Beak Down","Tilt Left","Tilt Right","Level","Upside Down"]

        #Check for orientation of each device and if true return that state
        for targetOrientation in orientations:
            isCurrentOrientation = window.birdbrain.finchOrientation(targetOrientation, self.device_s_no)
            if (isCurrentOrientation):
                return targetOrientation
#            response = self.__getSensor("finchOrientation", targetOrientation)
#            if(response == "true"):
#                return orientation_result[orientations.index(targetOrientation)]

        #If we are in a state in which none of the above seven states are true
        return "In between"


    ######## END class Finch ########