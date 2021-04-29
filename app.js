'use strict';

const SQUARE_SIZE = 120
const SQUARE_ROWS = 4
const SQUARE_COLS = 6
const SQUARE_INIT = 3

const randomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

window.onload = () => {
    const canvas = document.getElementById('game')
    const infos = document.getElementById('game-info')
    const ctx = canvas.getContext('2d')
    let points = 0
    let best = JSON.parse(localStorage.getItem('donttap-best-pts') ?? '{"points":0,"time":0,"cps":0}')
    let start = Date.now()

    const delta = () => ((Date.now() - start) / 1000.0).toFixed(3)

    const cps = () => (points / parseFloat(delta())).toFixed(3)

    const resetSession = () => {
        if (points === best.points) {
            localStorage.setItem('donttap-best-pts', JSON.stringify(best))
        }
        points = 0
        start = Date.now()
    }

    const handleClick = event => {
        const tile = {
            x: Math.floor((event.clientX - canvas.offsetLeft) / SQUARE_SIZE),
            y: Math.floor((event.clientY - canvas.offsetTop) / SQUARE_SIZE)
        }

        const here = getTileHere(tile)
        if (here !== undefined) {
            newTile()
            removeTileHere(here)
            points++

            if (points > best.points) {
                best.points = points
                best.time = delta()
                best.cps = cps()
            }
        } else {
            resetSession()
        }
    }

    const newTile = () => {
        let tile = {}
        do {
            tile = {
                x: Math.floor(Math.random() * SQUARE_COLS),
                y: Math.floor(Math.random() * SQUARE_ROWS),
                color: randomColor()
            }
        } while (getTileHere(tile) !== undefined)
        tiles.push(tile)
    }

    const getTileHere = ({x, y}) => tiles.find(t => t.x === x && t.y === y)
    const removeTileHere = ({x, y}) => tiles.splice(tiles.findIndex(t => t.x === x && t.y === y), 1)

    let tiles = []
    for (let i = 0; i < SQUARE_INIT; i++) {
        newTile()
    }
    canvas.addEventListener('mousedown', handleClick)

    const update = () => {
        // Update title and game info with current game info
        const deltaTime = delta()
        const currentCps = cps()
        window.document.title = `${points} / ${best.points}`
        let textInfo = `<strong>${points} in ${deltaTime} s (${currentCps} CPS)</strong> / `
        if (points === best.points) {
            textInfo += `<strong>${best.points} in ${best.time} s (${best.cps} CPS)</strong>`
        } else {
            textInfo += `<i>${best.points} in ${best.time} s (${best.cps} CPS)</i>`
        }
        infos.innerHTML = textInfo

        // Rest the board
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight)

        // Draw the tiles to click
        for (const tile of tiles) {
            ctx.fillStyle = tile.color
            ctx.fillRect(tile.x * SQUARE_SIZE, tile.y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE)
        }

        // Draw the grid on top
        for (let i = 0; i < SQUARE_ROWS; i++) {
            for (let j = 0; j < SQUARE_COLS; j++) {
                ctx.strokeStyle = '#000000'
                ctx.strokeRect(j * SQUARE_SIZE, i * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE)
            }
        }

        requestAnimationFrame(update)
    }

    update()
}
