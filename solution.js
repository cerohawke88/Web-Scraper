/** web scraper for cermati article
  * made by: M. Rizky Widyayulianto
*/

const rp = require('request-promise')
const cheerio = require('cheerio')
var fs = require('fs')

const url = 'https://www.cermati.com/artikel'
const cermati = 'https://www.cermati.com'

var list = []
var listArticles = []

rp(url)
    .then(function(html){
        // load all the article link
        var $ = cheerio.load(html)
        $('div.article-list-item').map((i, element) => {
            var link = $(element).find('a').attr('href')
            
            // add https
            link = cermati.concat(link)

            list.push(link)
        })

        // get all detail for each article
        list.forEach(function(element, i){
            rp(element)
                .then(function(linkArticles){
                    var $ = cheerio.load(linkArticles)

                    // article title
                    var title = $('h1.post-title').text().trim()

                    // article author
                    var author = $('span.author-name').text().trim()

                    // article posting date
                    var date = $('span.post-date').find('span').text().trim()

                    // related articles
                    var relatedArticles = []
                    $('h4:contains("Artikel Terkait")').next().find('li').map((i, relArt) => {
                        var link = $(relArt).find('a').attr('href')
                        var titleArticle = $(relArt).find('h5').text().trim()
                        var relatedArticle = {
                            "url": link,
                            "title": titleArticle,
                        }
                        relatedArticles.push(relatedArticle)
                    })

                    // make JSON Object
                    var article = {
                        "url": element,
                        "title": title,
                        "author": author,
                        "postingDate": date,
                        "relatedArticles": relatedArticles
                    }

                    listArticles.push(article)
                })
                .catch(function(error) {
                    console.log(error)
                })
                .finally(function() {
                    // check if it's on last article
                    if (i === list.length - 1){
                        var articles = {
                            "articles": listArticles
                        }
                        var jsonArticle = JSON.stringify(articles);
                        fs.writeFileSync("solution.json", jsonArticle)
                    }
                })
        })
    })
    .catch(function(error){
        console.log(error)
    })