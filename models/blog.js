import fs from "fs";

export class Blog {

    constructor(id, title, author, content, userId) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.content = content;
        this.timestamp = new Date();
        this.userId = userId;
    }
        
    saveData() {
        let newBlog = {
            "id" : this.id,
            "title" : this.title,
            "author" : this.author,
            "content" : this.content,
            "timestamp" : this.timestamp,
            "userId" : this.userId
        } 
        
        fs.readFile('./data/db.json', 'utf8', function (err, data) {
            if (err) {
                console.log(err);
            } else {
                if (data == undefined || data == '') {
                    var obj = {
                        'list': []
                    }
                }
                else {
                    var obj = JSON.parse(data); 
                }
                obj.list.push(newBlog);
                let jsonData = JSON.stringify(obj); 
                fs.writeFile('./data/db.json', jsonData, (err)=>{if (err) {
                    console.log(err);
                }}); 
            }
        });
    }

    

}

