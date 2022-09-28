
// Create WebSocket connection
const ws_address = `ws://capogreco-ds-deploy.deno.dev/`
// const ws_address = `ws://localhost/`
// const ws_address = `ws://google.com/`

const socket = new WebSocket (ws_address)

// Connection opened
socket.addEventListener ('open', () => {
    const msg = {
        type: `greeting`,
        body: `Hello from public!`
    }

    socket.send (JSON.stringify (msg))
});

const save_bank = Array (10).fill ()

// Listen for messages
socket.addEventListener('message', event => {
    console.log (event)
    const obj = JSON.parse (event.data)
    switch (obj.type) {
        case `greeting`:
            console.log (obj.body)
            break
        case `control`:
            handle_control (obj.body)
            break
        case `save`:
            console.log (`saving to ${ obj.body }`)
            save_bank[obj.body] = JSON.stringify (phasor)
            break
        // deno-lint-ignore no-case-declarations
        case `load`:
            console.log (`loading from ${ obj.body }`)
            const state = JSON.parse (save_bank[obj.body])
            if (state) {
                Object.assign (phasor, state)
            }
            break
        case `is_playing`:
            if (obj.body && !animating){
                animating = true
                requestAnimationFrame (draw_frame)
            }
            else if (!obj.body) {
                animating = false
                last_bounce = period = undefined
            }
            break
    }
});

document.body.style.margin   = 0
document.body.style.overflow = `hidden`

const cnv  = document.getElementById (`cnv`)
fit_to_window ()


const c_ctx = cnv.getContext (`2d`)
c_ctx.fillStyle = `deeppink`
c_ctx.fillRect (0, 0, cnv.width, cnv.height)

const a_ctx = new AudioContext ()
a_ctx.suspend ()

let animating = false

function a_init () {
    a_ctx.resume ()
}

let y_acc = (2 ** rand_int (6)) / (1 + rand_int (6))
let note = 60
let timbre = 3

const phasor = {
    active: false,
    period: false,
    time: {
        start : a_ctx.currentTime,
        end   : a_ctx.currentTime, },
    grav: {
        start : y_acc,
        end   : y_acc, },
    note: {
        start : note,
        end   : note, },
    timbre: {
        start : timbre,
        end   : timbre, },
    
    get_phase () {
        if (a_ctx.currentTime >= this.time.end) {
            return 1
        }

        else {
            const now = a_ctx.currentTime
            const off = now - this.time.start
            const len = this.time.end - this.time.start
            return off / len
        }
    },

    get_grav () {
        const p = this.get_phase ()
        const d = this.grav.end - this.grav.start
        return this.grav.start + (d * p)
    },

    get_note () {
        const p = this.get_phase ()
        const d = this.note.end - this.note.start
        return this.note.start + (d * p)
    },

    get_timbre () {
        const p = this.get_phase ()
        const d = this.timbre.end - this.timbre.start
        return this.timbre.start + (d * p)
    },

}

function handle_control (obj) {
    const now = a_ctx.currentTime
    phasor.time.start = now
    phasor.time.end = now + obj.time
    phasor.grav.start = y_acc
    phasor.grav.end = rand_el (obj.grav)
    phasor.note.start = note
    phasor.note.end = rand_el (obj.note)
    phasor.timbre.start = timbre
    phasor.timbre.end = rand_el (obj.timbre)
}

function rand_el (a) {
    return a[rand_int (a.length)]
}

function rand_int (m) {
    return Math.floor ((Math.random () * m))
}


let y_pos = 50
let y_vel = 0
let y_min = 50

let elasticity = 1

let period, current_bounce, last_bounce

function do_physics () {

    const slope_before = y_vel

    y_vel += y_acc
    y_pos += y_vel

    const slope_after = y_vel

    // turning point
    if (slope_before <= 0 && slope_after > 0) {
        y_acc = phasor.get_grav ()
        y_min = y_pos
        elasticity = (cnv.height - 50) / (cnv.height - y_min)
    }

    // collision
    if (y_pos > cnv.height - 100) {
        y_pos = cnv.height - 100
        y_vel *= -1 * elasticity

        current_bounce = a_ctx.currentTime

        if (last_bounce) {
            period = current_bounce - last_bounce
        }

        last_bounce = current_bounce 

        const len = period ? period : 0.02
        note = phasor.get_note ()
        timbre = phasor.get_timbre ()
        play_note (note, len, timbre, a_ctx)
    }
}

let square_colour = `deeppink`

function draw_frame () {
    c_ctx.fillStyle = `turquoise`
    c_ctx.fillRect (0, 0, cnv.width, cnv.height)

    do_physics ()

    const x_pos = cnv.width / 2 - 50

    c_ctx.fillStyle = square_colour
    c_ctx.fillRect (x_pos, y_pos, 100, 100)

    if (animating) requestAnimationFrame (draw_frame)
}

// Create a reference for the Wake Lock.
let wakeLock = null

document.onclick = async () => {
    if (a_ctx.state == `suspended`) {
        a_init ()
        animating = true
        requestAnimationFrame (draw_frame)

        // create an async function to request a wake lock
        try {
            wakeLock = await navigator.wakeLock.request ('screen');
            square_colour = `white`
            console.log ('Wake Lock is active!')
        } catch (err) {
            // The Wake Lock request has failed - usually system related, such as battery.
            square_colour = `black`
            console.log (`${err.name}, ${err.message}`)
        }
  
    }

    else {
        animating = !animating
        if (animating) requestAnimationFrame (draw_frame)
        else {
            last_bounce = period = undefined
        }
    }
}

window.onresize = fit_to_window

function fit_to_window () {
    cnv.width  = window.innerWidth
    cnv.height = window.innerHeight    
}

function play_note (note, length, timbre, a_ctx) {
    const now = a_ctx.currentTime
    const freq = midi_2_cps (note)

    const mod = a_ctx.createOscillator ()
    mod.type = `sine`
    mod.frequency.setValueAtTime (8000 * (2 ** Math.random ()), now)
    mod.frequency.exponentialRampToValueAtTime (freq * timbre, now + 0.01)

    const mod_amp = Array (3).fill ().map (() => {
        return a_ctx.createGain ()
    })

    const osc = a_ctx.createOscillator ()
    osc.type = `sine`
    osc.frequency.setValueAtTime (8000 * (2 ** Math.random ()), now)
    osc.frequency.exponentialRampToValueAtTime (freq, now + 0.01)

    const amp = Array (3).fill ().map (() => {
        return a_ctx.createGain ()
    })

    mod.connect (mod_amp[0])

    mod_amp.forEach ((amp, i) => {
        const d = i == 2 ? osc.frequency : mod_amp[i + 1]
        amp.connect (d)

        const g = i == 2 ? freq : 1
        amp.gain.setValueAtTime (0, now)
        amp.gain.linearRampToValueAtTime (g, now + 0.01)
        amp.gain.linearRampToValueAtTime (0, now + length)
    })

    osc.connect (amp[0])

    amp.forEach ((e, i) => {
        const d = amp[i + 1] ? amp[i + 1] : a_ctx.destination
        e.connect (d)

        e.gain.setValueAtTime (0, now)
        e.gain.linearRampToValueAtTime (0.8, now + 0.01)
        e.gain.linearRampToValueAtTime (0, now + length)
    })

    mod.start (now)
    mod.stop (now + length)

    osc.start (now)
    osc.stop (now + length)
}

function midi_2_cps (note) {
    return 440 * (2 ** ((note - 69) / 12))
}

