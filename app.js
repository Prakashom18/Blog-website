const express = require('express');
const app = express();
const path = require('path');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser');
const userModel = require('./models/userModel')
const postModel = require('./models/postModel')
const multerconfig = require('./config/userconfig')

app.use(express.json())
app.use(express.static(path.join(__dirname,'public')))
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'public')));
app.use(cookieParser());

app.set('view engine','ejs')

app.get('/',(req,res)=>{
    res.render('index');
})

app.post('/register',async (req,res)=>{
    let {username,name,age,email,password} = req.body;

    let user = await userModel.findOne({email});
    if(user) return res.status(409).send("User already Exists");

    bcrypt.genSalt(10, (err,salt)=>{
        bcrypt.hash(password,salt,async (err,hash)=>{
          let user =   await userModel.create({
                username,
                name,
                age,
                email,
                password : hash
            })
           let token =  jwt.sign({email:email,userid : user._id},"secretkey");
            res.cookie("token",token);
            res.send('registered')
        })
    })
})

app.get('/login',(req,res)=>{
    res.render('login')
})

app.post('/login',async (req,res)=>{
    let {email,password} = req.body;

    let user = await userModel.findOne({email});
    if(!user) return res.status(500).send("Something went wrong");
    bcrypt.compare(password,user.password,(err,result)=>{
        if(result) {
           
            let token = jwt.sign({email:email, userid:user._id},"secretkey")
            res.cookie("token",token);
            res.redirect('/profile');
        }
        else {
            res.redirect('/login')
        }
    
    })
})


// for the finding and attaching the posts to the user
// await userModel.findOne({email:req.user.email}).populate("posts");

app.get('/profile',isLoggedin,async (req,res)=>{
    let user = await userModel.findOne({email:req.user.email}).populate("posts")
    res.render('profile',{user})
})

app.post('/post',isLoggedin,async (req,res)=>{
    let user = await userModel.findOne({email:req.user.email})
    let {content} = req.body;
    let post = await postModel.create({
        user : user._id,
        content
    })
    user.posts.push(post._id);
    await user.save();
    res.redirect('/profile')
})

app.get('/like/:id',isLoggedin,async (req,res)=>{
    let post = await postModel.findOne({_id:req.params.id}).populate("user");
    if(post.likes.indexOf(req.user.userid)===-1){
        post.likes.push(req.user.userid);
     
    }
    else{
       post.likes.splice(post.likes.indexOf(req.user.userid),1);
    }
         await post.save();  
    // console.log(req.user);
    res.redirect("/profile")  
    

})

app.get('/edit/:id',isLoggedin,async (req,res)=>{
    let post = await postModel.findOne({_id:req.params.id}).populate("user");
    // console.log({post})
    res.render('edit',{post});
})

app.post('/update/:id',isLoggedin, async (req,res)=>{
    let post = await postModel.findOneAndUpdate({_id:req.params.id},{content:req.body.content}).populate("user")
    res.redirect("/profile");
})

app.get('/logout',(req,res)=>{
    res.cookie("token","");
    res.redirect("Login")
})

function isLoggedin(req,res,next){
   if(req.cookies.token === ""){
    res.redirect('/login')
   }
   else{
   let data = jwt.verify(req.cookies.token,"secretkey");
   req.user = data;
   }
    next();
}

app.listen(3000,(err)=>{
    console.log('running on port 3000');
})