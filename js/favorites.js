class GithubUser { 
    static search(username) { // static method provides the communication between data from github API and the application
        const endpoint = `https://api.github.com/users/${username}`

        return fetch(endpoint)
        .then(data => data.json()) // data obtained from the github API is transformed into .json to be organized into an object
        .then(data => ({
            login: data.login,
            name: data.name,
            public_repos: data.public_repos,
            followers: data.followers
        }))
    }
}

// Data structure

export class FavoritesData {
    constructor(root){ // this function is to be executed as soon as the page is loaded
    this.root = document.querySelector(root) // this.root receives all the content of #app div
    this.tbody = this.root.querySelector('table tbody')

    this.load()

    }

    load() {
        this.entries = JSON.parse(localStorage.getItem('@gitfav:')) || []
    }

    save() {
        localStorage.setItem('@gitfav:', JSON.stringify(this.entries))
    }

    async add(username){ // the username typed into the input serves as an argument to github search
        try {

            let userExists = this.entries.find(entry => entry.login === username)
            if (userExists) {
                throw new Error ('User already registered.') 
            }

            const user = await GithubUser.search(username)

            if (user.login === undefined){
                throw new Error ('User could not be found.')
            } else {
                this.entries = [
                    user,
                    ...this.entries
                ]

                this.update()
                this.save()
            }

        } catch(error) {
            alert(error.message)
        }


    }

    delete(user) { 

        let entriesFilter = this.entries
        .filter(entry => {
            let isDifferent = (entry.login !== user.login)
            return isDifferent // if the variable isDifferent posess a FALSE value, .filter method deletes the entry from array 
        })

        this.entries = entriesFilter // the array this.entries is then updated, preserving immutability concept

        this.update()
        this.save()
    }
}

// HTML updates

export class FavoritesDisplay extends FavoritesData {
    constructor(root){
        super(root) // Class linkage
        
        this.update()
        this.favoriteUser()
        
    }
    
    update(){ // function that updates the page when a change is made. Must be executed on every interaction.
        
        this.tableRowsReset() // the first thing to be executed when the page is updated is reseting the table

        console.log(this.entries)
        
        let noFavBg = document.querySelector('.no-fav-bg')
        let trFirstChild = document.querySelector('.user-row')
        let trLastChild = document.querySelector('.action-row')

        if (this.entries.length !== 0){
            noFavBg.setAttribute('id', 'hide')

            trFirstChild.style.borderRadius = '1.2rem 0 0 0' // this is for updating thead border-radius
            trLastChild.style.borderRadius = '0 1.2rem 0 0'

        } else {
            noFavBg.removeAttribute('id', 'hide')
            trFirstChild.style.borderRadius = '1.2rem 0 0 1.2rem' // this is for updating thead border-radius
            trLastChild.style.borderRadius = '0 1.2rem 1.2rem 0'
        }
        
        this.entries
        .forEach (user => {

            const row = this.createRow() // variable row receives the HTML structure as the createRow() return. The HTML is then update through DOM.

            row.querySelector('.user img').src = `https://github.com/${user.login}.png`

            row.querySelector('.user img').alt = `${user.name} profile image`

            row.querySelector('.user a').href = `https://github.com/${user.login}`

            row.querySelector('.user p').textContent = user.name

            row.querySelector('.user span').textContent = user.login

            row.querySelector('.repositories').textContent = user.public_repos

            row.querySelector('.followers').textContent = user.followers

            row.querySelector('.remove').addEventListener('click', () => {

                let isOk = confirm ("Delete this user?")
                if (isOk) {
                    this.delete(user)
                }
            })

            this.root.querySelector('#search-user-input').value = ""

            this.tbody.append(row) // the .append method adds the row created by DOM to the index.HTML of the application
        })


    } 

     favoriteUser() {
        
        this.addButton = this.root.querySelector('.favorite')
        this.addButton.addEventListener('click', () => {
            const { value } = this.root.querySelector('#search-user-input')

            this.add(value)
        })
     }

    // Table change functions:

    createRow(){

        let tr = document.createElement('tr') // the <tr> tag is created by DOM for the HTML format application

        tr.innerHTML = `

        <td class="user">
            <a href="">
            <img src="" alt="Aqui deveria ter uma imagem">
                <div class='user-info'>
                <p>Victor</p>
                /<span>victoralva08</span>
                </div>
            </a>
        </td>

        <td class="repositories">123</td>

        <td class="followers">123</td>

        <td>
            <button class="remove">Remove</button>
        </td>

        `

        return tr
    }

    tableRowsReset(){ // function for cleaning previous HTML content
        this.tbody.querySelectorAll('tr')
            .forEach((tr) => { // this method will clear all rows that exists from the HTML format, reseting the table
                tr.remove()
            })

    }
}