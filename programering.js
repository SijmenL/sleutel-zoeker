let previousStuck = 0
let nowStuck = 0
let stuckTimer = 0
let stuck = 0
let start = false
let keysFound = 0
let randomSide = 1
let randomTurnSize = 1
let randomForwardsMovement = 1

let motor1Power = 100  // linkerwiel
let motor2Power = 100  // rechterwiel

// stop de motor en dim het licht als de robot gestart wordt.
crickit.motor2.stop()
crickit.motor1.stop()
light.setBrightness(20)

// als de switch aanstaat werkt de robot hetzelfde, maar kan hij alleen rechtdoor
// rijden, om te testen wat de sensoren aan boort doen.
loops.forever(function () {
    if (input.switchRight() == false) {
        light.showRing(
            "purple yellow purple yellow purple yellow purple yellow purple yellow"
        )
        if (start == true) {
            crickit.motor1.run(motor1Power)
            crickit.motor2.run(motor2Power)
        } else {
            crickit.motor1.stop()
            crickit.motor2.stop()
        }
    }
})

/* laat de robot rijden. er wordt een nummer gekozen die bepaald ofdat de robot naar
   links of naar rechts rijdt. de robot rijdt vervolgens voor een bepaalde tijd
   vooruit en daarna begint de loop opnieuw. als de sensoren merken dat de robot vastzit,
   rijd de robot een stukje achteruit.
   betekenis licht: rood=links, groen=rechts, wit=rechtdoor, geel=achteruit. */
loops.forever(function () {
    if (input.switchRight() && start == true && stuckTimer === 0) {
        randomSide = Math.randomRange(1, 2)
        randomTurnSize = Math.randomRange(100, 500)
        randomForwardsMovement = Math.randomRange(200, 3000)
        if (randomSide == 1) {
            light.setAll(0xff0000)
            crickit.motor1.run(motor1Power * -1)
            crickit.motor2.run(motor2Power)
        } else {
            light.setAll(0x00ff00)
            crickit.motor1.run(motor1Power)
            crickit.motor2.run(motor2Power * -1)
        }
        loops.pause(randomTurnSize)
        crickit.motor1.stop()
        crickit.motor2.stop()
        loops.pause(100)
        light.setAll(0xF1C232)
        crickit.motor1.run(motor1Power)
        crickit.motor2.run(motor2Power)
        loops.pause(randomForwardsMovement)
        crickit.motor1.stop()
        crickit.motor2.stop()
        loops.pause(100)
    } else {
        if (input.switchRight() && start == true) {
            light.setAll(0xffff00)
            crickit.motor1.run(motor1Power * -1) // soms rijd de robot niet achteruit als dat wel zou
            crickit.motor2.run(motor2Power * -1) // moeten volgens de `stuckTimer` omdat deze loop 
            loops.pause(50)                      // dan nog beig is.
        }
    }
})

// bereken ofdat de robot vastzit, door te kijken naar de sensoren.
loops.forever(function () { // bereken de waardes nu
    nowStuck = input.acceleration(Dimension.X) + input.acceleration(Dimension.Z) //x + z
    if (nowStuck <= 0) {
        nowStuck = nowStuck * -1 // geen negatief getal
    }
    Math.round(nowStuck)
    stuck = nowStuck - previousStuck // kijk ofdat de robot vast zit
    if (stuck >= -16 && stuck <= 16 && stuckTimer === 0) { // als de waarde van `stuck`
        stuckTimer = 1 // tussen een bepaalde hoeveelheid zit gaat de `stuckTimer` af
    }
    if (stuckTimer >= 1) { // regel de timer
        stuckTimer++
    }
    if (stuckTimer >= 50) {
        stuckTimer = 0
    }
})
loops.forever(function () { // sla dezelfde waarde op voor 70ms
    previousStuck = nowStuck
    loops.pause(70)
})


/* piept als de robot de sleutels vindt
   als de laptop niet zit aangesloten werkt de capacitive touch censor anders,
   waardoor het niet meer goed de sleutels kan vinden. */
loops.forever(function () {
    console.log(keysFound)
    keysFound = crickit.touch1.touchRead()
    if (input.switchRight() && keysFound >= 850) {
        start = false
        crickit.motor1.stop()
        crickit.motor2.stop()
        music.setVolume(20)
        music.magicWand.playUntilDone()
        light.showAnimation(light.rainbowAnimation, 1)
    }
})

// stop knop
input.buttonB.onEvent(ButtonEvent.Click, function () {
    start = false
    crickit.motor2.stop()
    crickit.motor1.stop()
    light.setAll(0x0000ff)
    music.jumpUp.play()
})

// start knop
input.buttonA.onEvent(ButtonEvent.Click, function () {
    light.setAll(0xFF00CB)
    music.jumpDown.play()
    start = true
})
