const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const {c, cpp, node, python, java} = require('compile-run');

const DIR = '/Users/kushal_code/Desktop/OnlineIDE/BackEnd/routes/code/';

router.post('/compile', (req,res,next) => {
    const lang = req.body.language;
    const code = req.body.code;
    const stdin = req.body.stdin;
    console.log(lang + " " + code + " " + stdin);
    if(lang === 'c_cpp') {
        fs.writeFileSync('/Users/kushal_code/Desktop/OnlineIDE/BackEnd/routes/code/1.cpp',code);
        cpp.runFile('/Users/kushal_code/Desktop/OnlineIDE/BackEnd/routes/code/1.cpp',{stdin: stdin}, (err,result) => {
            if(err) {
                console.log(err);
                res.send(err);
            }else{
                console.log(result);
                res.send(result);
            }
        });

    }else if(lang == 'python') {
        fs.writeFileSync(DIR + '2.py',code);
        python.runFile(DIR + '2.py',stdin, (err,result) => {
            if(err) {
                res.send(err);
            }else{
                res.send(result);
            }
        });

    }else if(lang == 'java') {
        fs.writeFileSync(DIR + '3.java',code);
        java.runFile(DIR + '3.java',stdin, (err,result) => {
            if(err) {
                res.send(err);
            }else{
                res.send(result);
            }
        });
    }
});
module.exports = router;