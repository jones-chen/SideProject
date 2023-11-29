const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = [] //電影總清單
let filteredMovies = [] //搜尋清單
const MOVIES_PER_PAGE = 12 //每頁幾個電影
let currentPage = 1// 紀錄使用者當前分頁

const dataPanel = document.querySelector('#data-panel') //電影區
const searchForm = document.querySelector('#search-form') //搜尋表單區
const searchInput = document.querySelector('#search-input') //搜尋按鈕區
const paginator = document.querySelector('#paginator')  //分頁
const modeChange = document.querySelector('#change-mode') //模式轉換

//渲染電影
function renderMovieList(data) {
  //如果是卡片模式
  if (dataPanel.dataset.mode === 'card-mode') {
    let rawHTML = ''
    data.forEach((item) => {
      // title, image, id
      rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>`
    })
    dataPanel.innerHTML = rawHTML
  } 
  //如果是list模式
  else if (dataPanel.dataset.mode === 'list-mode') {
    let rawHTML = `<ul class="list-group col-sm-12 mb-2">`
    data.forEach((item) => {
      // title, image, id
      rawHTML += `
      <li class="list-group-item d-flex justify-content-between">
        <h5 class="card-title">${item.title}</h5>
        <div>
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal"
            data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </li>`
    })
    rawHTML += '</ul>'
    dataPanel.innerHTML = rawHTML
  }
}
//渲染分頁器
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}
//根據分頁，取得電影清單
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE

  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}
//more，顯示電影詳細內容
function showMovieModal(id) {
  // get elements
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  // send request to show api
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results

    // insert data into modal ui
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
}
//加入我的最愛
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)

  if (list.some(movie => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// 轉換顯示模式：依 data-mode 切換不同的顯示方式
function changeDisplayMode(displayMode) {
  //與原本的mode相同，則return
  if (dataPanel.dataset.mode === displayMode) return
  //與原本的mode不同，則取代
  dataPanel.dataset.mode = displayMode
}



// 監聽：點擊more、＋
dataPanel.addEventListener('click', function onPanelClicked(event) {
  //顯示電影細節
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  //加入我的最愛
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

//監聽：搜尋功能
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(keyword)
  )

  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  currentPage = 1
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(currentPage))
})

//監聽：分頁器功能
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return

  const page = Number(event.target.dataset.page)
  currentPage = page
  renderMovieList(getMoviesByPage(currentPage))
})

// 監聽切換事件
modeChange.addEventListener('click', function onSwitchClicked(event) {
  // 卡片模式被點擊
  if (event.target.matches('#card-mode-button')) {changeDisplayMode('card-mode')}
  // 列表模式被點擊
  else if (event.target.matches('#list-mode-button')) {changeDisplayMode('list-mode')}
  renderMovieList(getMoviesByPage(currentPage))
})


// 呈現原本電影
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(currentPage))
  })
  .catch(err => console.log(err))