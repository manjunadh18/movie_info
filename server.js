const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require('firebase-admin/firestore');
const express = require('express');
const app = express();
var admin = require("firebase-admin");
const ejs = require ('ejs');
const bp = require('body-parser');
const axios = require('axios');
const passH = require('password-hash');
const alert = require('alert');

app.use(bp.json());
app.use(bp.urlencoded({extended: true}));
app.set('view engine','ejs');

var serviceAccount = require("./key1.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = getFirestore();

app.get('/',function(req,res){
    res.sendFile(__dirname + "/home.html")
})

app.get('/signup',function(req,res){
    res.render("signup",{errMsg: ""});
})
app.post('/signupSubmit',function(req,res){ 
    const uname = req.body.Uname;
    const email = req.body.email;
    const pass =  req.body.password;
    const c_pass = req.body.password1;

    db.collection("users").where("Email", "==", email).get().then((docs)=>{
        if(docs.size == 0){
            if(pass == c_pass){
                db.collection("users").add({
                    User_Name:uname,
                    Email:email,
                    Password: passH.generate(pass)
                }).then(()=>{
                    res.render('login', {errMsg: ""})
                });
            }else{
                res.render('signup', {errMsg : "Password Not matched"})
            }
        }else{
            res.render('signup', {errMsg: "User Already Exist"})
        }
    })
    

})

app.get('/login',function(req,res){
    res.render("login",{errMsg: ""});
})

app.post('/loginSubmit',function(req,res){
    const Email = req.body.login;
    const pass = req.body.password;
    db.collection('users').where("Email","==",Email).get().then((docs) =>{
    //    console.log(docs);
        if(docs.size>0){
            let verified = false;
            docs.forEach((doc) =>{
                verified = passH.verify(pass, doc.data().Password)
            });
            if(verified){
                // res.redirect("/getMovie");
                res.render('movie')
            }else{
                res.render("login",{errMsg: "Password Incorrect"})
            }
        }else{
            res.render('login', {errMsg: "User Doesn't Exist"})        
        }
    })
})

app.post('/getMovie',(req,res)=>{
    const movie = req.body.movie;
    console.log(movie);
    const apiurl=`https://www.omdbapi.com/?apikey=da3f0ace&t=${movie}`;
    axios.get(apiurl)
    .then((response)=>{
        if(response.data.Response == 'True'){
            const data = response.data;
            console.log(data);
            const Title = response.data.Title;
            const Director=response.data.Director;
            const Actors = response.data.Actors;
            const Released =response.data.Released;
            const imdbRating =response.data.imdbRating;
            const Genre = response.data.Genre;
            const Writer = response.data.Writer;
            const Poster = response.data.Poster;
            const Plot = response.data.Plot;
            console.log(Title);
            console.log(Director);
            console.log(Actors);
            console.log(Genre);
            console.log(Writer);
            console.log(Poster);
            console.log(Plot);
            console.log(Released);


            res.render('get_movie.ejs',{
                Title:Title,
                Director:Director,
                Actors:Actors,
                Released:Released,
                imdbRating:imdbRating,
                Genre:Genre,
                Writer:Writer,
                Poster:Poster,
                Plot:Plot
            })
        }else{
            alert("Movie not fouund")
        }
    })
})
app.listen(3000,()=>{
    console.log("Server started");
})
