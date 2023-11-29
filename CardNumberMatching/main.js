const GAME_STATE = {
    FirstCardAwaits: 'FirstCardAwaits',
    SecondCardAwaits: 'SecondCardAwaits',
    CardsMatchFailed: 'CardsMatchFailed',
    CardsMatched: 'CardsMatched',
    GameFinished: 'GameFinished'
}

const Symbols = [
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png', // 黑桃
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

const view = {
    getCardElement(index) {
        return `<div data-index="${index}" class="card back"></div>`
    },

    getCardContent(index) {
        const number = this.transformNumber((index % 13) + 1)
        const symbol = Symbols[Math.floor(index / 13)]

        return `
        <p>${number}</p>
        <img src="${symbol}" />
        <p>${number}</p>
      `
    },

    transformNumber(number) {
        switch (number) {
            case 1:
                return 'A'
            case 11:
                return 'J'
            case 12:
                return 'Q'
            case 13:
                return 'K'
            default:
                return number
        }
    },

    displayCards(indexes) {
        const rootElement = document.querySelector('#cards')
        rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
    },
    //將牌翻過來（可能正轉反，也可以反轉正）
    flipCards(...cards) {
        cards.map(card => {
            // 若現在是背面，則翻到正面
            if (card.classList.contains('back')) {
                card.classList.remove('back')
                card.innerHTML = this.getCardContent(Number(card.dataset.index))
                return
            }
            // 若現在是正面，則加上back
            card.classList.add('back')
            card.innerHTML = null
        })
    },

    pairCards(...cards) {
        cards.map(card => {
            card.classList.add('paired')
        })
    },

    renderScore(score) {
        document.querySelector('.score').textContent = `Score: ${score}`
    },

    renderTriedTimes(times) {
        document.querySelector('.tried').textContent = `You've tried: ${times} times`
    },

    appendWrongAnimation(...cards) {
        cards.map(card => {
            card.classList.add('wrong')
            card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
        })
    },

    showGameFinished() {
        const div = document.createElement('div')

        div.classList.add('completed')
        div.innerHTML = `
        <p>Complete!</p>
        <p>Score: ${model.score}</p>
        <p>You've tried: ${model.triedTimes} times</p>
      `
        const header = document.querySelector('#header')
        header.before(div)
    }
}

const model = {
    revealedCards: [],

    isRevealedCardsMatched() {
        return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
    },

    score: 0,

    triedTimes: 0
}

const controller = {
    //設定當前狀況，初始值FirstCardAwaits
    currentState: GAME_STATE.FirstCardAwaits,

    //產生牌組
    generateCards() {
        view.displayCards(utility.getRandomNumberArray(52))
    },

    //卡牌被點擊時
    dispatchCardAction(card) {
        //點到如果翻到不是背面的＝正面，則沒反應
        if (!card.classList.contains('back')) {
            return
        }
        //不同狀態時，不同反應
        switch (this.currentState) {
            //狀態:等待翻第一張
            case GAME_STATE.FirstCardAwaits:
                // 執行翻牌
                view.flipCards(card)
                // 將被翻的牌記錄下來
                model.revealedCards.push(card)
                // 進入到等待翻第二張的狀態
                this.currentState = GAME_STATE.SecondCardAwaits
                break

            //狀態:等待翻第二張
            case GAME_STATE.SecondCardAwaits:
                // 渲染翻牌紀錄(翻兩張，算一次)
                view.renderTriedTimes(++model.triedTimes)
                // 執行翻牌
                view.flipCards(card)
                // 將被翻的牌記錄下來
                model.revealedCards.push(card)

                // 判斷配對是否成功
                if (model.isRevealedCardsMatched()) {
                    // 配對成功
                    // 分數加10
                    view.renderScore(model.score += 10)
                    
                    //進入新狀態：媒合成功
                    this.currentState = GAME_STATE.CardsMatched
                    // 將撲克牌加上新的class，不蓋回去了
                    view.pairCards(...model.revealedCards)
                    // 已翻紀錄清空
                    model.revealedCards = []

                    //若分數到達260分
                    if (model.score === 260) {
                        console.log('showGameFinished')
                        //進入新狀態：遊戲結束
                        this.currentState = GAME_STATE.GameFinished
                        view.showGameFinished() //顯示結果
                        return
                    }
                    
                    //分數還沒到，進入新狀態：等待翻第一張
                    this.currentState = GAME_STATE.FirstCardAwaits
                } else {
                    // 配對失敗
                    this.currentState = GAME_STATE.CardsMatchFailed
                    // 失敗動畫
                    view.appendWrongAnimation(...model.revealedCards)
                    // 等一秒後，把牌蓋回去
                    setTimeout(this.resetCards, 1000)
                }
                break
        }
        console.log('this.currentState', this.currentState)
        console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
    },
    // 把牌蓋回去
    resetCards() {
        view.flipCards(...model.revealedCards)
        //清空打開的牌
        model.revealedCards = []
        //進入新狀態：等待第一張
        controller.currentState = GAME_STATE.FirstCardAwaits
    }
}

const utility = {
    //取得[0,1,2,3...,count-1]的亂數陣列
    getRandomNumberArray(count) {
        //產生[0,1,2,3...,51]
        const number = Array.from(Array(count).keys())
        //從最後一個開始，與前面的對調位置...長度是52, index=51, ，可以跟前51個換
        for (let index = number.length - 1; index > 0; index--) {
            let randomIndex = Math.floor(Math.random() * (index + 1))
                ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
        }
        return number
    }
}

controller.generateCards()

//監聽卡牌是否有被點擊
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', event => {
        controller.dispatchCardAction(card)
    })
})