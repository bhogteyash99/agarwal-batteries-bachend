require('dotenv/config');


const cookieParser = require('cookie-parser');
const cors = require('cors');
const { verify } = require('jsonwebtoken');
const { hash, compare } = require('bcryptjs');

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));




mongoose.connect("mongodb+srv://agarwalbatteries2021:Yash%400312@cluster0.mljzw.mongodb.net/UserData?retryWrites=true&w=majority", {useNewUrlParser: true,useUnifiedTopology: true});
const DataSchema = {
  email: String,
  password: String,
  name: String,
  phn: String,
  role: String
};

const userD = mongoose.model("UserData", DataSchema);

const {
       sendAccessToken,    
    createAccessToken, 
    createRefreshToken
} = require('./token');

const server = express();
server.use(cookieParser());

server.use(cors(
    {
        origin:'http://localhost:3500',
        credentials:true,
    }
));

server.use(express.json());
server.use(express.urlencoded({extended:true}));



server.post('/register',async(req,res) =>{
    const {email, password ,name , phn, role } = req.body;
    let user = await userD.findOne({ email: email });
    try{
        const hashedPassword = await hash(password, 10);
        if (user) {
            return res.status(400).send('That user already exisits!');
        } else {
            // Insert the new user if they do not exist yet
            user = new userD({
                email: email,
                password: hashedPassword,
                name:name,
                phn: phn,
                role: role
            });
            await user.save();
            res.send('Registration Successful');
        }
    }catch(err){
        res.send({
            error: `${err.message}`,
        });
    }
});

server.post('/login', async(req,res) => {
    const { email, password } = req.body;
   
    try{
       // username chk    
       let user = await userD.findOne({ email: email });
        if(!user)throw new Error("User Doesnt exists");
        
  
        //password chk
        const valid = await compare(password, user.password);
       
        if(valid) {
           
            const accesstok = createAccessToken(user.id);
            const refreshtok = createRefreshToken(user.id);
            user.refreshtok = refreshtok;
            console.log(userD);

            sendAccessToken(res,req,accesstok,refreshtok);
        }else{
            throw new Error ("password not matched");
        }

    }catch(err){
        res.send({
            error: `${err.message}`,
        })
    }

});








server.listen(process.env.PORT, () => 
console.log("Server Online now"),
);