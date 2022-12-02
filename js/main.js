let columns = 9
let rows = 9
let mineCount = 10
let flags = mineCount

let elapsed = 0
let interval

$('.hide').hide()

$('button').mousedown(function () {
  $('button').css({ 'background-image': 'url("assets/face_pressed.svg")' })
})
$('button').mouseup(function () {
  $('button').css({ 'background-image': 'url("assets/face_unpressed.svg")' })
  clearTiles()
  setGame()
  clearInterval(interval)
  elapsed = 0
  interval = 0
  startTimer = function () {
    if (elapsed > 0) return
    startTimer = function () {}
    interval = setInterval(function () {
      elapsed = elapsed + 1

      if (elapsed === 999) {
        clearInterval(interval)
      }

      let time1 = 0
      let time2 = 0
      let time3 = 0
      time1 = elapsed % 10
      time2 = parseInt(((elapsed % 100) - time1) / 10)
      time3 = parseInt(((elapsed % 1000) - time1 - time2) / 100)
      $('#time1').attr('src', 'assets/d' + time3 + '.svg')
      $('#time2').attr('src', 'assets/d' + time2 + '.svg')
      $('#time3').attr('src', 'assets/d' + time1 + '.svg')
    }, 1000)
  }
})
$('input').change(function () {
  if (this.id === 'col' && $('#col').val() > 0) {
    columns = $('#col').val()
  }
  if (this.id === 'row' && $('#row').val() > 0) {
    rows = $('#row').val()
  }
  if (this.id === 'mine' && $('#mine').val() > 0) {
    checkMaxMines()
    mineCount = $('#mine').val()
  }
  clearTiles()
  setGame()
})
setGame()

$('select#difficulty').change(function () {
  if ($(this).val() === 'beginner') {
    columns = 9
    rows = 9
    mineCount = 10
    clearTiles()
    setGame()
  } else if ($(this).val() === 'intermediate') {
    columns = 16
    rows = 16
    mineCount = 40
    clearTiles()
    setGame()
  } else if ($(this).val() === 'expert') {
    rows = 16
    columns = 30
    mineCount = 99
    clearTiles()
    setGame()
  } else if ($(this).val() === 'custom') {
    rows = 9
    columns = 9
    mineCount = 10
    $('.hide').show()
    clearTiles()
    setGame()
  }
})
function startGame() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      let tile = document.createElement('div')
      tile.className = 'tile'
      tile.id = r.toString() + '-' + c.toString()
      document.getElementsByClassName('grid')[0].append(tile)
    }
  }
  $('.game').css({
    width: columns * 44 + 'px',
    height: rows * 44 + 'px',
  })
  setMines()
  setTileNum()
  setClass()
  coverTiles()
}

function setMines() {
  clearMines()
  checkMaxMines()
  let minesLeft = mineCount
  while (minesLeft > 0) {
    let r = Math.floor(Math.random() * rows)
    let c = Math.floor(Math.random() * columns)
    if ($('#' + r + '-' + c).text() !== 'mine') {
      $('#' + r + '-' + c).text('mine')
      minesLeft -= 1
    }
  }
}

function setClass() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      let state = $('#' + r + '-' + c).text()
      $('#' + r + '-' + c).addClass('n' + state)
    }
  }
}

function coverTiles() {
  $('.tile').addClass('covered')
}

function preventRightClick() {
  $('.grid').bind('contextmenu', function () {
    return false
  })
}

function clickable() {
  $('.tile').mousedown(function (event) {
    let tileId = '#' + this.id
    let r = parseInt(tileId.match(/\d+/i))
    let c = parseInt(tileId.match(/\d+$/i))
    switch (event.which) {
      case 1:
        startTimer()
        if ($(tileId).hasClass('nmine') && !$(tileId).hasClass('flagged')) {
          $(tileId).removeClass('nmine covered')
          $(tileId).addClass('boom')
          $('.tile').removeClass('covered')
          $('.tile').append('u')
          gameOver()
        }
        if ($(tileId).hasClass('flagged')) {
        }
        fill(r, c)
        break
      case 3:
        if ($(tileId).hasClass('covered') && flags > 0) {
          $(tileId).removeClass('covered')
          $(tileId).addClass('flagged')
          flags--
          flagCounter()
        } else if ($(tileId).hasClass('flagged')) {
          $(tileId).removeClass('flagged')
          $(tileId).addClass('covered')
          flags++
          flagCounter()
        }
        break
    }
    if (
      $('.tile:contains("u")').length + parseInt(mineCount) ===
      rows * columns
    ) {
      gameWon()
    }
  })
}

