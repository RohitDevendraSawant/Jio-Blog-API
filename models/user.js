import fs from "fs";

export class User{
    constructor(email, password) {
        this.email = email;
        this.password = password;
    }

    saveUser(){
        let newUser = {
            "email" : this.email,
            "password" : this.password
        } 
        
        fs.readFile('./data/user.json', 'utf8', function (err, data) {
            if (err) {
                console.log(err);
            } else {
                if (data == undefined || data == '') {
                    var obj = {
                        'users': []
                    }
                }
                else {
                    var obj = JSON.parse(data); 
                }
                obj.users.push(newUser);
                let jsonData = JSON.stringify(obj); 
                fs.writeFile('./data/user.json', jsonData, (err)=>{console.log(err);}); 
            }
        });
    }
    

    
}