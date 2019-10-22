/**
 * KEYBOARD KEY CONSTANTS.
 */
var KEYCODES = {
    LEFT_ARROW: 37,
    UP_ARROW: 38,
    RIGHT_ARROW: 39,
    DOWN_ARROW: 40,
    X_ZOOM_IN: 88,
    Z_ZOOM_OUT: 90,
    S_STOP_SKY: 83,
    C_CONSTELATION: 67,
    L_SHOW_SKYLINE: 76,
    G_SHOW_GRID: 71,
    N_SHOW_NAME: 78,
    T_CHANGE_STAR_NAME: 84,
    U_UNDER_FEET: 85,
    F_FULL_MAP: 70,
    Q_OPTIMIZE: 81,
    KEY_1: 49,
    KEY_2: 50,
    KEY_3: 51,
    KEY_4: 52,
    KEY_5: 53,
    KEY_6: 54,
    KEY_7: 55
};

/**
 * Handle keyboard actions.
 */
function KeyboardControl() {
    this.control = true;

    // Define key actions
    this.keyControl = function (e) {
        this.key = (e.which) ? e.which : event.keyCode;
        switch (this.key) {
            // ================ navigation section ==================
            case KEYCODES.LEFT_ARROW: // left arrow
                skyConsole.addAzimuth(skyConsole.panFactor());
                break;
            case KEYCODES.UP_ARROW: // up arrow
                skyConsole.addAltitude(skyConsole.panFactor());
                break;
            case KEYCODES.RIGHT_ARROW: // right arrow
                skyConsole.addAzimuth(-skyConsole.panFactor());
                break;
            case KEYCODES.DOWN_ARROW: // down arrow
                skyConsole.addAltitude(-skyConsole.panFactor());
                break;
            case KEYCODES.X_ZOOM_IN: // x -- zoom in
                skyConsole.addScale(skyConsole.zoomFactor());
                break;
            case KEYCODES.Z_ZOOM_OUT: // z -- zoom out
                skyConsole.addScale(-skyConsole.zoomFactor());
                break;
            // ================= sky setting section ================
            case KEYCODES.S_STOP_SKY: // s -- stop sky
                stopMoving = !stopMoving;
                break;
            case KEYCODES.C_CONSTELATION: // c -- constellation
                switch (skyConsole.constel) {
                    case 0:
                        starSet.changeLine(constal);
                        break;
                    case 1:
                        starSet.changeLine(altconstal);
                        break;
                    default:
                        starSet.changeLine([]);
                }
                skyConsole.changeConstel()
                break;
            case KEYCODES.L_SHOW_SKYLINE: // l -- show sky line
                if (!skylineSet.visible && !obslineSet.visible)
                    skylineSet.changeVisible();
                else if (skylineSet.visible && !obslineSet.visible)
                    obslineSet.changeVisible();
                else if (skylineSet.visible && obslineSet.visible)
                    skylineSet.changeVisible();
                else
                    obslineSet.changeVisible();
                break;
            case KEYCODES.G_SHOW_GRID: // g -- show grid line
                obslineSet.changeVisible();
                break;
            case KEYCODES.N_SHOW_NAME: // n -- show name
                starSet.changeNameable();
                break;
            case KEYCODES.T_CHANGE_STAR_NAME: // t -- change star shape
                starSet.changeEachShape();
                break;
            case KEYCODES.U_UNDER_FEET: // u -- show map under feet & unlock rotate under feet
                skyConsole.changeLockUnderFeet();
                break;
            case KEYCODES.F_FULL_MAP: // f -- show full map
                if (skyConsole.isTransit) return;
                if (!skyConsole.isFull) {
                    skyConsole.save();
                    skyConsole.forceSetScale(windowSize.getFullBall());
                } else skyConsole.restore();
                skyConsole.changeFullMap();
                break;
            case KEYCODES.Q_OPTIMIZE: // q -- optimize performance
                tool.performance(true);
                break;
            // =================== magnitude setting ==================
            case KEYCODES.KEY_1: // 1 -- magnitude 1
                starSet.checkEachVisible(1);
                break;
            case KEYCODES.KEY_2:
                starSet.checkEachVisible(2);
                break;
            case KEYCODES.KEY_3:
                starSet.checkEachVisible(3);
                break;
            case KEYCODES.KEY_4:
                starSet.checkEachVisible(4);
                break;
            case KEYCODES.KEY_5:
                starSet.checkEachVisible(5);
                break;
            case KEYCODES.KEY_6:
                starSet.checkEachVisible(6);
                break;
            case KEYCODES.KEY_7:
                starSet.checkEachVisible(7);
                break;
        }
    }

    // Invert control, whatever that means
    this.changeControl = function () {
        this.control = !this.control;
    }
}

