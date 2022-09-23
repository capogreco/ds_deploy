// Create WebSocket connection.
const socket = await new WebSocket ('ws://capogreco-ds-deploy.deno.dev/:443')

// Connection opened
socket.addEventListener('open', () => {
    const msg = {
        type: `greeting`,
        body: `Hello from control!`
    }

    socket.send(JSON.stringify (msg));
});

// Listen for messages
socket.addEventListener('message', (event) => {
    const obj = JSON.parse (event.data)
    switch (obj.type) {
        case `greeting`:
            console.log (obj.body)
            break
    }
});

document.body.style.margin   = 0
document.body.style.overflow = `hidden`
document.body.style.backgroundColor = `black`

const chords = [
    { type: `unison`,
      notes: [ 0 ] },
    { type: `fifth`,
      notes: [ 0, 7 ] },
    { type: `major`,
      notes: [ 0, 7, 16 ] },
    { type: `minor`,
      notes : [ 0, 7, 15 ] },
    { type: `sus_2`,
      notes : [ 0, 2, 7 ] },
    { type: `sus_4`,
      notes : [ 0, 5, 7 ] },
    { type: `maj_7`,
      notes : [ 0, 7, 16, 23 ] },
    { type: `sus_7`,
      notes : [ 0, 5, 7, 10 ] },
    { type: `dom_7`,
      notes : [ 0, 7, 16, 22 ] },
    { type: `min_7`,
      notes : [ 0, 7, 15, 22 ] },
    { type: `dim_7`,
      notes : [ 0, 3, 6, 9 ] },
    { type: `aug`,
      notes : [ 0, 4, 8 ] },
]

let root   = 0
let octave = 4
let spread = 1

let chord_index = 0

function get_chord_array () {
    const chord = chords[chord_index].notes
    const a = []
    const t = chord.length * spread
    for (let i = 0; i < t; i++) {
        let n = chord[i % chord.length]
        n += root
        n += octave * 12
        n += Math.floor (i / chord.length) * 12
        a.push (n)
    }
    console.log (a)
    return a
}

const obj = {
    type: `control`,
    body: {
        grav: [ 0.0625, 0.125, 0.25, 0.5, 1, 2, 4, 8, 16 ],
        note: get_chord_array (),
        timbre: [ 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
        time: 5,
    }
}

let save_mode = false
let is_playing = true

document.onkeypress = e => {
    if (Number (e.key) + 1) {
        const n = Number (e.key)
        const program = {
            type: save_mode ? `save` : `load`,
            body: n
        }
        socket.send (JSON.stringify (program))

        const v = save_mode ? `saving to` : `loading from`
        console.log (`${ v } ${ n }`)
    }

    switch (e.key) {
        // deno-lint-ignore no-case-declarations
        case `p`:
            is_playing = !is_playing
            console.log (`is playing? ${ is_playing }`)
            const program = {
                type: `is_playing`,
                body: is_playing,
            }
            socket.send (JSON.stringify (program))
            break
        case `Enter`:
            console.log (`sending control program`)
            obj.body.note = get_chord_array ()
            socket.send (JSON.stringify (obj))
            break
        case `]`:
            chord_index += 1
            chord_index %= chords.length
            console.log (`chord type: ${ chords[chord_index].type }`)
            break
        case `[`:
            chord_index -= 1
            while (chord_index < 0) {
                chord_index += chords.length
            }
            console.log (`chord type: ${ chords[chord_index].type }`)
            break
        case `>`:
            spread++
            spread = Math.min (spread, 6)
            console.log (`spread is ${ spread }`)
            break
        case `<`:
            spread--
            spread = Math.max (spread, 1)
            console.log (`spread is ${ spread }`)
            break
    }
}

const keys = [ `C`, `C#`, `D`, `Eb`, `E`, `F`, `F#`, `G`, `G#`, `A`, `Bb`, `B`]

document.onkeydown = e => {
    switch (e.key) {
        case `Control`: 
            save_mode = true
            console.log (`entering save mode`)
            break
        case `ArrowLeft`:
            root -= 1
            while (root < 0) {
                root += 12
            }
            console.log (`root is ${ keys[root] }`)
            break
        case `ArrowRight`:
            root += 1
            root %= 12
            console.log (`root is ${ keys[root] }`)
            break
        case `ArrowUp`:
            octave++
            console.log (`octave: ${ octave }`)
            break
        case `ArrowDown`:
            octave--
            console.log (`octave: ${ octave }`)
            break
    
    }
}

document.onkeyup = e => {
    if (e.key == `Control`) {
        save_mode = false
        console.log (`exiting save mode`)
    }
}

function rand_el (a) {
    return a[rand_int (a.length)]
}

function rand_int (m) {
    return Math.floor ((Math.random () * m))
}
