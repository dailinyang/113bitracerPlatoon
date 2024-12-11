radio.onReceivedNumber(function (receivedNumber) {
    // Handle driving modes
    switch (receivedNumber) {
        case 1:
            駕駛模式 = 'human';
            break;
        case 2:
            駕駛模式 = 'Platoon';
            music.playTone(523, music.beat(BeatFraction.Quarter));
            music.playTone(440, music.beat(BeatFraction.Quarter));
            break;
        case 881: // Exit Platoon mode
            if (駕駛模式 === 'Platoon') {
                music.playTone(440, music.beat(BeatFraction.Quarter));
                music.playTone(523, music.beat(BeatFraction.Quarter));
                駕駛模式 = 'human';
            }
            break;
        default:
            music.playTone(523, music.beat(BeatFraction.Quarter));
            基本速度 = receivedNumber;
            // if (駕駛模式 === 'Platoon') {
            //     music.playTone(523, music.beat(BeatFraction.Quarter));
            //     基本速度 = receivedNumber;
            // }
    }
})

input.onButtonPressed(Button.A, function () {
    前車距離 = sonar.ping(
    DigitalPin.P1,
    DigitalPin.P2,
    PingUnit.Centimeters
    )
    basic.showNumber(前車距離)
})
input.onButtonPressed(Button.AB, function () {
    basic.showNumber(車序號)
    music.playTone(523, music.beat(BeatFraction.Quarter))
    while (true) {
        前車距離 = sonar.ping(        DigitalPin.P1,        DigitalPin.P2,        PingUnit.Centimeters        )
        
        if (駕駛模式 == 'human') {
            前車固定車距 = 10
            車速 = Math.constrain(基本速度 , 1, 基本速度)
            if (前車距離 < 前車固定車距){
                車速 = 0 
            }
        }
        else if (駕駛模式 == 'Platoon'){    
            前車固定車距 = 7
            車速 = Math.constrain(基本速度 + (前車距離 - 前車固定車距) * 車距kP, 1, Math.floor(基本速度*1.1) )
        }
        
        PD控制(車速, kP, kD)
        //廣播車子狀態
        if (control.millis() > lastBT) {
            radio.sendString("" + 車序號 + "," + 前車距離 + "," + 車速)
            lastBT = control.millis() + randint(30, 150)
        }
        basic.pause(迴圈間隔時間)
    }
})
input.onButtonPressed(Button.B, function () {
    if (校正模式 == "") {
        basic.showLeds(`
            # # . # #
            # # . # #
            # # . # #
            # # . # #
            # # . # #
            `)
        music.playTone(523, music.beat(BeatFraction.Eighth))
        BitRacer.CalibrateBegin()
        校正模式 = "黑線校正"
    } else if (校正模式 == "黑線校正") {
        BitRacer.CalibrateEnd(BitRacer.LineColor.Black)
        basic.showIcon(IconNames.Yes)
        music.playTone(659, music.beat(BeatFraction.Eighth))
        校正模式 = ""
        basic.clearScreen()
    }
})
function PD控制 (PWM: number, Kp: number, Kd: number) {
    Error_P = 0 - BitRacer.readLine()
    Error_D = Error_P - Error_P_old
    Error_P_old = Error_P
    PID_Val = Error_P * Kp + Error_D * Kd
    BitRacer.motorRun(BitRacer.Motors.M_R, Math.constrain(PWM + PID_Val, -1000, 1000))
    BitRacer.motorRun(BitRacer.Motors.M_L, Math.constrain(PWM - PID_Val, -1000, 1000))
}
let PID_Val = 0
let Error_P_old = 0
let Error_D = 0
let Error_P = 0
let 校正模式 = ""
let lastBT = 0
let 車速 = 0
let 前車距離 = 0
let 基本速度 = 0
let 車距kP = 0
let 前車固定車距 = 0
let 車序號 = 0
let 迴圈間隔時間 = 0
let 駕駛模式 = ""
let kP = 0
let kD = 0

radio.setTransmitPower(7)
radio.setGroup(27)

車序號 = 1

if (車序號 == 1 || 車序號 == 5 || 車序號 == 6){
    kP = 250
    kD = 500
}
else{
    kP = 310
    kD = 600
}

駕駛模式 = 'human'
前車固定車距 = 7
車距kP = 35
基本速度 = 200
迴圈間隔時間 = 5