function MouseControl() {
    this.leftDown = false;

    this.xy = [];
    this.oxy = [0, 0];
    this.cxy = [];
    this.dxyO = [];
    this.dxyN = [];
    this.obsAltz = [];
    this.gotAltz = [0, 0]; // no longer use, still call at sky.js
    this.speedSet = [0, 0, 0, 0];

    this.zoomFull = 0;

    this.absolutePosition = function (e) {
        this.xy[0] = (e.offsetX) ? e.offsetX : e.layerX;
        this.xy[1] = (e.offsetY) ? e.offsetY : e.layerY;
        this.originPosition(this.xy);
    }
    this.originPosition = function (xy) {
        this.oxy = [xy[0] - windowSize.halfWidth, xy[1] - windowSize.halfHeight];
    }
    this.clickingPosition = function () {
        this.cxy = this.oxy.slice();
    }
    this.dragingPosition = function () {
        this.dxyO = this.dxyN.slice();
        this.dxyN = this.oxy.slice();
    }

    this.click = function () {
        if (skyConsole.isTransit) return;
    }
    this.right = function () {
        if (skyConsole.isTransit) return;

        // ---- just one of menu -----
        var url = "http://www.google.com/sky/";
        var radec = sky.position(this.oxy);

        url += "#latitude=" + radec[1];
        url += "&longitude=" + 15 * (radec[0] - 12);
        url += "&zoom=4";

        window.open(url);
        // ---------------------------
    }
    this.dblclick = function () {
        if (skyConsole.isTransit) return;

        this.clickingPosition();

        var desAltz = observer.position(this.cxy);
        var cenAltz = observer.position([0, 0]);
        var dwnAltz = observer.position([0, 1]);

        var gotAltz = [-desAltz[0] + dwnAltz[0], desAltz[1] - cenAltz[1]];
        gotAltz[0] = ezGL.checkCircleRound(gotAltz[0]);

        var zoomSpeed = 0;
        var forceZoom = false;
        if (skyConsole.isFull) {
            zoomSpeed = windowSize.getRadius() - skyConsole.scale;
            forceZoom = true;
            skyConsole.changeFullMap();
            skyConsole.isTransit = true;
        } else if (skyConsole.scale > 10 * windowSize.getRadius()) {
            zoomSpeed = windowSize.getRadius() - skyConsole.scale;
            zoomSpeed = zoomSpeed / 2 - 1;
            gotAltz = [0, 0];
        } else if (this.farRadius() > 0) {
            zoomSpeed = this.farRadius() * skyConsole.scale;
        } else zoomSpeed = 0;

        animation.slow(2.5);

        animation.event.push(new AnimateGoto(gotAltz, zoomSpeed, forceZoom));
    }
    this.down = function (e) {
        if (skyConsole.isTransit) return;

        if (e.which == 1)
            this.drag();
    }
    this.up = function (e) {
        if (skyConsole.isTransit) return;

        if (e.which == 1)
            this.release();
        else if (e.which == 3)
            this.right();
    }
    this.out = function () {
        if (skyConsole.isTransit) return;

        if (this.leftDown) this.release();
    }
    this.wheel = function (e) {
        if (skyConsole.isTransit) return;

        e = e ? e : window.event;
        var zoom = e.detail ? -e.detail : e.wheelDelta / 40;

        if (zoom > 0) {
            if (skyConsole.isFull) {
                if (mouse.zoomFull < 2) {
                    mouse.zoomFull++;
                    animation.event.push(new AnimateReset());
                } else {
                    mouse.zoomFull = 0;
                    skyConsole.isTransit = true;
                    skyConsole.changeFullMap();

                    animation.event.length = 0;
                    var gotOAltz = skyConsole.sw_altitude;
                    var zoomSpeed = windowSize.getRadius() - skyConsole.scale;
                    animation.event.push(new AnimateGoto([0, gotOAltz], zoomSpeed, true));
                }
            } else if (skyConsole.scale == skyConsole.mx_scale) {
                mouse.zoomFull = 0;
            } else {
                mouse.zoomFull = 0;
                animation.event.push(new AnimateGoto([0, 0], 0.28 * skyConsole.scale, false));
            }
        } else {
            if (skyConsole.scale == windowSize.getRadius()) {
                if (mouse.zoomFull > -2) {
                    mouse.zoomFull--;
                    animation.event.push(new AnimateReset());
                } else {
                    mouse.zoomFull = 0;
                    skyConsole.isTransit = true;

                    skyConsole.save();
                    animation.event.length = 0;
                    var gotZenith = -skyConsole.altitude;
                    var zoomSpeed = windowSize.getFullBall() - skyConsole.scale;
                    animation.event.push(new AnimateGoto([0, gotZenith], zoomSpeed, true));
                }
            } else if (skyConsole.isFull) {
                mouse.zoomFull = 0;
            } else {
                mouse.zoomFull = 0;
                animation.event.push(new AnimateGoto([0, 0], -0.11 * skyConsole.scale, false));
            }
        }
    }

    this.drag = function () {
        animation.slow(1.4);

        this.dragingPosition();
        if (this.leftDown) {
            var dragVector = [this.dxyN[0] - this.dxyO[0], this.dxyN[1] - this.dxyO[1]];
            var dragSpeed = Math.sqrt(Math.pow(dragVector[0], 2) + Math.pow(dragVector[1], 2));
            this.speedHandler(dragSpeed);

            var obsAtzO = observer.position(this.dxyO);
            var obsAtzN = observer.position(this.dxyN);

            this.obsAltz = [obsAtzN[0] - obsAtzO[0], obsAtzN[1] - obsAtzO[1]];
            this.obsAltz[0] = ezGL.checkCircleRound(this.obsAltz[0]);

            if (this.dxyO[1] >= ezGL.getZenith()) this.obsAltz[1] = -this.obsAltz[1];
            skyConsole.addAzimuth(this.obsAltz[0]);
            skyConsole.addAltitude(this.obsAltz[1]);
        } else {
            this.speedHandler(0);
            this.obsAltz = [0, 0];
        }
        this.leftDown = true;
    }
    this.release = function () {
        if (!this.leftDown) return;
        this.leftDown = false;
        animation.event.push(new AnimateRelease(this.obsAltz, this.releaseSpeed));

        this.dxyO = [];
        this.dxyN = [];
        this.speedSet = [0, 0, 0, 0];
    }

    this.farRadius = function () {
        toMouse = Math.sqrt(Math.pow(this.oxy[0], 2) + Math.pow(this.oxy[1], 2));
        if (toMouse < windowSize.getRadius() / 2)
            farFactor = Math.pow(Math.cos(toMouse * Math.PI / windowSize.getRadius()), 2);
        else farFactor = 0;
        return farFactor;
    }
    this.speedHandler = function (dragSpeed) {
        this.speedSet.shift();
        this.speedSet.push(dragSpeed);

        this.releaseSpeed = 0;
        for (var i = 0; i < 4; i++) {
            this.releaseSpeed = (this.speedSet[i] > this.releaseSpeed) ? this.speedSet[i] : this.releaseSpeed;
        }
    }
}

