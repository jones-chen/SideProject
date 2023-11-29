const BASE_URL = 'https://user-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/users/'

let filteredFriends = []
const FRIENDS_PER_PAGE = 12//每頁的名單數量

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const paginator = document.querySelector('#paginator')
//朋友清單從 localStorage 取出
const friends = JSON.parse(localStorage.getItem('favoriteFriends'))

//渲染朋友清單-輸入為  array
function renderFriendList(data) {
  let rawHTML = ''
  data.forEach(item => {
    // 圖片(avatar)、姓名(name+surname)、按鈕(More)、按鈕(＋)、綁data-id
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${item.avatar}" class="card-img-top" alt="info-avatar">
        <div class="card-body">
          <h5 class="card-title">${item.name} ${item.surname}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-info" data-toggle="modal" data-target="#info-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">X</button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
}

//根據id，顯示查看人物詳細資料
function showInfoModal(id) {
  // 定位
  const modalTitle = document.querySelector('#info-modal-title')
  const modalAvator = document.querySelector('#info-modal-avator')
  const modalDetail = document.querySelector('#info-modal-detail')

  // axios 爬取朋友清單 api
  axios.get(INDEX_URL + id).then(response => {
    const data = response.data
    // insert data into modal ui
    modalTitle.innerText = `${data.name} ${data.surname}`
    modalAvator.innerHTML = `
      <img
        src="${data.avatar}"
        alt="info-avatar" class="img-fluid" />
      `
    modalDetail.innerHTML = `
      <p id="modal-age">age: ${data.age}</p>
      <p id="modal-gender">gender: ${data.gender}</p>
      <p id="modal-region">region: ${data.region}</p>
      <p id="modal-birthday">birthday: ${data.birthday}</p>
      <p id="modal-email">email: ${data.email}</p>
      `
  })
}

//渲染 分頁器
function renderPaginator(friendsList) {
  //總人數
  amount = friendsList.length
  //確認總頁數(數量/每頁人數)
  const totalNumberOfPages = Math.ceil(amount / FRIENDS_PER_PAGE)
  let rawHTML = ''
  //渲染 分頁HTML、綁data-page
  for (let page = 1; page <= totalNumberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

//根據頁碼，取得篩選器名單內，本分頁該顯示哪些名單
function getFriendsByPage(page) {
  //決定輸入的 朋友array 是誰(篩選器or全部)
  const data = filteredFriends.length ? filteredFriends : friends
  //取出區塊(起始位置+本頁人數)
  const startIndex = (page - 1) * FRIENDS_PER_PAGE
  let nameList = data.slice(startIndex, startIndex + FRIENDS_PER_PAGE)
  return nameList
}

// 從我的最愛移除
function removeFromFavorite(id) {
  //空陣列
  // if (!friends) return

  //
  const friendIndex = friends.findIndex(friend => friend.id === id)
  //若無此id，則return
  if (friendIndex === -1) return
  //從陣列取出該元素，並遺棄
  friends.splice(friendIndex, 1)
  //裝回localStorage
  localStorage.setItem('favoriteFriends', JSON.stringify(friends))
  //重新渲染朋友清單畫面
  renderFriendList(friends)
}


//監聽：點取More 或是 收藏/移除
dataPanel.addEventListener('click', function panelClicked(event) {
  //點取 More，傳入id
  if (event.target.matches('.btn-show-info')) {
    showInfoModal(event.target.dataset.id)
  //點取 收藏，傳入id
  } else if (event.target.matches('.btn-add-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

//監聽：search 被點擊
searchForm.addEventListener('submit', function SearchSubmitted(event) {
  //防止重新整理
  event.preventDefault()
  //取得輸入的關鍵字(去除空白、統一轉小寫處理)
  const searchInput = document.querySelector('#search-input')
  const keyword = searchInput.value.trim().toLowerCase()
  //從所有朋友清單，取出名字(name,surname)有包含該字串的
  filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(keyword) ||       
    friend.surname.toLowerCase().includes(keyword)
  )
  //從所有朋友清單，取出名字(name,surname)有包含該字串的
  if (filteredFriends.length === 0) {
    return alert(`你的朋友圈裡名字沒有 ${keyword} 相關的人`)
  }
  // 重新渲染 朋友清單、分頁清單
  renderPaginator(filteredFriends)
  renderFriendList(getFriendsByPage(1))
})

//監聽：分頁按鈕被點擊
paginator.addEventListener('click', function paginatorClicked(event) {
  //如果被點的不是 a 標籤,結束
  if (event.target.tagName !== 'A') return
  //讀取被點擊的頁碼(dataSet，字串轉數字)
  const page = Number(event.target.dataset.page)
  //重新渲染朋友清單
  renderFriendList(getFriendsByPage(page))
})

// 一進入此頁面時，先渲染
renderPaginator(friends)
renderFriendList(getFriendsByPage(1))