function fill(r, c) {
  if (r < 0 || c < 0 || r > rows - 1 || c > columns - 1) {
    return
  }
  if (/mine/i.test($('#' + r + '-' + c).text())) {
    return
  }

  if (/[1-9]/i.test($('#' + r + '-' + c).text())) {
    if (/u/i.test($('#' + r + '-' + c).text())) return
    $('#' + r + '-' + c).append('u')
    $('#' + r + '-' + c).removeClass('covered')
    return
  }
  if (/flagged/i.test($('#' + r + '-' + c).attr('class'))) {
    return
  }

  if (/u/i.test($('#' + r + '-' + c).text())) {
    return
  } else {
    $('#' + r + '-' + c).append('u')
    $('#' + r + '-' + c).removeClass('covered')
  }
  fill(r - 1, c - 1)
  fill(r - 1, c)
  fill(r - 1, c + 1)
  fill(r, c - 1)
  fill(r, c + 1)
  fill(r + 1, c - 1)
  fill(r + 1, c)
  fill(r + 1, c + 1)
}

function gameOver() {
  $('button').css({ 'background-image': 'url("assets/face_lose.svg")' })
  for (let i = 0; i < $('.flagged').length; i++) {
    if (!/mine/i.test($('.flagged')[i].textContent)) {
      let id = '#' + $('.flagged')[i].id
      $(id).addClass('wrong')
      $(id).removeClass('flagged')
    }
  }
  clearInterval(interval)
  setTimeout(function () {
    alert('You tripped on a mine. Please try again!')
  }, 200)
  $('.tile').unbind('mousedown')
}

function gameWon() {
  $('.covered').addClass('flagged')
  $('button').css({ 'background-image': 'url("assets/face_win.svg")' })
  clearInterval(interval)
  setTimeout(function () {
    alert('Well done!! You WON!!!')
  }, 200)
  $('.tile').unbind('mousedown')
}

function clearMines() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      if ($('#' + r + '-' + c).text() === 'mine') {
        $('#' + r + '-' + c).text('')
      }
    }
  }
}