function Information() {
    this.focusObj = [];

    this.add = function (obj) {
        if (this.focusObj.length > 0 && this.focusObj[0].mag > obj.mag)
            this.focusObj.splice(0, 0, obj);
        else
            this.focusObj.push(obj);
    }
    this.clear = function () {
        this.focusObj.length = 0;
    }
}

function Animation() {
    this.event = [];

    this.animate = function () {
        for (var i = this.event.length - 1; i >= 0; i--) {
            if (this.event[i].turnLeft >= 0)
                this.event[i].animate();
            else
                this.event.splice(i, 1);
        }
    }
    this.slow = function (slowFactor) {
        for (var i = 0; i < this.event.length; i++) {
            this.event[i].slow(slowFactor);
        }
    }
}

function AnimateReset() {
    this.turnLeft = 15;
    this.turnAll = 15;

    this.animate = function () {
        if (this.turnLeft > 0) {
            this.turnLeft--;
        } else {
            mouse.zoomFull = 0;
            this.turnLeft--;
        }
    }
    this.slow = function (slowFactor) {
        mouse.zoomFull = 0;
        this.turnLeft = -1;
    }
}

function AnimateGoto(gotAltz, zoomSpeed, forceZoom) {
    this.gotAltz = gotAltz;
    this.zoomSpeed = zoomSpeed;
    this.forceZoom = forceZoom;

    this.turnLeft = 20;
    this.turnAll = 20;
    this.deriviate = 0;
    for (var i = 0; i <= this.turnLeft; i++)
        this.deriviate += Math.pow(Math.sin(i * Math.PI / this.turnAll), 2);
    this.deriviate = 1 / this.deriviate;

    this.animate = function () {
        var speedFunction = Math.pow(Math.sin(Math.PI * this.turnLeft / this.turnAll), 2) * this.deriviate;

        if (this.turnLeft > 0) {
            if (this.forceZoom)
                skyConsole.forceAddScale(speedFunction * this.zoomSpeed);
            else
                skyConsole.addScale(speedFunction * this.zoomSpeed);
            skyConsole.addAzimuth(speedFunction * this.gotAltz[0]);
            skyConsole.addAltitude(speedFunction * this.gotAltz[1]);
            this.turnLeft--;
        } else {
            if (Math.floor(skyConsole.scale) <= windowSize.getFullBall() && skyConsole.isTransit)
                skyConsole.changeFullMap();
            if (skyConsole.isTransit)
                skyConsole.isTransit = false;
            this.turnLeft--;
        }
    }
    this.slow = function (slowFactor) {
        this.deriviate /= slowFactor;
    }
}

function AnimateRelease(obsAltz, releaseSpeed) {
    this.obsAltz = obsAltz;

    this.turnLeft = Math.floor(releaseSpeed) + 1;
    this.turnAll = this.turnLeft;
    this.deriviate = 1;

    this.animate = function () {
        var speedFunction = Math.pow(Math.E, -(this.turnAll - this.turnLeft) / 2) * this.deriviate;

        if (speedFunction > 0.0001) {
            skyConsole.addAzimuth(speedFunction * this.obsAltz[0]);
            skyConsole.addAltitude(speedFunction * this.obsAltz[1]);
            this.turnLeft--;
        } else this.turnLeft = -1;
    }
    this.slow = function (slowFactor) {
        this.deriviate /= (slowFactor / 1.2);
    }
}
