tasm tsr
tlink tsr

tasm RI
tlink/t RI

tasm test
tlink test

echo install RI
RI.com

echo started a tsr program to display time on the top right corner of the screen
tsr.exe 
echo Terminate and stay resident (TSR) programs consist of RAM-resident and
echo transient portions. When a TSR is executed, the transient portion
echo initializes data and installs the interrupt handlers; the transient
echo portion only takes place once. On exit, the transient code executes a
echo MS-DOS TSR function to leave the RAM-resident portion in memory. The
echo RAM-resident portion of the code is now ready and waiting to be
echo invoked.
echo 
echo Typically a TSR is invoked by another program by a sequence of
echo keystrokes, or by a system interrupt. The following is an example of a
echo TSR that displays the system time in the upper-right corner of the
echo screen. During the transient portion, the TSR replaces the
echo system-timer interrupt code with its own code and saves the old
echo address so the original system-timer interrupt can be invoked by the
echo new code. The system-timer interrupt occurs approximately 19 times a
echo second, and is required for the system to execute correctly. The
echo RAM-resident portion of the TSR first invokes the original
echo system-timer interrupt, then calls Interrupt 1AH function 02H to
echo obtain the current time. The time is then displayed in the upper-right
echo corner of the screen.