function setTileNum() {
  // detect mines and set appropriate number on the tile
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      let tileNum = 0
      if ($('#' + i + '-' + j).text() === 'mine') {
        continue
      }
      if (i === 0 && j === 0) {
        // check top left corner
        // code to check corner case
        if ($('#' + (i + 1) + '-' + j).text() === 'mine') {
          tileNum++
        }
        if ($('#' + i + '-' + (j + 1)).text() === 'mine') {
          tileNum++
        }
        if ($('#' + (i + 1) + '-' + (j + 1)).text() === 'mine') {
          tileNum++
        }
        $('#' + i + '-' + j).text(tileNum)
      } else if (i === 0 && j === columns - 1) {
        // check top right corner
        // code to check corner case
        if ($('#' + (i + 1) + '-' + j).text() === 'mine') {
          tileNum++
        }
        if ($('#' + i + '-' + (j - 1)).text() === 'mine') {
          tileNum++
        }
        if ($('#' + (i + 1) + '-' + (j - 1)).text() === 'mine') {
          tileNum++
        }
        $('#' + i + '-' + j).text(tileNum)
      } else if (i === rows - 1 && j === 0) {
        // ceck bottom left corner
        // code to check corner case
        if ($('#' + (i - 1) + '-' + j).text() === 'mine') {
          tileNum++
        }
        if ($('#' + i + '-' + (j + 1)).text() === 'mine') {
          tileNum++
        }
        if ($('#' + (i - 1) + '-' + (j + 1)).text() === 'mine') {
          tileNum++
        }
        $('#' + i + '-' + j).text(tileNum)
      } else if (i === rows - 1 && j === columns - 1) {
        // check bottom right corner
        // code to check corner case
        if ($('#' + (i - 1) + '-' + j).text() === 'mine') {
          tileNum++
        }
        if ($('#' + i + '-' + (j - 1)).text() === 'mine') {
          tileNum++
        }
        if ($('#' + (i - 1) + '-' + (j - 1)).text() === 'mine') {
          tileNum++
        }
        $('#' + i + '-' + j).text(tileNum)
      } else if (i === 0) {
        // check top edge
        // code to check edge
        if ($('#' + i + '-' + (j + 1)).text() === 'mine') {
          tileNum++
        }
        if ($('#' + i + '-' + (j - 1)).text() === 'mine') {
          tileNum++
        }
        if ($('#' + (i + 1) + '-' + (j + 1)).text() === 'mine') {
          tileNum++
        }
        if ($('#' + (i + 1) + '-' + (j - 1)).text() === 'mine') {
          tileNum++
        }
        if ($('#' + (i + 1) + '-' + j).text() === 'mine') {
          tileNum++
        }
        $('#' + i + '-' + j).text(tileNum)
      } else if (j === 0) {
        // check left edge
        // code to check edge
        if ($('#' + (i - 1) + '-' + j).text() === 'mine') {
          tileNum++
        }
        if ($('#' + (i + 1) + '-' + j).text() === 'mine') {
          tileNum++
        }
        if ($('#' + (i - 1) + '-' + (j + 1)).text() === 'mine') {
          tileNum++
        }
        if ($('#' + i + '-' + (j + 1)).text() === 'mine') {
          tileNum++
        }
        if ($('#' + (i + 1) + '-' + (j + 1)).text() === 'mine') {
          tileNum++
        }
        $('#' + i + '-' + j).text(tileNum)
      } else if (i === rows - 1) {
        // check bottom edge
        // code to check edge
        if ($('#' + i + '-' + (j - 1)).text() === 'mine') {
          tileNum++
        }
        if ($('#' + (i - 1) + '-' + (j - 1)).text() === 'mine') {
          tileNum++
        }
        if ($('#' + (i - 1) + '-' + j).text() === 'mine') {
          tileNum++
        }
        if ($('#' + (i - 1) + '-' + (j + 1)).text() === 'mine') {
          tileNum++
        }
        if ($('#' + i + '-' + (j + 1)).text() === 'mine') {
          tileNum++
        }
        $('#' + i + '-' + j).text(tileNum)
      } else if (j === columns - 1) {
        // check right edge
        // code to check edge
        if ($('#' + (i - 1) + '-' + j).text() === 'mine') {
          tileNum++
        }
        if ($('#' + (i - 1) + '-' + (j - 1)).text() === 'mine') {
          tileNum++
        }
        if ($('#' + i + '-' + (j - 1)).text() === 'mine') {
          tileNum++
        }
        if ($('#' + (i + 1) + '-' + (j - 1)).text() === 'mine') {
          tileNum++
        }
        if ($('#' + (i + 1) + '-' + j).text() === 'mine') {
          tileNum++
        }
        $('#' + i + '-' + j).text(tileNum)
      } else {
        // check all 3x3 grids
        if ($('#' + (i - 1) + '-' + (j - 1)).text() === 'mine') {
          tileNum++
        }
        if ($('#' + (i - 1) + '-' + j).text() === 'mine') {
          tileNum++
        }
        if ($('#' + (i - 1) + '-' + (j + 1)).text() === 'mine') {
          tileNum++
        }
        if ($('#' + i + '-' + (j + 1)).text() === 'mine') {
          tileNum++
        }
        if ($('#' + (i + 1) + '-' + (j + 1)).text() === 'mine') {
          tileNum++
        }
        if ($('#' + (i + 1) + '-' + j).text() === 'mine') {
          tileNum++
        }
        if ($('#' + (i + 1) + '-' + (j - 1)).text() === 'mine') {
          tileNum++
        }
        if ($('#' + i + '-' + (j - 1)).text() === 'mine') {
          tileNum++
        }
        $('#' + i + '-' + j).text(tileNum)
      }
    }
  }
}

function setGame() {
  flags = mineCount
  $('#time1').attr('src', 'assets/d0.svg')
  $('#time2').attr('src', 'assets/d0.svg')
  $('#time3').attr('src', 'assets/d0.svg')
  startGame()
  flagCounter()
  clickable()
  preventRightClick()
}

function clearTiles() {
  $('.tile').remove()
}

function checkMaxMines() {
  let maxMines = columns * rows
  if (mineCount > maxMines) {
    mineCount = maxMines - 1
  }
}

function flagCounter() {
  let mine1 = 0
  let mine2 = 0
  let mine3 = 0
  mine1 = flags % 10
  mine2 = parseInt(((flags % 100) - mine1) / 10)
  mine3 = parseInt(((flags % 1000) - mine1 - mine2) / 100)
  $('#mine1').attr('src', 'assets/d' + mine3 + '.svg')
  $('#mine2').attr('src', 'assets/d' + mine2 + '.svg')
  $('#mine3').attr('src', 'assets/d' + mine1 + '.svg')
}

function startTimer() {
  startTimer = function () {}
  if (elapsed > 0) return

  interval = setInterval(function () {
    elapsed = elapsed + 1

    if (elapsed === 999) {
      clearInterval(interval)
    }

    let time1 = 0
    let time2 = 0
    let time3 = 0
    time1 = elapsed % 10
    time2 = parseInt(((elapsed % 100) - time1) / 10)
    time3 = parseInt(((elapsed % 1000) - time1 - time2) / 100)
    $('#time1').attr('src', 'assets/d' + time3 + '.svg')
    $('#time2').attr('src', 'assets/d' + time2 + '.svg')
    $('#time3').attr('src', 'assets/d' + time1 + '.svg')
  }, 1000)
}
